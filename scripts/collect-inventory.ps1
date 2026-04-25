param(
    [string]$OutputDir = (Join-Path (Split-Path $PSScriptRoot -Parent) "inventory"),
    [string]$CodexHome = $(if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME ".codex" }),
    [string]$ClaudeHome = $(if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $HOME ".claude" })
)

$ErrorActionPreference = "Stop"

function Read-JsonSafe {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        return $null
    }

    try {
        return Get-Content -Raw -LiteralPath $Path | ConvertFrom-Json
    }
    catch {
        return [PSCustomObject]@{
            parseError = $_.Exception.Message
            path = $Path
        }
    }
}

function Get-FirstHeading {
    param([string]$Path)

    $match = Select-String -Path $Path -Pattern "^# " | Select-Object -First 1
    if ($match) {
        return $match.Line.Trim()
    }

    return ""
}

function Get-SkillFiles {
    param(
        [string]$Root,
        [string]$Kind
    )

    if (-not (Test-Path -LiteralPath $Root)) {
        return @()
    }

    return @(
        foreach ($file in Get-ChildItem -Recurse -Force -LiteralPath $Root -Filter "SKILL.md" -ErrorAction SilentlyContinue) {
            $dir = Split-Path $file.FullName -Parent
            [PSCustomObject]@{
                kind = $Kind
                name = Split-Path $dir -Leaf
                title = Get-FirstHeading -Path $file.FullName
                path = $file.FullName
                lastWriteTime = $file.LastWriteTime.ToString("o")
            }
        }
    )
}

function Get-PluginManifests {
    param(
        [string]$Root,
        [string]$ManifestFolder
    )

    if (-not (Test-Path -LiteralPath $Root)) {
        return @()
    }

    return @(
        foreach ($file in Get-ChildItem -Recurse -Force -LiteralPath $Root -Filter "plugin.json" -ErrorAction SilentlyContinue) {
            if ($ManifestFolder -and ($file.Directory.Name -ne $ManifestFolder)) {
                continue
            }

            $manifest = Read-JsonSafe -Path $file.FullName
            [PSCustomObject]@{
                name = $manifest.name
                version = $manifest.version
                description = $manifest.description
                path = $file.FullName
                lastWriteTime = $file.LastWriteTime.ToString("o")
            }
        }
    )
}

function Get-ClaudeInstalledPlugins {
    param([string]$ClaudeHome)

    $installedPath = Join-Path $ClaudeHome "plugins\installed_plugins.json"
    $installed = Read-JsonSafe -Path $installedPath
    if (-not $installed -or -not $installed.plugins) {
        return @()
    }

    $rows = New-Object System.Collections.Generic.List[object]
    foreach ($pluginKey in $installed.plugins.PSObject.Properties.Name) {
        foreach ($entry in $installed.plugins.$pluginKey) {
            $manifestPath = Join-Path $entry.installPath ".claude-plugin\plugin.json"
            $manifest = Read-JsonSafe -Path $manifestPath

            $rows.Add([PSCustomObject]@{
                key = $pluginKey
                name = $manifest.name
                version = $entry.version
                scope = $entry.scope
                installPath = $entry.installPath
                installedAt = $entry.installedAt
                lastUpdated = $entry.lastUpdated
                gitCommitSha = $entry.gitCommitSha
                description = $manifest.description
                manifestPath = $manifestPath
            })
        }
    }

    return $rows.ToArray()
}

function Get-ClaudeMarketplaces {
    param([string]$ClaudeHome)

    $path = Join-Path $ClaudeHome "plugins\known_marketplaces.json"
    $known = Read-JsonSafe -Path $path
    if (-not $known) {
        return @()
    }

    return @(
        foreach ($name in $known.PSObject.Properties.Name) {
            $entry = $known.$name
            [PSCustomObject]@{
                name = $name
                source = $entry.source.source
                repo = $entry.source.repo
                installLocation = $entry.installLocation
                lastUpdated = $entry.lastUpdated
                autoUpdate = $entry.autoUpdate
            }
        }
    )
}

function Format-TableLines {
    param(
        [object[]]$Rows,
        [string[]]$Columns
    )

    if (-not $Rows -or $Rows.Count -eq 0) {
        return @("_No items found._", "")
    }

    $lines = New-Object System.Collections.Generic.List[string]
    $lines.Add("| " + ($Columns -join " | ") + " |")
    $lines.Add("| " + (($Columns | ForEach-Object { "---" }) -join " | ") + " |")

    foreach ($row in $Rows) {
        $values = foreach ($col in $Columns) {
            $value = $row.$col
            if ($null -eq $value) { "" } else { ($value.ToString() -replace "\|", "\|" -replace "`r?`n", " ") }
        }
        $lines.Add("| " + ($values -join " | ") + " |")
    }

    $lines.Add("")
    return $lines.ToArray()
}

