$files = Get-ChildItem -Path . -Recurse -Filter *.html
$fallbackHead = git show HEAD:index.html
foreach ($file in $files) {
  $rel = $file.FullName.Replace((Get-Location).Path + '\', '').Replace('\', '/')
  $head = git show HEAD:$rel
  if (-not $head) { $head = $fallbackHead }
  if (-not $head) { continue }

  $headNav = [regex]::Match($head, '<nav class="site-nav"[\s\S]*?</nav>').Value
  $headMobile = [regex]::Match($head, '<nav class="mobile-nav"[\s\S]*?</nav>').Value
  if (-not $headNav -or -not $headMobile) { continue }

  $aboutMatch = [regex]::Match($headNav, 'href="([^"]*about\.html)"')
  $depth = ($rel -split '/').Count - 1
  $prefix = if ($depth -gt 0) { ('../' * $depth) } else { '' }
  if ($aboutMatch.Success) {
    $aboutHref = $aboutMatch.Groups[1].Value
    $prefix = $aboutHref -replace 'about\.html$', ''
  }
  $about = $prefix + 'about.html'
  $contact = $prefix + 'contact.html'
  $pricing = $prefix + 'isg/pricing.html'

  $resourcesDesktop = @'
<li class="nav-item has-dropdown">
            <button class="nav-trigger" data-dropdown-toggle aria-expanded="false" aria-controls="dropdown-resources">Resources</button>
            <div class="dropdown mega-menu" id="dropdown-resources">
              <div class="mega-grid two-col">
                <div class="mega-section">
                  <div class="mega-title">Resources</div>
                  <a class="mega-link" href="{{ABOUT}}">
                    <span class="mega-link-title">About</span>
                    <span class="mega-link-desc">Practitioner-led, enterprise delivery.</span>
                  </a>
                  <a class="mega-link" href="{{PRICING}}">
                    <span class="mega-link-title">Pricing</span>
                    <span class="mega-link-desc">Outcome-based tiers and scope guardrails.</span>
                  </a>
                  <a class="mega-link" href="{{CONTACT}}">
                    <span class="mega-link-title">Contact</span>
                    <span class="mega-link-desc">Start a conversation with ISG.</span>
                  </a>
                </div>
                <div class="mega-section mega-panel">
                  <div class="mega-title">Get started</div>
                  <p class="mega-panel-copy">Align scope, cadence, and outcomes with ISG leadership.</p>
                  <a class="btn btn-primary" href="{{CONTACT}}">Request a Consult</a>
                </div>
              </div>
            </div>
          </li>
'@
  $resourcesDesktop = $resourcesDesktop.Replace('{{ABOUT}}', $about).Replace('{{CONTACT}}', $contact).Replace('{{PRICING}}', $pricing)

  $mobileResources = @'
<button class="accordion-trigger" data-accordion-toggle aria-expanded="false" aria-controls="mobile-resources">Resources</button>
      <div class="accordion-panel" id="mobile-resources" hidden>
        <a href="{{ABOUT}}">About</a>
        <a href="{{PRICING}}">Pricing</a>
        <a href="{{CONTACT}}">Contact</a>
      </div>
'@
  $mobileResources = $mobileResources.Replace('{{ABOUT}}', $about).Replace('{{CONTACT}}', $contact).Replace('{{PRICING}}', $pricing)

  $headNav = [regex]::Replace($headNav, '<li class="nav-item has-dropdown">\s*<button class="nav-trigger"[^>]*dropdown-about[^>]*>.*?</li>', '', 'Singleline')
  $headNav = [regex]::Replace($headNav, '<li class="nav-item has-dropdown">\s*<button class="nav-trigger"[^>]*dropdown-contact[^>]*>.*?</li>', '', 'Singleline')
  $headNav = [regex]::Replace($headNav, '</ul>', "$resourcesDesktop</ul>", 1)

  $headMobile = [regex]::Replace($headMobile, '<button class="accordion-trigger"[^>]*mobile-about[^>]*>About</button>\s*<div class="accordion-panel" id="mobile-about"[^>]*>.*?</div>', '', 'Singleline')
  $headMobile = [regex]::Replace($headMobile, '<button class="accordion-trigger"[^>]*mobile-contact[^>]*>Contact</button>\s*<div class="accordion-panel" id="mobile-contact"[^>]*>.*?</div>', '', 'Singleline')
  $headMobile = [regex]::Replace($headMobile, '</nav>', "$mobileResources</nav>", 1)

  $current = Get-Content -Raw -Path $file.FullName
  $current = [regex]::Replace($current, '<nav class="site-nav"[\s\S]*?</nav>', $headNav, 1)
  $current = [regex]::Replace($current, '<nav class="mobile-nav"[\s\S]*?</nav>', $headMobile, 1)
  Set-Content -Path $file.FullName -Value $current
}
