# remove-comments.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath
)

if (-not (Test-Path $FilePath)) {
    Write-Error "El archivo '$FilePath' no existe."
    exit 1
}

# Leer, procesar y sobrescribir
$content = Get-Content -Path $FilePath -Raw
# Elimina todo desde "//" hasta el final de la línea, pero solo si no está dentro de una cadena (¡esto no lo verifica!)
$cleaned = $content -replace '//.*', ''

# Quitar líneas vacías causadas por comentarios solos (opcional)
# $cleaned = ($cleaned -split '\r?\n' | Where-Object { $_ -match '\S' }) -join "`n"

Set-Content -Path $FilePath -Value $cleaned -NoNewline

Write-Host "Comentarios eliminados de: $FilePath"