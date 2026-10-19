# Copy generated icons to each project

$SOURCE_SVG = "icons-output\svg"
$SOURCE_PNG = "icons-output\png@128"

# Copy to Portal
Write-Host "Copying icons to Portal..." -ForegroundColor Cyan
Copy-Item "$SOURCE_SVG\portal-logo.svg" "portal\public\logo.svg" -Force
Copy-Item "$SOURCE_SVG\trading-journal-logo.svg" "portal\public\trading-journal-icon.svg" -Force
Copy-Item "$SOURCE_SVG\budget-tracker-logo.svg" "portal\public\budget-tracker-icon.svg" -Force

# Copy to Trading Journal
Write-Host "Copying icons to Trading Journal..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "trading-journal\public\icons" | Out-Null
Get-ChildItem "$SOURCE_SVG\*.svg" | ForEach-Object {
    Copy-Item $_.FullName "trading-journal\public\icons\" -Force
}

# Copy to Budget Tracker
Write-Host "Copying icons to Budget Tracker..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "budget-tracker\public\icons" | Out-Null
Get-ChildItem "$SOURCE_SVG\*.svg" | ForEach-Object {
    Copy-Item $_.FullName "budget-tracker\public\icons\" -Force
}

Write-Host "`n✓ Icons copied to all projects!" -ForegroundColor Green
Write-Host "  - Portal: public/*.svg" -ForegroundColor Gray
Write-Host "  - Trading Journal: public/icons/*.svg" -ForegroundColor Gray
Write-Host "  - Budget Tracker: public/icons/*.svg" -ForegroundColor Gray
