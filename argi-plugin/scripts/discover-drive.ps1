# discover-drive.ps1
# Detecta la letra de disco de Google Drive Desktop (cuenta bg.impositivo@gmail.com)
# Busca el disco que contiene "Mi unidad\NORMATIVAS IMPOSITIVAS"
# Guarda resultado en argi-plugin/.argi-path para sesiones futuras

param(
    [string]$CacheFile = (Join-Path $PSScriptRoot "..\.argi-path")
)

$targetSubfolder = "Mi unidad\NORMATIVAS IMPOSITIVAS"
$found = $null

Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Root -match "^[A-Z]:\\" } | ForEach-Object {
    $candidate = Join-Path $_.Root $targetSubfolder
    if (Test-Path $candidate) {
        $found = $candidate
    }
}

if ($found) {
    $found | Set-Content $CacheFile -Encoding UTF8
    Write-Host "ARGI_BASE resuelto: $found"
    Write-Host "Guardado en: $CacheFile"
    [System.Environment]::SetEnvironmentVariable("ARGI_BASE", $found, "Process")
} else {
    Write-Error "No se encontro 'Mi unidad\NORMATIVAS IMPOSITIVAS' en ningun disco."
    Write-Error "Verificar que Google Drive Desktop este corriendo y sincronizado."
    exit 1
}
