
Write-Host "Deploying Assignment Management System..." -ForegroundColor Green


Write-Host "Pulling latest changes..." -ForegroundColor Yellow
git pull origin main


Write-Host "Building and starting containers..." -ForegroundColor Yellow
docker-compose down
docker-compose build --no-cache
docker-compose up -d

Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Database: localhost:5432" -ForegroundColor Cyan


Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "Service Status:" -ForegroundColor Yellow
docker-compose ps