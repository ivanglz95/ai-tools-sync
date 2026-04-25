param(
    [switch]$SkipPull
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path $PSScriptRoot -Parent

Push-Location $repoRoot
try {
    if (-not (Test-Path -LiteralPath ".git")) {
        throw "This is not a Git repository: $repoRoot"
    }

    Write-Host "Repository:"
    git status --short --branch

    $dirty = git status --porcelain
    if ($dirty) {
        Write-Host ""
        Write-Host "Working tree has local changes. Commit or stash before installing shared tools."
        Write-Host $dirty
        exit 2
    }

    if (-not $SkipPull) {
        Write-Host ""
        Write-Host "Pulling latest changes..."
        git pull --ff-only
    }

    Write-Host ""
    Write-Host "Collecting inventory..."
    & (Join-Path $PSScriptRoot "collect-inventory.ps1")

    Write-Host ""
    Write-Host "Preflight complete. Review inventory diff before installing or committing new tools:"
    git status --short
}
finally {
    Pop-Location
}