function Add-MarkdownLines {
    param(
        [System.Collections.Generic.List[string]]$List,
        [object[]]$Lines
    )

    foreach ($line in $Lines) {
        $List.Add([string]$line)
    }
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$codexSkillRoot = Join-Path $CodexHome "skills"
$codexPluginRoot = Join-Path $CodexHome "plugins"
$claudePluginRoot = Join-Path $ClaudeHome "plugins"
$claudeSkillRoot = Join-Path $ClaudeHome "skills"

$codexDirectSkills = Get-SkillFiles -Root $codexSkillRoot -Kind "codex-skill"
$codexPlugins = Get-PluginManifests -Root $codexPluginRoot -ManifestFolder ".codex-plugin"
$codexPluginSkills = Get-SkillFiles -Root $codexPluginRoot -Kind "codex-plugin-skill"

$claudeInstalledPlugins = Get-ClaudeInstalledPlugins -ClaudeHome $ClaudeHome
$claudeInstalledSkillRoots = @(
    foreach ($plugin in $claudeInstalledPlugins) {
        $skillRoot = Join-Path $plugin.installPath "skills"
        if (Test-Path -LiteralPath $skillRoot) {
            $skillRoot
        }
    }
)
$claudeInstalledPluginSkills = @(
    foreach ($root in $claudeInstalledSkillRoots) {
        Get-SkillFiles -Root $root -Kind "claude-installed-plugin-skill"
    }
)
$claudeStandaloneSkills = Get-SkillFiles -Root $claudeSkillRoot -Kind "claude-skill"
$claudeMarketplaces = Get-ClaudeMarketplaces -ClaudeHome $ClaudeHome
$claudeMarketplacePlugins = Get-PluginManifests -Root (Join-Path $claudePluginRoot "marketplaces") -ManifestFolder ".claude-plugin"

$inventory = [PSCustomObject]@{
    generatedAt = (Get-Date).ToString("o")
    machine = $env:COMPUTERNAME
    user = $env:USERNAME
    paths = [PSCustomObject]@{
        codexHome = $CodexHome
        claudeHome = $ClaudeHome
        outputDir = $OutputDir
    }
    codex = [PSCustomObject]@{
        directSkills = $codexDirectSkills
        plugins = $codexPlugins
        pluginSkills = $codexPluginSkills
    }
    claude = [PSCustomObject]@{
        installedPlugins = $claudeInstalledPlugins
        installedPluginSkills = $claudeInstalledPluginSkills
        standaloneSkills = $claudeStandaloneSkills
        marketplaces = $claudeMarketplaces
        marketplacePlugins = $claudeMarketplacePlugins
    }
}

$jsonPath = Join-Path $OutputDir "current.json"
$mdPath = Join-Path $OutputDir "current.md"

$inventory | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $jsonPath -Encoding UTF8

$md = New-Object System.Collections.Generic.List[string]
$md.Add("# Installed AI Tools Inventory")
$md.Add("")
$md.Add("- Generated: $($inventory.generatedAt)")
$md.Add("- Machine: $($inventory.machine)")
$md.Add("- Codex home: $CodexHome")
$md.Add("- Claude home: $ClaudeHome")
$md.Add("")
$md.Add("## Codex Plugins")
Add-MarkdownLines -List $md -Lines (Format-TableLines -Rows $codexPlugins -Columns @("name", "version", "path"))
$md.Add("## Codex Direct Skills")
Add-MarkdownLines -List $md -Lines (Format-TableLines -Rows $codexDirectSkills -Columns @("name", "title", "path"))
$md.Add("## Codex Plugin Skills")
Add-MarkdownLines -List $md -Lines (Format-TableLines -Rows $codexPluginSkills -Columns @("name", "title", "path"))
$md.Add("## Claude Installed Plugins")
Add-MarkdownLines -List $md -Lines (Format-TableLines -Rows $claudeInstalledPlugins -Columns @("key", "version", "scope", "description"))
$md.Add("## Claude Installed Plugin Skills")
Add-MarkdownLines -List $md -Lines (Format-TableLines -Rows $claudeInstalledPluginSkills -Columns @("name", "title", "path"))
$md.Add("## Claude Standalone Skills")
Add-MarkdownLines -List $md -Lines (Format-TableLines -Rows $claudeStandaloneSkills -Columns @("name", "title", "path"))
$md.Add("## Claude Marketplaces")
Add-MarkdownLines -List $md -Lines (Format-TableLines -Rows $claudeMarketplaces -Columns @("name", "source", "repo", "autoUpdate"))
$md.Add("## Claude Marketplace Plugin Manifests")
Add-MarkdownLines -List $md -Lines (Format-TableLines -Rows $claudeMarketplacePlugins -Columns @("name", "version", "path"))

$md | Set-Content -LiteralPath $mdPath -Encoding UTF8

Write-Host "Wrote $jsonPath"
Write-Host "Wrote $mdPath"
