# install-claude-argi.ps1
# Instala/actualiza el plugin ARGI v4.0.0 en Claude Code para esta PC.

param(
    [string]$ClaudeHome = (Join-Path $env:USERPROFILE ".claude"),
    [switch]$SkipMcp,
    [switch]$SkipDriveDiscovery,
    [switch]$SkipVerify,
    [string]$ArcaPadronTxtPath
)

$ErrorActionPreference = "Stop"

function Require-Command {
    param([string]$Name)
    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if (-not $cmd) {
        throw "No se encontro '$Name' en PATH. Instalarlo antes de continuar."
    }
}

function Copy-ArgiSkill {
    param(
        [string]$Area,
        [string]$PluginRoot,
        [string]$SkillsRoot
    )

    $dest = Join-Path $SkillsRoot "argi-$Area"
    New-Item -ItemType Directory -Force -Path $dest | Out-Null
    New-Item -ItemType Directory -Force -Path (Join-Path $dest "core") | Out-Null
    New-Item -ItemType Directory -Force -Path (Join-Path $dest "memory") | Out-Null

    Copy-Item -LiteralPath (Join-Path $PluginRoot "skills\$Area\SKILL.md") -Destination (Join-Path $dest "SKILL.md") -Force
    Copy-Item -LiteralPath (Join-Path $PluginRoot "core\argi-core.md") -Destination (Join-Path $dest "core\argi-core.md") -Force
}

function Run-Checked {
    param(
        [string]$FilePath,
        [string[]]$Arguments,
        [string]$WorkingDirectory
    )

    Push-Location $WorkingDirectory
    try {
        & $FilePath @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw "Fallo comando: $FilePath $($Arguments -join ' ')"
        }
    } finally {
        Pop-Location
    }
}

$pluginRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$skillsRoot = Join-Path $ClaudeHome "skills"
New-Item -ItemType Directory -Force -Path $skillsRoot | Out-Null

Write-Host "== ARGI Claude install =="
Write-Host "Plugin: $pluginRoot"
Write-Host "Claude home: $ClaudeHome"

Require-Command "bun"
if (-not $SkipMcp) {
    Require-Command "claude"
}

foreach ($area in @("impositivo", "contable", "laboral", "societario")) {
    Copy-ArgiSkill -Area $area -PluginRoot $pluginRoot -SkillsRoot $skillsRoot
    Write-Host "Skill instalada: argi-$area"
}

$mcpRoots = @(
    (Join-Path $pluginRoot "mcp\infoleg-mcp"),
    (Join-Path $pluginRoot "mcp\arca-mcp")
)

foreach ($mcpRoot in $mcpRoots) {
    Write-Host "Instalando dependencias MCP: $mcpRoot"
    Run-Checked -FilePath "bun" -Arguments @("install", "--frozen-lockfile") -WorkingDirectory $mcpRoot
}

if (-not $SkipDriveDiscovery) {
    $discoverScript = Join-Path $pluginRoot "scripts\discover-drive.ps1"
    try {
        & powershell -NoProfile -ExecutionPolicy Bypass -File $discoverScript
        $cachePath = Join-Path $pluginRoot ".argi-path"
        if (Test-Path $cachePath) {
            $argiBase = (Get-Content -LiteralPath $cachePath -Raw).Trim()
            if ($argiBase) {
                [System.Environment]::SetEnvironmentVariable("ARGI_BASE", $argiBase, "User")
                Write-Host "ARGI_BASE usuario: $argiBase"
            }
        }
    } catch {
        Write-Warning "No se pudo detectar Google Drive Desktop ahora. El plugin igual queda instalado; ejecutar scripts/discover-drive.ps1 cuando Drive este disponible."
    }
}

if ($ArcaPadronTxtPath) {
    if (-not (Test-Path -LiteralPath $ArcaPadronTxtPath)) {
        throw "No existe ArcaPadronTxtPath: $ArcaPadronTxtPath"
    }
    [System.Environment]::SetEnvironmentVariable("ARCA_PADRON_TXT_PATH", $ArcaPadronTxtPath, "User")
    Write-Host "ARCA_PADRON_TXT_PATH usuario: $ArcaPadronTxtPath"
}

if (-not $SkipMcp) {
    $infolegRoot = Join-Path $pluginRoot "mcp\infoleg-mcp"
    $arcaRoot = Join-Path $pluginRoot "mcp\arca-mcp"
    $repoRoot = Resolve-Path -LiteralPath (Join-Path $pluginRoot "..")

    & claude plugin marketplace add $repoRoot *> $null
    & claude plugin install argi@ai-tools-sync-local *> $null
    Write-Host "Plugin Claude instalado: argi@ai-tools-sync-local"

    & claude mcp remove infoleg-mcp -s user *> $null
    & claude mcp remove arca-mcp -s user *> $null

    Run-Checked -FilePath "claude" -Arguments @(
        "mcp", "add", "-s", "user", "infoleg-mcp",
        "-e", "INFOLEG_API_BASE_URL=https://servicios.infoleg.gob.ar/infoleg-internet/api/",
        "--", "bun", "run", "--cwd", $infolegRoot, "start"
    ) -WorkingDirectory $pluginRoot

    Run-Checked -FilePath "claude" -Arguments @(
        "mcp", "add", "-s", "user", "arca-mcp",
        "-e", "ARCA_TIMEOUT_MS=15000",
        "--", "bun", "run", "--cwd", $arcaRoot, "start"
    ) -WorkingDirectory $pluginRoot

    Write-Host "MCPs registrados en Claude Code: infoleg-mcp, arca-mcp"
}

if (-not $SkipVerify) {
    foreach ($mcpRoot in $mcpRoots) {
        Write-Host "Verificando: $mcpRoot"
        Run-Checked -FilePath "bun" -Arguments @("run", "typecheck") -WorkingDirectory $mcpRoot
        Run-Checked -FilePath "bun" -Arguments @("test") -WorkingDirectory $mcpRoot
    }

    if (-not $SkipMcp) {
        Run-Checked -FilePath "claude" -Arguments @("plugin", "list") -WorkingDirectory $pluginRoot
        Run-Checked -FilePath "claude" -Arguments @("mcp", "get", "infoleg-mcp") -WorkingDirectory $pluginRoot
        Run-Checked -FilePath "claude" -Arguments @("mcp", "get", "arca-mcp") -WorkingDirectory $pluginRoot
    }
}

Write-Host "Instalacion ARGI completa."
