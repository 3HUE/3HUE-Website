# Inside 3HUE — one-time cleanup after switching from the building experience to the guided tour.
# Run from anywhere:  powershell -ExecutionPolicy Bypass -File C:\Projects\3HUE-Website\experience\tools\cleanup.ps1
# Safe to run twice: it only removes what still exists, and it lists everything before touching it.

$Repo = 'C:\Projects\3HUE-Website'
$Exp  = Join-Path $Repo 'experience'

# 1) Files from the old building experience that the tour no longer uses
$obsolete = @(
  'js\main.js', 'js\hotspots.js', 'js\stage.js', 'js\streams.js', 'js\router.js',
  'js\ui',                                  # whole folder (hud.js, panel.js, lightbox.js, intro.js)
  'css\experience.css',
  'content\experience.json',
  'tools\wire-renders.py', 'tools\hotspot-tool.html',
  'tools\reference-inside-3hue-clean.png'
) | ForEach-Object { Join-Path $Exp $_ } | Where-Object { Test-Path $_ }

# 2) A stale git lock left by an interrupted operation (blocks GitHub Desktop commits)
$lock = Join-Path $Repo '.git\index.lock'
if (Test-Path $lock) {
  $age = (Get-Date) - (Get-Item $lock).LastWriteTime
  if ($age.TotalMinutes -gt 5) { $obsolete += $lock } else { Write-Warning "index.lock is only $([int]$age.TotalSeconds)s old - git may be running; leaving it." }
}

# 3) The old standalone folder (everything in it now lives in the website repo)
$oldFolder = 'C:\Projects\3HUE-Experience'

if (-not $obsolete -and -not (Test-Path $oldFolder)) { Write-Host 'Nothing to clean up.' -ForegroundColor Green; exit 0 }

Write-Host "`nWill remove:" -ForegroundColor Yellow
$obsolete | ForEach-Object { Write-Host "  $_" }
if (Test-Path $oldFolder) { Write-Host "  $oldFolder  (entire folder - the tour copied what it needs)" }

$ok = Read-Host "`nProceed? [y/N]"
if ($ok -notmatch '^[Yy]') { Write-Host 'Cancelled.'; exit 0 }

foreach ($p in $obsolete) { Remove-Item -LiteralPath $p -Recurse -Force; Write-Host "removed $p" }
if (Test-Path $oldFolder) {
  $ok2 = Read-Host "Also delete $oldFolder ? [y/N]"
  if ($ok2 -match '^[Yy]') { Remove-Item -LiteralPath $oldFolder -Recurse -Force; Write-Host "removed $oldFolder" }
}

Write-Host "`nDone. Next: open GitHub Desktop, review the changes under experience\, and commit." -ForegroundColor Green
