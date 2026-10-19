
# PowerShell script to generate tasteful icons for all three projects

$SKILL_DIR = Join-Path $env:USERPROFILE ".kiro\skills\tasteful-icons"
$SPEC_FILE = "icons-spec.json"
$OUTPUT_DIR = "icons-output"

Write-Host "Generating icons..." -ForegroundColor Cyan

# Check that the skill script exists
$ICON_SCRIPT = Join-Path $SKILL_DIR "scripts\tasteful_icons.py"

if (-not (Test-Path $ICON_SCRIPT)) {
    Write-Host "ERROR: Icon generator not found: $ICON_SCRIPT" -ForegroundColor Red
    exit 1
}

# Generate the icons
python $ICON_SCRIPT build $OUTPUT_DIR --spec $SPEC_FILE --sizes 1024,512,128

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Icon generation failed." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Icons generated in $OUTPUT_DIR" -ForegroundColor Green
Write-Host ""
Write-Host "Preview created: $OUTPUT_DIR\preview.png" -ForegroundColor Yellow
Write-Host ""
Write-Host "SVG files:" -ForegroundColor Cyan

Get-ChildItem -Path "$OUTPUT_DIR\svg\*.svg" |
    Format-Table Name, Length