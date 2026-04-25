param(
    [switch]$Apply,
    [string]$RepoRoot = (Split-Path $PSScriptRoot -Parent),
    [string]$CodexHome = $(if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME ".codex" }),
    [string]$ClaudeHome = $(if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $HOME ".claude" })
)

$ErrorActionPreference = "Stop"

function Copy-Children {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$Label
    )

    if (-not (Test-Path -LiteralPath $Source)) {
        Write-Host "Skipping ${Label}: source does not exist ($Source)"
        return
    }

    $children = Get-ChildItem -Force -LiteralPath $Source | Where-Object { $_.Name -ne ".gitkeep" }
    if (-not $children) {
        Write-Host "Skipping ${Label}: no tracked assets yet"
        return
    }

    Write-Host "$Label"
    Write-Host "  From: $Source"
    Write-Host "  To:   $Destination"

    if (-not $Apply) {
        foreach ($child in $children) {
            Write-Host "  Would copy: $($child.Name)"
        }
        return
    }

    New-Item -ItemType Directory -Force -Path $Destination | Out-Null
    foreach ($child in $children) {
        $target = Join-Path $Destination $child.Name
        if ($child.PSIsContainer) {
            New-Item -ItemType Directory -Force -Path $target | Out-Null
            foreach ($item in Get-ChildItem -Force -LiteralPath $child.FullName) {
                Copy-Item -Recurse -Force -LiteralPath $item.FullName -Destination $target
            }
        }
        else {
            Copy-Item -Force -LiteralPath $child.FullName -Destination $target
        }
        Write-Host "  Copied: $($child.Name)"
    }
}

Copy-Children -Source (Join-Path $RepoRoot "shared\skills") -Destination (Join-Path $CodexHome "skills") -Label "Shared skills -> Codex"
Copy-Children -Source (Join-Path $RepoRoot "shared\skills") -Destination (Join-Path $ClaudeHome "skills") -Label "Shared skills -> Claude"
Copy-Children -Source (Join-Path $RepoRoot "codex\skills") -Destination (Join-Path $CodexHome "skills") -Label "Codex skills"
Copy-Children -Source (Join-Path $RepoRoot "claude\skills") -Destination (Join-Path $ClaudeHome "skills") -Label "Claude skills"

Write-Host ""
Write-Host "Plugin restoration is intentionally manual."
Write-Host "Use inventory/current.md for marketplace/plugin install commands and keep plugin source under codex/plugins or claude/plugins when you own it."

if (-not $Apply) {
    Write-Host ""
    Write-Host "Dry run only. Re-run with -Apply to copy tracked skills."
}
