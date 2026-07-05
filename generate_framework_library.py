"""One-off generator for frameworks/framework-library.html.

Reads the "Authoritative Sources" sheet from the AiVRIC UCF workbook and emits
one searchable/filterable card per framework, reusing the existing
data-post-card / data-filter-tag / data-insights-search JS already shipped in
assets/js/main.js (see insights/index.html for the original usage).
"""

import html
import re
from pathlib import Path

import openpyxl

SITE_ROOT = Path(__file__).resolve().parent
WORKBOOK = r"C:\Projects\AiVRIC-Platform\AiVRIC Defense\docs\AiVRIC-UCF-v2025.2.xlsx"
OUT_FILE = SITE_ROOT / "frameworks" / "framework-library.html"
CHROME_SOURCE = SITE_ROOT / "frameworks" / "index.html"

# Mapping Column Header values (exact) that should be flagged "Popular" so
# customers can find recognizable names before browsing all ~250 entries.
POPULAR_HEADERS = {
    "AICPA\nTSC 2017\n(with 2022 revised POF)",
    "ISO\n27001\nv2022",
    "ISO\n27701 \nv2019",
    "ISO\n42001\nv2023",
    "US\nHIPAA\nSecurity Rule / NIST SP 800-66 R2",
    "PCI DSS\nv4.0.1",
    "NIST\nCSF\nv2.0",
    "NIST\n800-53\nrev5",
    "US\nCMMC 2.0\nLevel 2",
    "EMEA\nEU\nGDPR",
    "US-CA\nCCPA / CPRA\n(Nov 2022)",
    "US\nFedRAMP\nR5",
    "US\nGLBA\nCFR 314\n(Dec 2023)",
    "US\nSOX",
    "US\nFFIEC",
    "CIS\nCSC\nv8.1",
    "COBIT\n2019",
    "EMEA\nEU\nDORA",
    "EMEA\nUK\nCyber Essentials",
}


def clean(text):
    if text is None:
        return ""
    text = str(text).replace("\n", " ")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def build_title(full_name, source, mapping_header):
    full_name = clean(full_name)
    source = clean(source)
    header_first_word = clean(mapping_header).split(" ")[0] if mapping_header else ""
    if source and source not in ("US", "EMEA", "APAC", "Americas"):
        if not full_name.upper().startswith(source.upper()) and source != header_first_word.rstrip("/"):
            # Prepend the standards body for names that don't already carry it
            # (e.g. bare "27001:2022 - ..." rows from the ISO family).
            if source in ("ISO", "IEC"):
                full_name = f"{source} {full_name}"
    return full_name


def load_rows():
    wb = openpyxl.load_workbook(WORKBOOK, read_only=True, data_only=True)
    ws = wb["Authoritative Sources"]
    rows = list(ws.iter_rows(values_only=True))[1:]
    entries = []
    for applicability, mapping_header, source, full_name, _strm, _url in rows:
        if not full_name:
            continue
        region = clean(applicability) or "Universal"
        title = build_title(full_name, source, mapping_header)
        source_clean = clean(source)
        header_clean = clean(mapping_header)
        is_popular = mapping_header in POPULAR_HEADERS
        tags = [region.lower()]
        if is_popular:
            tags.append("popular")
        search_text = " ".join(filter(None, [title, header_clean, source_clean, region]))
        entries.append(
            {
                "title": title,
                "source": source_clean,
                "region": region,
                "popular": is_popular,
                "tags": " ".join(tags),
                "search": search_text,
            }
        )
    # De-duplicate identical (title, source) pairs and sort for a stable, scannable default view.
    seen = set()
    unique = []
    for e in entries:
        key = (e["title"], e["source"])
        if key in seen:
            continue
        seen.add(key)
        unique.append(e)
    unique.sort(key=lambda e: e["title"].lower())
    return unique


def render_card(entry):
    return f"""            <article
              class="card framework-card"
              data-post-card
              data-tags="{html.escape(entry['tags'])}"
              data-search="{html.escape(entry['search'].lower())}"
            >
              <div class="framework-meta">
                <span class="framework-region-badge">{html.escape(entry['region'])}</span>
                <span>{html.escape(entry['source'])}</span>
              </div>
              <h3>{html.escape(entry['title'])}</h3>
            </article>"""


