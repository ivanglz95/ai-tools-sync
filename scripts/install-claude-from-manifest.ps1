param(
    [switch]$Apply,
    [string]$ManifestPath = (Join-Path (Split-Path $PSScriptRoot -Parent) "manifests\current-desired-state.json")
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $ManifestPath)) {
    throw "Manifest not found: $ManifestPath"
}

$manifest = Get-Content -Raw -LiteralPath $ManifestPath | ConvertFrom-Json

if (-not $manifest.claude) {
    throw "Manifest does not contain a claude section: $ManifestPath"
}

function Invoke-Or-Print {
    param(
        [string]$Label,
        [string[]]$Command
    )

    Write-Host $Label
    Write-Host ("  " + ($Command -join " "))

    if ($Apply) {
        $exe = $Command[0]
        $args = if ($Command.Count -gt 1) { $Command[1..($Command.Count - 1)] } else { @() }
        & $exe @args
    }
}

$existingMarketplaces = ""
$existingPlugins = ""

if ($Apply) {
    $existingMarketplaces = try { claude plugin marketplace list | Out-String } catch { "" }
    $existingPlugins = try { claude plugin list | Out-String } catch { "" }
}

foreach ($marketplace in $manifest.claude.marketplaces) {
    if ($marketplace.source -ne "github") {
        Write-Host "Skipping marketplace '$($marketplace.name)': unsupported source '$($marketplace.source)'"
        continue
    }

    if ($Apply -and ($existingMarketplaces -match ("(?m)^\s*>\s+" + [regex]::Escape($marketplace.name) + "\s*$"))) {
        Write-Host "Claude marketplace already configured: $($marketplace.name)"
        continue
    }

    Invoke-Or-Print `
        -Label "Ensure Claude marketplace: $($marketplace.name)" `
        -Command @("claude", "plugin", "marketplace", "add", $marketplace.repo)
}

foreach ($plugin in $manifest.claude.installedPlugins) {
    $pluginId = if ($plugin.id) { $plugin.id } else { $plugin.name }

    if ($Apply -and ($existingPlugins -match ("(?m)^\s*>\s+" + [regex]::Escape($pluginId) + "\s*$"))) {
        Write-Host "Claude plugin already installed: $pluginId"
        continue
    }

    Invoke-Or-Print `
        -Label "Ensure Claude plugin: $pluginId" `
        -Command @("claude", "plugin", "install", $pluginId)
}

if (-not $Apply) {
    Write-Host ""
    Write-Host "Dry run only. Re-run with -Apply to execute these Claude CLI commands."
}
