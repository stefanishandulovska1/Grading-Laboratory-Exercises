
$BACKUP_DIR = "backups"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"


if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
}

Write-Host "Creating database backup..." -ForegroundColor Yellow


$dbBackupFile = "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
Write-Host "Database backup file: $dbBackupFile" -ForegroundColor Gray
docker-compose exec -T postgres pg_dump -U assignments_user assignments_db | Out-File -FilePath $dbBackupFile -Encoding UTF8


$filesBackupFile = "$BACKUP_DIR/files_backup_$TIMESTAMP.tar.gz"
Write-Host "Files backup file: $filesBackupFile" -ForegroundColor Gray
$currentDir = (Get-Location).Path
docker run --rm -v assignments_backend_uploads:/data -v "$currentDir/$BACKUP_DIR":/backup alpine tar czf "/backup/files_backup_$TIMESTAMP.tar.gz" -C /data .

Write-Host "Backup completed successfully!" -ForegroundColor Green
Write-Host "Database backup: $dbBackupFile" -ForegroundColor Cyan
Write-Host "Files backup: $filesBackupFile" -ForegroundColor Cyan