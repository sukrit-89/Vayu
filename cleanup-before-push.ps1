# Quick Cleanup Script
# Run this before pushing to GitHub

# Remove temporary patch files
Write-Host "🧹 Cleaning up temporary patch files..." -ForegroundColor Yellow

$patchFiles = @(
    "d:\Vayu\air-quality-app\mobile\apply-fix.js",
    "d:\Vayu\air-quality-app\mobile\apply-fix-v2.js", 
    "d:\Vayu\air-quality-app\mobile\debug-patch.js",
    "d:\Vayu\air-quality-app\mobile\patch-externals.js"
)

foreach ($file in $patchFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "✅ Removed: $file" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Not found: $file" -ForegroundColor Gray
    }
}

Write-Host "`n✨ Cleanup complete!" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Review your uncommitted changes: git status"
Write-Host "2. Stage changes: git add ."
Write-Host "3. Commit: git commit -m 'Clean up temporary files'"
Write-Host "4. Push: git push origin main"