def main():
    entries = load_rows()
    cards_html = "\n".join(render_card(e) for e in entries)
    count = len(entries)

    chrome = CHROME_SOURCE.read_text(encoding="utf-8")
    main_start = chrome.index('<main id="main">')
    footer_start = chrome.index('<footer class="site-footer">')
    footer_end = chrome.index("</html>") + len("</html>")

    head = chrome[: chrome.index("<title>")] + (
        "<title>3HUE | Framework Library</title>\n"
        "    <meta\n"
        '      name="description"\n'
        '      content="Search the frameworks, certifications, and mandates mapped into 3HUE\'s '
        'USR/UCB control baseline across security, privacy, and regional compliance."\n'
        "    />\n"
        '    <link rel="icon" href="../assets/img/logos/Logo-FULL-v1.avif" type="image/avif" />\n'
        '    <link rel="preconnect" href="https://fonts.googleapis.com" />\n'
        '    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n'
        "    <link\n"
        '      href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap"\n'
        '      rel="stylesheet"\n'
        "    />\n"
        '    <link rel="stylesheet" href="../assets/css/styles.css" />\n'
        '    <link rel="stylesheet" href="../assets/css/framework-library.css" />\n'
        "  </head>"
    )

    main_block = f"""<main id="main">
      <section class="page-hero">
        <div class="container">
          <div class="eyebrow">Framework Library</div>
          <h1>Every framework mapped into USR/UCB, in one searchable library.</h1>
          <p class="lead">
            {count} authoritative sources &mdash; standards, certifications, and regulatory
            mandates &mdash; that 3HUE's USR framework and the AiVRIC UCB control baseline map
            into a single governed program. Search by name, or filter by region.
          </p>
          <div class="hero-actions">
            <a href="../services/security-compliance-services.html" class="btn btn-primary"
              >See the Meta-Audit in Action</a
            >
            <a class="btn btn-outline" href="index.html">Back to Frameworks Portal</a>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="insights-meta">
            <span
              class="badge"
              data-insights-count
              data-count-label="framework"
              aria-live="polite"
              >{count} frameworks</span
            >
          </div>
          <div class="insights-controls">
            <input
              class="insights-search"
              type="search"
              placeholder="Search frameworks (e.g. SOC 2, GDPR, ISO 27001)"
              aria-label="Search frameworks"
              data-insights-search
            />
            <div class="tag-list" aria-label="Filter by category">
              <button class="tag-button is-active" type="button" data-filter-tag="all">All</button
              ><button class="tag-button" type="button" data-filter-tag="popular">Popular</button
              ><button class="tag-button" type="button" data-filter-tag="universal">
                Universal</button
              ><button class="tag-button" type="button" data-filter-tag="us">US</button
              ><button class="tag-button" type="button" data-filter-tag="emea">EMEA</button
              ><button class="tag-button" type="button" data-filter-tag="apac">APAC</button
              ><button class="tag-button" type="button" data-filter-tag="americas">
                Americas
              </button>
            </div>
          </div>
          <div class="framework-grid">
{cards_html}
          </div>
        </div>
      </section>

      <section class="section section-alt">
        <div class="container cta-band">
          <div>
            <h2>Don't see a framework you need?</h2>
            <p>
              This library represents a subset of what 3HUE's USR/UCB control mapping supports
              &mdash; ask your account team about additional frameworks relevant to your industry
              and region.
            </p>
          </div>
          <div class="hero-actions">
            <a href="https://calendly.com/aramirez-vcio/15min" class="btn btn-primary"
              >Request a Consult</a
            >
          </div>
        </div>
      </section>
    </main>

    """

    # Assembly: head + everything between <body...> and <main id="main">
    # (preloader, skip link, header, mobile drawer, overlay) + our main content + footer/scripts.
    body_open = chrome.index('<body class="is-preloading">')
    pre_main = chrome[body_open:main_start]
    tail = chrome[footer_start:footer_end]

    full_html = (
        head
        + "\n  "
        + pre_main
        + main_block
        + tail
        + "\n"
    )

    OUT_FILE.write_text(full_html, encoding="utf-8", newline="\n")
    print(f"Wrote {OUT_FILE} with {count} framework cards")


if __name__ == "__main__":
    main()
