# 3HUE OT / IT-OT Convergence / AMI Control Baseline (SCF 2026.2) – Methodology

**Version:** v1.0 · **Baseline date:** 2026-10-01 · **Source framework:** Secure Controls Framework (SCF) 2026.2

## Deliverables

| File | Purpose |
|---|---|
| `3HUE-OT-AMI-Control-Baseline-ClientVision-Upload-SCF2026.2-v1.0.xlsx` | Client Vision upload file. Exact template structure (`Control Catalog` 46 columns, `Privacy Crosswalk` 31 columns), every column populated for every scoped control. |
| `3HUE-OT-AMI-Control-Baseline-Rosetta-Stone-SCF2026.2-v1.0.xlsx` | Engagement Rosetta Stone: filtered SCF with the four authored columns, full in-scope framework mappings, ISA/IEC 62443-3-2 ZCR crosswalk, scoping requirements, management intent by domain, coverage summary and picklists. |
| `build/` | Reproducible generator (`build.py`, `content.py`). Re-run against a newer SCF release or a changed scope. |

## Scoping method (how the SCF was filtered)

1. Each SCF 2026.2 control was tested for a mapping to each in-scope requirement. A control enters the baseline if it maps to at least one in-scope requirement.
2. Each control is assigned to the lowest tier that triggered it:

| Tier | Requirements | Applicability |
|---|---|---|
| 1 – OT Core (mandatory) | IEC 62443-2-1:2024, IEC 62443-3-3:2013, IEC 62443-4-2:2019, NIST SP 800-82 R3 Moderate OT Overlay, NERC CIP 2024, CISA CPG, ANSI/ISA-62443-3-2:2020 (manual ZCR crosswalk) | Basic |
| 2 – Converged IT/OT enterprise | NIST CSF 2.0, NIST SP 800-53B R5 Moderate, DOE C2M2 v2.1 | Enhanced |
| 3 – AMI endpoint, embedded & supply chain | IEC 62443-4-1:2018, CSA IoT SCF v2, NIST SP 800-161 R1 C-SCRM Baseline, SCF Embedded Technology (EMB) domain | Enhanced |
| 4 – Privacy (Customer Energy Usage Data) | NIST Privacy Framework 1.0, NIST SP 800-53B R5 Privacy | Enhanced |

3. ANSI/ISA-62443-3-2 is not in the SCF mapping set. Its Zone & Conduit Requirements (ZCR 1.1 – 7.1) were crosswalked manually to SCF controls; those controls are force-included at Tier 1. See the `62443-3-2 ZCR Crosswalk` sheet.
4. The AAT (AI) and QTS (quantum) domains are excluded unless a Tier 1 requirement maps to them.
5. SCF's own ESP Level 2 (Critical Infrastructure) set is shown as an informational column but does not by itself pull a control into scope, because it is not an external requirement.

## Column derivations (Client Vision upload)

| Column | Source / rule |
|---|---|
| Function Grouping, Control Family, Control ID, Control Title, Control Description, Control Weight, SCF Domain, SCF Control Question, SCF Validation Cadence, SCF Evidence Request IDs, SCF PPTDF Applicability, SCF Medium-Business Solutions | SCF 2026.2 |
| Standard Title | Control Title (3HUE master convention) |
| Lifecycle Stage | Active |
| Accountability | 3HUE master catalog value where the control exists there; otherwise the domain default (see `_index`) |
| Policy Statement | **Management Intent** – domain-level intent written for a converged IT/OT/AMI program, with sub-domain variants (remote access, wireless, patching, key management, backups, logging, authenticators, privileged access, supplier contracts, embedded firmware) |
| Control Objectives | **Control Objectives** – outcome statement derived from the SCF control description plus an OT/AMI extension sentence |
| Standard Content | **Control Standards** – accountable role + lettered requirements derived from SCF 2026.2 Assessment Objectives (rigor 1–3, CUI/CMMC-specific objectives removed) + OT/AMI-specific requirements authored for this engagement (domain-level plus ~50 control-specific overrides) |
| Implementation Notes | **Control Guidelines** – OT/AMI implementation guidance, SCF enterprise solutions and considerations, in-scope requirement alignment, validation cadence and evidence references |
| Implementation Status-Corporate / -Platform | Not Reviewed |
| Control Owner-Corporate / -Platform | Role titles by domain (Corporate = enterprise owner, Platform = OT/AMI owner). No personnel names. |
| TSC 2017 (SOC 2) / TSC 2017 POF | SCF TSC column split into criteria vs. points of focus |
| COBIT 2019, ISO 27001/27002, NIST 800-53r5 (Moderate), PCI SAQ A / SAQ D SP, CMMC L2, HIPAA, FedRAMP R5 (Moderate), EU GDPR, SCF-B | SCF 2026.2 columns (same columns the 3HUE master uses) |
| SCF-I, SCF-R | Carried forward from the 3HUE master where the control exists there (SCF 2026.2 no longer publishes these baselines) |
| Zero Trust Architecture | NIST SP 800-207 tenets + DoD ZT Reference Architecture 2.0 (master convention) |
| Date of Last Review / Review Frequency / Next Review Date | 2026-10-01 · Annual 365 / Semi-Annual 180 / Quarterly 90 (from SCF cadence) · formula |
| Target Audience | SCF PPTDF: Technology/Facility → Technical, Process → Management, People/Data → All Users; program controls → Management |
| Applicability | Basic = Tier 1, Enhanced = Tiers 2–4 |
| Associated Third-Parties | OT/AMI third-party classes by domain |
| Aggregated Maturity Score | Formula over the two Implementation Status columns (same weighting as the 3HUE master) |
| Privacy Crosswalk | 26 privacy frameworks from SCF 2026.2; Framework Count and Privacy Relevance computed |

## Language conventions

* All authored and derived text (Policy Statement, Control Objectives, Standard Content, Implementation Notes, owners, third parties, crosswalk rationale) uses US English spelling and conventions; the generator applies a US-English normalization pass (`us_english()` in `build.py`).
* IEC 62443 terminology and identifiers are preserved exactly as the standards write them: zone, conduit, system under consideration (SUC), SL-T / SL-C / SL-A, countermeasure, IACS, asset owner, and the SR/RE, CR/EDR/HDR/NDR, ORG/NET/CM/COMP and ZCR references. The ZCR crosswalk titles use the ANSI/ISA-62443-3-2:2020 requirement titles verbatim.
* SCF control descriptions and control questions are reproduced verbatim from SCF 2026.2 for traceability (two cells retain SCF's own "amongst" / "modelling").

## Notes and limitations

* NISTIR 7628 R1 is not in the SCF. A family-level crosswalk (derived from the NIST 800-53 family of each mapping) is provided in the Rosetta Stone; it is not a requirement-level mapping.
* SCF's Evidence Request List does not cover every control; where blank, evidence artifacts are to be defined during the assessment.
* Accountability uses the 3HUE picklist so the upload stays compatible with Client Vision; OT roles are expressed through Control Owner-Platform.
* No client-specific or prior-engagement content is used in any authored text.
