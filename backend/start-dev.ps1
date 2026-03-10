# Script para iniciar el backend limpiamente
Write-Host "Verificando si el puerto 3001 esta en uso..." -ForegroundColor Cyan

# Obtener el proceso que esta usando el puerto 3001
$process = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | 
    Where-Object { $_.State -eq 'Listen' } | 
    Select-Object -ExpandProperty OwningProcess -Unique |
    Where-Object { $_ -ne 0 }

if ($process) {
    Write-Host "Puerto 3001 esta en uso por el proceso $process. Deteniendo..." -ForegroundColor Yellow
    Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "Proceso detenido correctamente" -ForegroundColor Green
} else {
    Write-Host "Puerto 3001 esta libre" -ForegroundColor Green
}

# Iniciar el servidor en modo desarrollo
Write-Host "Iniciando backend en modo desarrollo..." -ForegroundColor Cyan
npm run start:dev
