# Inside 3HUE — deploy the tour.
#   powershell -ExecutionPolicy Bypass -File C:\Projects\3HUE-Website\experience\tools\deploy.ps1
#   ... -Message "Tour: new hallway plates"     custom commit message
#   ... -Worker                                 also deploy the Cloudflare Worker and wire its URL into content/config.json
#   ... -NoPush                                 commit only
# The site is GitHub Pages on main (CNAME = 3hue.net): a push IS the deploy. Allow a minute or two for Pages to rebuild.

param(
  [string]$Message = "Inside 3HUE tour: update $(Get-Date -Format 'yyyy-MM-dd HH:mm')",
  [switch]$Worker,
  [switch]$NoPush
)
$ErrorActionPreference = 'Stop'
$Repo = 'C:\Projects\3HUE-Website'
$Exp  = Join-Path $Repo 'experience'
Set-Location $Repo

function Step($t) { Write-Host "`n== $t" -ForegroundColor Cyan }

# --- optional: Cloudflare Worker (real answers + email) ---------------------------------
if ($Worker) {
  Step 'Deploying Cloudflare Worker'
  Push-Location (Join-Path $Exp 'worker')
  if (-not (Test-Path 'node_modules')) { npm install --no-fund --no-audit | Out-Host }
  $out = npx wrangler deploy 2>&1 | Tee-Object -Variable wr | Out-String
  Pop-Location
  $url = ($wr | Select-String -Pattern 'https://[a-z0-9.-]+\.workers\.dev' -AllMatches | ForEach-Object { $_.Matches } | Select-Object -Last 1).Value
  if ($url) {
    $cfgPath = Join-Path $Exp 'content\config.json'
    $cfg = Get-Content $cfgPath -Raw | ConvertFrom-Json
    $cfg.apiBase = $url
    ($cfg | ConvertTo-Json -Depth 4) | Set-Content $cfgPath -Encoding UTF8
    Write-Host "apiBase set to $url in content\config.json" -ForegroundColor Green
  } else { Write-Warning 'Could not read the Worker URL from wrangler output; set apiBase in content\config.json by hand.' }
}

# --- git: stage, commit, push -------------------------------------------------------------
Step 'Git status'
$lock = Join-Path $Repo '.git\index.lock'
if (Test-Path $lock) {
  if (((Get-Date) - (Get-Item $lock).LastWriteTime).TotalMinutes -gt 5) { Remove-Item $lock -Force; Write-Host 'removed stale .git\index.lock' }
  else { throw 'git appears to be busy (.git\index.lock is fresh). Close other git clients and retry.' }
}
git add -A -- experience
$changes = git status --porcelain -- experience
if (-not $changes) { Write-Host 'Nothing to commit under experience\.' -ForegroundColor Green; exit 0 }
$changes | Out-Host

Step "Commit: $Message"
git commit -m $Message | Out-Host

if ($NoPush) { Write-Host 'Committed (no push).' -ForegroundColor Green; exit 0 }

Step 'Push'
$branch = git rev-parse --abbrev-ref HEAD
git push origin $branch 2>&1 | Out-Host
if ($LASTEXITCODE -ne 0) {
  $who = (git config user.name)
  Write-Host "`nPush failed (git exit $LASTEXITCODE). The commit is saved locally; nothing was published." -ForegroundColor Red
  Write-Host "If GitHub answered 403 'Permission denied to <account>', Windows is signed in to GitHub as an account without write access to 3HUE/3HUE-Website." -ForegroundColor Yellow
  Write-Host "Fix once, then re-run:  git push origin $branch" -ForegroundColor Yellow
  Write-Host "  - either add that account as a collaborator on github.com/3HUE/3HUE-Website (Settings > Collaborators), or" -ForegroundColor Yellow
  Write-Host "  - switch the stored credential: Control Panel > Credential Manager > Windows Credentials > remove 'git:https://github.com', then push again and sign in as the 3HUE account, or" -ForegroundColor Yellow
  Write-Host "  - push from GitHub Desktop, which keeps its own sign-in." -ForegroundColor Yellow
  exit $LASTEXITCODE
}
Write-Host "`nPushed to origin/$branch. GitHub Pages will publish https://3hue.net/experience/ in a minute or two (hard-refresh: Ctrl+F5)." -ForegroundColor Green
