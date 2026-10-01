# -*- coding: utf-8 -*-
"""
Engagement content for the OT / IT-OT Convergence / AMI Control Baseline.
All language is enterprise-generic. No client-specific information is used.
"""

ENGAGEMENT = "OT, IT/OT Convergence and Advanced Metering Infrastructure (AMI) Control Baseline"
ORG = "The organization"

# ---------------------------------------------------------------------------
# Scoping requirements: (key, label, SCF column index, tier, rationale)
# Tier 1 = OT Core (mandatory) ; Tier 2 = Converged IT/OT enterprise ;
# Tier 3 = AMI endpoint / embedded & supply chain ; Tier 4 = Privacy (customer energy usage data)
# ---------------------------------------------------------------------------
REQUIREMENTS = [
    ("IEC62443-2-1", "IEC 62443-2-1:2024 (IACS security program requirements for asset owners)", 53, 1,
     "Asset-owner security program requirements for the IACS/OT environment; defines the governance, people and process backbone of the OT program."),
    ("IEC62443-3-3", "IEC 62443-3-3:2013 (System security requirements and security levels)", 54, 1,
     "System-level technical requirements (SR/RE) used to achieve the target security level (SL-T) for each zone and conduit defined under ISA/IEC 62443-3-2."),
    ("IEC62443-4-2", "IEC 62443-4-2:2019 (Technical security requirements for IACS components)", 56, 1,
     "Component-level requirements (CR/EDR/HDR/NDR/SAR) applied to AMI meters, collectors, gateways, RTUs, PLCs and head-end components."),
    ("NIST80082MOD", "NIST SP 800-82 R3 - Moderate OT Overlay", 86, 1,
     "The NIST 800-53 R5 Moderate baseline tailored for OT; selected as the engagement's control-strength reference for availability-first OT systems."),
    ("NERCCIP", "NERC CIP (2024 Reliability Standards)", 163, 1,
     "Regulatory requirements where OT/AMI components support or connect to Bulk Electric System (BES) Cyber Systems or Electronic Security Perimeters."),
    ("CISACPG", "CISA Cross-Sector Cybersecurity Performance Goals (CPG) 2022/2023", 130, 1,
     "Foundational, prioritized practices for critical infrastructure operators; used as the minimum-practice floor for IT/OT."),
    ("NISTCSF2", "NIST Cybersecurity Framework 2.0", 103, 2,
     "Enterprise-wide outcome framework used to organize the converged IT/OT program and executive reporting."),
    ("NIST80053MOD", "NIST SP 800-53B R5 - Moderate baseline", 81, 2,
     "Enterprise (corporate IT) control baseline that OT and AMI systems inherit from or integrate with under IT/OT convergence."),
    ("C2M2", "DOE Cybersecurity Capability Maturity Model (C2M2) v2.1", 132, 2,
     "Energy-sector maturity model used to measure and benchmark OT/AMI program maturity."),
    ("IEC62443-4-1", "IEC 62443-4-1:2018 (Secure product development lifecycle)", 55, 3,
     "Flow-down requirements for AMI/OT product suppliers and integrators (secure development, vulnerability handling, update delivery)."),
    ("CSAIOT", "CSA IoT Security Controls Framework v2", 44, 3,
     "Controls for connected endpoints (smart meters, collectors, gateways, field sensors) and their cloud/head-end services."),
    ("NIST800161", "NIST SP 800-161 R1 - C-SCRM Baseline", 90, 3,
     "Cyber supply chain risk management for metering, communications and OT hardware/firmware/software suppliers."),
    ("EMB", "SCF Embedded Technology (EMB) domain", None, 3,
     "All SCF embedded-technology controls apply directly to AMI meters, collectors and OT field devices."),
    ("NISTPF", "NIST Privacy Framework 1.0", 74, 4,
     "Privacy outcomes for Customer Energy Usage Data (CEUD) and personal data collected, transmitted and analyzed through AMI."),
    ("NIST80053PRIV", "NIST SP 800-53B R5 - Privacy baseline", 79, 4,
     "Privacy control baseline for personal data and CEUD processed by AMI head-end, MDM and customer systems."),
    ("ZCR", "ANSI/ISA-62443-3-2:2020 (Zone and conduit requirements - manual crosswalk)", None, 1,
     "Risk assessment for system design (ZCR 1 - ZCR 7); not natively in SCF, crosswalked manually to SCF controls in this baseline."),
]

TIER_NAMES = {
    1: "Tier 1 - OT Core (mandatory)",
    2: "Tier 2 - Converged IT/OT enterprise baseline",
    3: "Tier 3 - AMI endpoint, embedded technology & supply chain",
    4: "Tier 4 - Privacy (customer energy usage data)",
}

EXCLUDED_DOMAINS = {
    "AAT": "Artificial Intelligence & Autonomous Technologies - outside the OT/AMI engagement scope; available as a future overlay.",
    "QTS": "Quantum Security - outside the OT/AMI engagement scope; post-quantum cryptography addressed through CRY domain guidance.",
}

# ---------------------------------------------------------------------------
# ISA/IEC 62443-3-2 Zone & Conduit Requirement crosswalk to SCF 2026.2
# ---------------------------------------------------------------------------
ZCR_CROSSWALK = [
    ("ZCR 1.1", "Identify the SUC perimeter and access points",
     ["AST-01", "AST-02", "AST-04", "AST-04.1", "AST-04.2", "NET-03"],
     "The System Under Consideration (SUC) is defined through asset governance, inventories, network/data-flow diagrams, asset scope classification and boundary definition."),
    ("ZCR 2.1", "Perform initial cyber security risk assessment",
     ["RSK-04", "RSK-04.2", "RSK-04.3", "RSK-02", "RSK-02.1", "EMB-15"],
     "Worst-case, unmitigated risk to health, safety, environment, reliability and service delivery is assessed using the corporate risk matrix and safety assessments."),
    ("ZCR 3.1", "Establish zones and conduits",
     ["NET-06", "NET-06.3", "SEA-03", "SEA-03.1", "AST-04.1"],
     "Assets sharing common security requirements are grouped into zones; communications between zones are modelled as conduits."),
    ("ZCR 3.2", "Separate business and IACS assets",
     ["NET-06", "NET-06.4", "NET-06.9", "SEA-03.1"],
     "Enterprise IT and OT/AMI assets are placed in logically or physically separated zones (Purdue-aligned segmentation)."),
    ("ZCR 3.3", "Separate safety related assets",
     ["NET-06.3", "EMB-15", "EMB-19", "SEA-03.1"],
     "Safety-related assets (e.g., protection, disconnect and load-control functions) are isolated into dedicated zones or the zone is designated safety-related."),
    ("ZCR 3.4", "Separate temporarily connected devices",
     ["NET-06.9", "AST-01.5", "MNT-04", "MNT-04.1", "DCH-12"],
     "Portable engineering laptops, handheld meter-programming devices and removable media are treated as separate, higher-risk zones."),
    ("ZCR 3.5", "Separate wireless devices",
     ["NET-15", "NET-15.1", "NET-15.4", "NET-06.9", "CRY-07"],
     "AMI RF mesh, cellular backhaul and plant Wi-Fi are modelled as separate wireless zones with access points as conduits."),
    ("ZCR 3.6", "Separate devices connected via external networks",
     ["NET-14", "NET-14.3", "NET-14.6", "NET-03", "MNT-05"],
     "Vendor, integrator and remote-operator access is modelled as an external zone with its own conduit controls (DMZ, jump host, MFA, session recording)."),
    ("ZCR 4.1", "Compare initial risk to tolerable risk",
     ["RSK-01.3", "RSK-01.4", "RSK-05"],
     "Initial risk is compared with documented risk tolerance and thresholds to decide whether a detailed assessment is required."),
    ("ZCR 5.1", "Identify threats",
     ["THR-01", "THR-03", "THR-09", "THR-10"],
     "Threat sources, capabilities, vectors and affected assets are enumerated for each zone and conduit using sector threat intelligence (e.g., E-ISAC, CISA)."),
    ("ZCR 5.2", "Identify vulnerabilities",
     ["VPM-06", "VPM-06.2", "VPM-06.7", "THR-02"],
     "Known vulnerabilities of zone/conduit assets and access points are identified through OT-safe assessment methods."),
    ("ZCR 5.3", "Determine consequence and impact",
     ["RSK-08", "BCD-02", "RSK-02.1"],
     "Worst-case consequences (safety, reliability, financial, regulatory, reputational) are determined through business impact analysis and critical asset identification."),
    ("ZCR 5.4", "Determine unmitigated likelihood",
     ["RSK-04.2", "RSK-05"],
     "Likelihood is estimated using the documented risk assessment methodology and ranking scale."),
    ("ZCR 5.5", "Determine unmitigated cyber security risk",
     ["RSK-04", "RSK-05"],
     "Impact and likelihood are combined using the corporate risk matrix."),
    ("ZCR 5.6", "Determine SL-T",
     ["SEA-01", "SEA-03", "RSK-02", "TDA-02"],
     "A target security level (SL-T) is set for each zone and conduit and expressed as design requirements."),
    ("ZCR 5.7", "Compare unmitigated risk with tolerable risk",
     ["RSK-01.3", "RSK-06.3"],
     "Risks exceeding tolerance are accepted, transferred or mitigated through a documented decision."),
    ("ZCR 5.8", "Identify and evaluate existing countermeasures",
     ["IAO-02", "IAO-03", "RSK-06.2"],
     "Existing technical, administrative and procedural countermeasures are inventoried and their effectiveness assessed against SL-C."),
    ("ZCR 5.9", "Reevaluate likelihood and impact",
     ["RSK-07", "RSK-04"],
     "Likelihood and impact are re-evaluated considering existing countermeasures."),
    ("ZCR 5.10", "Determine residual risk",
     ["RSK-06.1", "RSK-04.1"],
     "Residual risk is recorded in the risk register with the associated risk response."),
    ("ZCR 5.11", "Compare residual risk with tolerable risk",
     ["RSK-01.3", "RSK-06.3", "RSK-13"],
     "Residual risk above tolerance requires documented acceptance by accountable leadership."),
    ("ZCR 5.12", "Identify additional cyber security countermeasures",
     ["RSK-06", "RSK-06.2", "RSK-06.4"],
     "Additional countermeasures and compensating controls are selected and captured in a risk treatment plan."),
    ("ZCR 5.13", "Document and communicate results",
     ["RSK-04.1", "RSK-04.4", "IAO-02.4", "DCH-02"],
     "Assessment results are documented, classified, protected and communicated to stakeholders."),
    ("ZCR 6.1", "Cyber security requirements specification (CRS)",
     ["TDA-02", "SEA-01", "IAO-03"],
     "A CRS captures mandatory countermeasures and general security requirements for the SUC."),
    ("ZCR 6.2", "SUC description",
     ["AST-04", "IAO-03"],
     "The CRS includes the name, function and intended usage of the SUC and the process or service under control."),
    ("ZCR 6.3", "Zone and conduit drawings",
     ["AST-04", "AST-04.2"],
     "Drawings illustrate zone/conduit partitioning and every asset is assigned to a zone or conduit."),
    ("ZCR 6.4", "Zone and conduit characteristics",
     ["AST-04.1", "AST-03", "NET-06", "TDA-02.1"],
     "Each zone/conduit is characterized (identifier, accountable organization, boundaries, safety designation, access points, data flows, assets, SL-T, requirements, policies, assumptions)."),
    ("ZCR 6.5", "Operating environment assumptions",
     ["IAO-03", "PES-01", "SEA-02"],
     "Physical and logical operating environment assumptions are documented in system security plans."),
    ("ZCR 6.6", "Threat environment",
     ["THR-01", "THR-03"],
     "The CRS describes the current and emerging threat environment and its intelligence sources."),
    ("ZCR 6.7", "Organizational security policies",
     ["GOV-02", "GOV-09"],
     "Countermeasures implementing organizational policies are reflected in the CRS."),
    ("ZCR 6.8", "Tolerable risk",
     ["RSK-01.3", "RSK-01.5"],
     "Tolerable risk for the SUC is stated in the CRS."),
    ("ZCR 6.9", "Regulatory requirements",
     ["CPL-01", "CPL-01.2"],
     "Applicable regulatory requirements (e.g., NERC CIP, state utility commission orders) are included in the CRS."),
    ("ZCR 7.1", "Attain asset owner approval",
     ["RSK-13", "GOV-15.4", "RSK-06.4"],
     "Accountable asset-owner management reviews and approves the risk assessment and treatment plan."),
]

# ---------------------------------------------------------------------------
# NISTIR 7628 R1 family derivation from NIST 800-53 family prefixes
# ---------------------------------------------------------------------------
NISTIR7628_FAMILY = {
    "AC": "SG.AC Access Control", "AT": "SG.AT Awareness and Training", "AU": "SG.AU Audit and Accountability",
    "CA": "SG.CA Security Assessment and Authorization", "CM": "SG.CM Configuration Management",
    "CP": "SG.CP Continuity of Operations", "IA": "SG.IA Identification and Authentication",
    "IR": "SG.IR Incident Response", "MA": "SG.MA Smart Grid Information System Development and Maintenance",
    "MP": "SG.MP Media Protection", "PE": "SG.PE Physical and Environmental Security", "PL": "SG.PL Planning",
    "PM": "SG.PM Security Program Management", "PS": "SG.PS Personnel Security", "RA": "SG.RA Risk Management and Assessment",
    "SA": "SG.SA Smart Grid Information System and Services Acquisition", "SC": "SG.SC Smart Grid Information System and Communication Protection",
    "SI": "SG.SI Smart Grid Information System and Information Integrity", "SR": "SG.SA Smart Grid Information System and Services Acquisition (supply chain)",
    "PT": "SG.ID Information and Document Management (PII transparency)",
}

# ---------------------------------------------------------------------------
# Role phrasing for Control Standards, keyed by Accountability picklist value
# ---------------------------------------------------------------------------
ROLE_PHRASE = {
    "CISO": "The Chief Information Security Officer (CISO), in coordination with the OT Security Lead, is responsible for",
    "All Users": "All workforce members, including OT personnel, contractors and vendors with access to OT or AMI assets, are responsible for",
    "Compliance Manager": "The Compliance Manager, in coordination with the OT Compliance Lead (including NERC CIP compliance where applicable), is responsible for",
    "CSP": "Cloud Service Providers hosting AMI head-end, Meter Data Management (MDM) or OT support services, under the oversight of the CISO, are responsible for",
    "Facilities": "Facilities and Physical Security, in coordination with OT Operations and Field Operations, are responsible for",
    "GRC Analyst": "The Governance, Risk & Compliance (GRC) function is responsible for",
    "HR": "Human Resources, in coordination with OT line management, is responsible for",
    "Incident Commander": "The Incident Commander and the Cyber Incident Response Team (CIRT), including designated OT and AMI responders, are responsible for",
    "Information Risk Manager": "The Information Risk Manager, in coordination with OT Engineering, is responsible for",
    "IT Ops": "IT Operations and OT Operations teams (asset custodians) are responsible for",
    "IT Ops - Shared": "IT Operations and OT Operations are jointly responsible for",
    "IT PMO": "The Project Management Office (PMO), including OT and AMI program managers, is responsible for",
    "Leadership": "Executive leadership, including the executive accountable for OT and AMI operations, is responsible for",
    "Legal": "Legal and the Privacy Officer are responsible for",
    "Line Management": "Line management across IT, OT and field operations is responsible for",
    "MSP": "Managed Service Providers (MSPs), under the oversight of IT and OT Operations, are responsible for",
    "MSSP": "The Managed Security Service Provider (MSSP), under the oversight of the Security Operations function and with OT visibility requirements, is responsible for",
    "ProdDev": "OT Engineering and application development teams are responsible for",
    "Shared": "IT Operations, OT Operations and business process owners are jointly responsible for",
}

# Default accountability per SCF domain (used when a control is not in the 3HUE master catalog)
DEFAULT_ACCOUNTABILITY = {
    "GOV": "CISO", "AST": "IT Ops", "BCD": "IT Ops - Shared", "CAP": "IT Ops - Shared", "CHG": "IT PMO",
    "CLD": "IT Ops - Shared", "CPL": "Compliance Manager", "CFG": "IT Ops - Shared", "MON": "MSSP",
    "CRY": "IT Ops - Shared", "DCH": "IT Ops - Shared", "EMB": "IT Ops - Shared", "END": "IT Ops",
    "HRS": "HR", "IAC": "IT Ops", "IRO": "Incident Commander", "IAO": "Information Risk Manager",
    "MNT": "IT Ops", "MDM": "IT Ops", "NET": "IT Ops", "PES": "Facilities", "PRI": "Legal",
    "PRM": "IT PMO", "RSK": "Information Risk Manager", "SEA": "IT Ops", "OPS": "IT Ops - Shared",
    "SAT": "CISO", "TDA": "ProdDev", "TPM": "GRC Analyst", "THR": "MSSP", "VPM": "IT Ops - Shared", "WEB": "ProdDev",
}

# Control owners by domain: (Corporate owner, Platform (OT/AMI) owner)
OWNERS = {
    "GOV": ("Chief Information Security Officer (CISO)", "Executive Sponsor, OT & AMI Security Program"),
    "AST": ("Director, IT Infrastructure & Asset Management", "Manager, OT Asset Management / AMI Field Operations"),
    "BCD": ("Director, Business Continuity & IT Resilience", "Director, Grid / System Operations (OT Continuity)"),
    "CAP": ("Director, IT Infrastructure", "Manager, AMI Head-End & Telecommunications Operations"),
    "CHG": ("IT Change Advisory Board (CAB) Chair", "OT Change Control Board Chair / AMI Platform Manager"),
    "CLD": ("Director, Cloud & Infrastructure Services", "AMI Platform Manager (hosted HES / MDM services)"),
    "CPL": ("Director, Compliance & Internal Controls", "NERC CIP / Regulatory Compliance Lead"),
    "CFG": ("Manager, Enterprise Configuration Management", "OT Engineering Lead (secure baselines for HES, SCADA, field devices)"),
    "MON": ("Security Operations Center (SOC) Manager", "OT Security Monitoring Lead / AMI Network Operations Center"),
    "CRY": ("Enterprise Cryptography & PKI Lead", "AMI Security Engineer (meter key and certificate management)"),
    "DCH": ("Data Governance Lead", "Meter Data Management (MDM) Owner"),
    "EMB": ("Director, IT Architecture", "AMI Platform Manager / OT Engineering Lead"),
    "END": ("Manager, Endpoint Engineering", "OT Engineering Lead (HMI, engineering workstations, servers)"),
    "HRS": ("Director, Human Resources", "Manager, Field & Operations Workforce"),
    "IAC": ("Identity & Access Management (IAM) Lead", "OT Identity & Remote Access Lead"),
    "IRO": ("Cyber Incident Response Manager", "OT / AMI Incident Response Lead"),
    "IAO": ("Information Risk Manager", "OT Security Assessment Lead"),
    "MNT": ("Manager, IT Operations", "Manager, OT Maintenance & Field Services"),
    "MDM": ("Manager, Endpoint Engineering (Mobile)", "Manager, Field Operations (handheld and in-vehicle devices)"),
    "NET": ("Director, Network Engineering", "OT Network / AMI Telecommunications Engineering Lead"),
    "PES": ("Director, Corporate Security & Facilities", "Manager, Substation, Plant & Meter Shop Physical Security"),
    "PRI": ("Chief Privacy Officer / Privacy Counsel", "Customer Data Steward (Customer Energy Usage Data)"),
    "PRM": ("Director, IT Portfolio & Project Management", "AMI / OT Program Manager"),
    "RSK": ("Enterprise Risk Manager", "OT Risk Lead (zone and conduit risk assessments)"),
    "SEA": ("Chief Enterprise Architect", "OT / AMI Solution Architect"),
    "OPS": ("Director, IT Service Management", "Director, System Operations (OT)"),
    "SAT": ("Security Awareness & Training Lead", "OT Training Coordinator"),
    "TDA": ("Director, Application Development & Integration", "AMI / OT Product Engineering Lead"),
    "TPM": ("Director, Procurement & Vendor Risk", "AMI / OT Vendor & Integrator Relationship Manager"),
    "THR": ("Threat Intelligence Lead", "OT Threat Intelligence Analyst (E-ISAC liaison)"),
    "VPM": ("Vulnerability Management Lead", "OT Vulnerability & Firmware Management Lead"),
    "WEB": ("Application Security Lead", "Customer Portal / AMI Web Services Owner"),
}

THIRD_PARTIES = {
    "GOV": "External auditors; regulators; sector ISAC",
    "AST": "AMI vendor (head-end system); meter manufacturer; OT asset discovery tool vendor",
    "BCD": "AMI vendor; telecommunications / backhaul carriers; disaster recovery site provider",
    "CAP": "AMI head-end vendor; telecommunications / backhaul carriers; hosting provider",
    "CHG": "AMI vendor; OT system integrators; firmware suppliers",
    "CLD": "Cloud service provider; hosted HES / MDM provider",
    "CPL": "External auditors; regulators (NERC/Regional Entity, state utility commission)",
    "CFG": "AMI vendor; OT equipment manufacturers; system integrators",
    "MON": "MSSP / SOC provider; OT monitoring platform vendor; AMI vendor",
    "CRY": "Meter manufacturer; AMI vendor (key management); PKI / certificate authority provider",
    "DCH": "MDM provider; data analytics / billing service providers",
    "EMB": "Meter manufacturer; collector / gateway supplier; firmware supplier",
    "END": "Endpoint protection vendor; OT equipment manufacturers",
    "HRS": "Staffing agencies; contractors and field service providers",
    "IAC": "Identity provider; AMI vendor; remote-access / PAM vendor",
    "IRO": "Incident response retainer provider; MSSP; law enforcement; sector ISAC",
    "IAO": "Independent assessors; OT penetration testing provider",
    "MNT": "OT equipment manufacturers; field service contractors; remote maintenance vendors",
    "MDM": "Mobile device management vendor; field device suppliers",
    "NET": "Telecommunications / RF mesh / cellular carriers; network equipment vendors; AMI vendor",
    "PES": "Physical security contractor; meter installation contractor; facility landlords",
    "PRI": "MDM provider; billing / customer information system provider; third-party data recipients",
    "PRM": "System integrators; program management consultants",
    "RSK": "Risk assessment consultants; cyber insurance carrier",
    "SEA": "OT system integrators; AMI vendor; architecture consultants",
    "OPS": "MSSP / SOC provider; OT operations support vendors",
    "SAT": "Training content providers",
    "TDA": "AMI vendor; meter manufacturer; software suppliers; system integrators",
    "TPM": "All AMI / OT vendors, integrators and service providers",
    "THR": "Threat intelligence providers; sector ISAC; CISA",
    "VPM": "AMI vendor; OT equipment manufacturers; vulnerability scanning vendor",
    "WEB": "Customer portal provider; web hosting / CDN provider",
}

# ---------------------------------------------------------------------------
# Domain-level content
#   intent     -> Policy Statement (Management Intent)
#   ot_context -> appended to Control Objectives ("Within the OT and AMI environment, this objective ...")
#   std_items  -> OT/AMI-specific requirements appended to Control Standards
#   guide      -> OT/AMI implementation guidance (Control Guidelines)
# ---------------------------------------------------------------------------
DOMAIN = {}

DOMAIN["GOV"] = dict(
    intent="The organization shall establish, resource and govern a single security, compliance and resilience program that spans enterprise IT, Operational Technology (OT) and Advanced Metering Infrastructure (AMI). Governance shall assign clear executive accountability for OT and AMI cyber risk, align with the IEC 62443 security program model and ensure that safety, reliability and regulatory obligations are treated as first-order program outcomes.",
    ot_context="extends program governance to the OT and AMI environments so that IT, OT and field operations operate under one accountable program with shared policies, standards and reporting",
    std_items=[
        "Designating an executive sponsor and an OT Security Lead with documented authority over OT and AMI cyber risk decisions",
        "Integrating IEC 62443-2-1 security program requirements and applicable regulatory obligations (e.g., NERC CIP, state utility commission requirements) into program charters, policies and reporting",
        "Reporting OT and AMI program status, material risks and key risk indicators to the governing body at least annually",
    ],
    guide="Establish a converged IT/OT security governance forum with representation from IT, OT engineering, system operations, AMI operations, safety and compliance. Define decision rights for OT changes that affect safety or reliability. Align program documentation to IEC 62443-2-1 (ORG) requirements and use NIST CSF 2.0 Govern (GV) outcomes for executive reporting.",
)

DOMAIN["AST"] = dict(
    intent="The organization shall maintain accurate, authoritative inventories of all technology assets across enterprise IT, OT and AMI, including meters, collectors, gateways, RTUs, PLCs, HMIs, engineering workstations and head-end systems. Asset management shall identify ownership, criticality, zone assignment and interdependencies so that risk, change, vulnerability and incident processes operate on complete and trusted asset data.",
    ot_context="applies to OT and AMI assets, including field devices that cannot be actively scanned, and supports the definition of the System Under Consideration (SUC), zones and conduits required by ISA/IEC 62443-3-2",
    std_items=[
        "Maintaining an OT and AMI asset inventory that records device type, firmware version, physical location, zone and conduit assignment, criticality and the accountable owner",
        "Using passive discovery, head-end system records and field work-order data to maintain inventory accuracy for devices that cannot be actively scanned",
        "Reconciling the OT and AMI inventory with the enterprise CMDB and the AMI head-end at a defined frequency (at least quarterly)",
    ],
    guide="Use passive OT asset discovery and AMI head-end registration data as authoritative sources for field devices. Record zone/conduit membership and safety designation per ISA/IEC 62443-3-2 ZCR 6.4. Maintain current network and data-flow diagrams covering enterprise, DMZ, control center, substation, backhaul and AMI mesh networks.",
)

DOMAIN["BCD"] = dict(
    intent="The organization shall maintain the capability to continue and recover essential operations, including energy delivery, metering, billing-critical data collection and control system functions, during adverse events. Continuity and disaster recovery for OT and AMI shall prioritize safety and service availability, address loss of head-end, communications and control systems, and be exercised with OT personnel.",
    ot_context="prioritizes the availability and safe operation of OT and AMI services, including manual or degraded-mode operations when head-end, communications or control systems are unavailable",
    std_items=[
        "Documenting manual and degraded-mode operating procedures for metering, control and field operations when OT or AMI systems are unavailable",
        "Maintaining recovery capabilities for AMI head-end, meter data management, SCADA/DMS and supporting telecommunications that meet documented recovery time and recovery point objectives",
        "Exercising OT and AMI recovery scenarios, including ransomware and loss of communications, with system operations and field personnel at least annually",
    ],
    guide="Include OT and AMI systems in the business impact analysis with reliability and safety consequences. Maintain offline, integrity-verified backups of controller logic, HMI projects, head-end configuration, meter programs and cryptographic material. Validate restoration in an isolated recovery environment. Align with NIST SP 800-82 R3 CP controls and NERC CIP-009 where applicable.",
)

DOMAIN["CAP"] = dict(
    intent="The organization shall plan and monitor capacity and performance for OT, AMI and supporting telecommunications so that control, metering and data-collection functions remain available under peak load, storm response and adverse conditions.",
    ot_context="covers AMI head-end, meter data management, backhaul and control system capacity so that read success rates, control message latency and storm-mode operations are sustained",
    std_items=[
        "Monitoring AMI read success rates, backhaul utilization and head-end performance against defined thresholds",
        "Planning capacity for storm restoration, mass outage notification and firmware campaign loads",
    ],
    guide="Define performance thresholds for AMI data collection and control traffic; implement resource prioritization for control and safety traffic over informational traffic; align to IEC 62443-3-3 SR 7.1/7.2 resource availability requirements.",
)

DOMAIN["CHG"] = dict(
    intent="The organization shall manage changes to enterprise IT, OT and AMI assets through a formal change management process that evaluates safety, reliability and security impact before implementation. Changes to OT and AMI assets, including firmware, controller logic, head-end configuration and network security controls, shall be tested, approved and documented.",
    ot_context="requires change control for OT and AMI changes, including firmware campaigns, controller logic, head-end configuration and zone or conduit changes, with explicit evaluation of safety and reliability impact",
    std_items=[
        "Requiring OT Engineering and System Operations approval for changes that affect OT or AMI assets, zones or conduits",
        "Testing OT and AMI changes in a representative non-production environment and defining rollback procedures before deployment",
        "Scheduling OT and AMI changes within approved maintenance windows and coordinating with operational and regulatory requirements",
    ],
    guide="Establish an OT Change Control Board (or OT representation on the enterprise CAB). Treat meter firmware campaigns as controlled changes with phased rollout and rollback. Align with IEC 62443-2-1 CM requirements and NERC CIP-010 configuration change management where applicable.",
)

DOMAIN["CLD"] = dict(
    intent="The organization shall govern the use of cloud and hosted services that support OT and AMI operations, including hosted head-end, meter data management and analytics platforms, so that availability, data protection and segregation requirements are met and that cloud connectivity does not create unmanaged paths into OT networks.",
    ot_context="governs hosted AMI head-end, meter data management and analytics services and the connectivity between those services and on-premise OT networks",
    std_items=[
        "Documenting the shared responsibility model for hosted AMI and OT support services",
        "Restricting connectivity between hosted services and OT networks to defined, monitored conduits",
    ],
    guide="Require contractual security, availability and data-location commitments from hosted HES/MDM providers; route hosted-service connectivity through the OT DMZ; align to CSA IoT and NIST SP 800-161 requirements for cloud-backed field devices.",
)

DOMAIN["CPL"] = dict(
    intent="The organization shall identify, interpret and maintain conformity with the statutory, regulatory and contractual obligations that apply to its enterprise IT, OT and AMI environments, including NERC CIP where applicable, state utility commission requirements, customer data privacy obligations and contractual security requirements, and shall be able to demonstrate conformity through evidence.",
    ot_context="includes OT and AMI regulatory obligations and the ability to evidence conformity for regulators, auditors and customers",
    std_items=[
        "Maintaining a compliance obligations register that identifies OT and AMI regulatory, contractual and customer-privacy requirements and the controls that satisfy them",
        "Including OT and AMI systems in the scope of compliance assessments and audits",
    ],
    guide="Map obligations to the control baseline (this Rosetta Stone) and maintain a Statement of Applicability. Include ISA/IEC 62443-3-2 ZCR 6.9 regulatory requirements in the Cyber Security Requirements Specification for each system under consideration.",
)

DOMAIN["CFG"] = dict(
    intent="The organization shall establish, enforce and monitor secure baseline configurations for all technology assets, including OT and AMI components such as head-end servers, HMIs, engineering workstations, network devices, RTUs, PLCs, collectors and meters. Baselines shall implement least functionality, be validated with manufacturers and OT engineering, and be maintained under configuration control.",
    ot_context="establishes vendor-validated, least-functionality baselines for OT and AMI components and controls deviations through OT change management",
    std_items=[
        "Developing and maintaining secure configuration baselines for OT and AMI asset classes (head-end, HMI, engineering workstation, network device, RTU/PLC, collector, meter) that are validated with the manufacturer and OT Engineering",
        "Disabling unused ports, protocols, services, optical/diagnostic interfaces and default accounts on OT and AMI components where technically feasible and safe",
        "Detecting and responding to unauthorized configuration changes on OT and AMI components through integrity monitoring or periodic baseline comparison",
    ],
    guide="Use manufacturer hardening guides, IEC 62443-4-2 component requirements and NIST SP 800-82 R3 CM controls to build baselines. Maintain golden images for HMI/EWS and reference configurations for meters and collectors. Align with NERC CIP-010 baseline configuration requirements where applicable.",
)

DOMAIN["MON"] = dict(
    intent="The organization shall maintain continuous security monitoring and centralized logging across enterprise IT, OT and AMI environments to detect, investigate and respond to anomalous and malicious activity. OT and AMI monitoring shall be protocol-aware, prioritize availability and safety, and provide visibility of head-end, network, field device and remote-access activity.",
    ot_context="provides protocol-aware visibility of OT and AMI networks, head-end systems, field devices and remote access, with event logs collected and analyzed without impairing operations",
    std_items=[
        "Collecting security event logs from AMI head-end systems, OT servers, HMIs, network security devices, remote-access gateways and, where supported, field devices into a centralized monitoring capability",
        "Deploying passive, OT-protocol-aware network monitoring at zone boundaries and key conduits to detect unauthorized devices, communications and commands",
        "Defining OT and AMI use cases and alert thresholds (e.g., mass disconnect commands, firmware pushes, unauthorized remote sessions) and reviewing them at least annually",
    ],
    guide="Deploy passive OT network detection sensors at Purdue level boundaries and the AMI head-end segment. Ensure the SOC or MSSP has OT context, playbooks and escalation to System Operations. Align with IEC 62443-3-3 SR 6.x and NERC CIP-007 R4 security event monitoring where applicable.",
)

DOMAIN["CRY"] = dict(
    intent="The organization shall protect the confidentiality and integrity of data in transit and at rest through approved cryptographic controls and industry-recognized key management. AMI and OT cryptographic material, including meter keys, certificates and firmware signing keys, shall be generated, distributed, stored, rotated and revoked under documented key management practices that preserve operational availability.",
    ot_context="protects AMI and OT communications and stored data, and governs the lifecycle of meter keys, device certificates and firmware signing keys",
    std_items=[
        "Managing AMI meter keys, device certificates and firmware signing keys through a documented key management lifecycle (generation, distribution, storage, rotation, revocation and destruction) with separation of duties",
        "Using approved algorithms and validated cryptographic modules for AMI head-end, backhaul and field communications where technically feasible, with documented compensating controls where legacy protocols cannot be encrypted",
        "Protecting cryptographic material in hardware security modules or equivalent protected storage and restricting access to authorized personnel and systems",
    ],
    guide="Maintain a cryptographic inventory for AMI and OT (algorithms, key lengths, certificate authorities, expiry). Plan for crypto-agility and post-quantum migration of long-lived field devices. Align with IEC 62443-3-3 SR 4.x and SR 3.1 and IEC 62443-4-2 CR 4.x requirements.",
)

DOMAIN["DCH"] = dict(
    intent="The organization shall classify and handle data according to its sensitivity and criticality, including Customer Energy Usage Data (CEUD), meter data, control system configurations, cryptographic material and network diagrams. Data handling practices shall prevent unauthorized disclosure or modification across enterprise, OT and AMI environments and shall control removable media and portable devices used in field and plant operations.",
    ot_context="covers meter data, customer energy usage data, OT configurations and engineering documentation, and controls removable media and portable devices used with OT and AMI assets",
    std_items=[
        "Classifying Customer Energy Usage Data, meter data, OT configurations, cryptographic material and network/zone diagrams and applying handling requirements accordingly",
        "Controlling the use of removable media and portable devices with OT and AMI assets, including scanning, authorization and tracking",
    ],
    guide="Treat CEUD as sensitive personal data; treat OT configuration and zone/conduit diagrams as restricted. Enforce removable media controls (sanitized kiosks, authorized media only) for OT maintenance. Align with NIST SP 800-82 R3 MP controls and NERC CIP-011 information protection where applicable.",
)

DOMAIN["EMB"] = dict(
    intent="The organization shall proactively manage the security, compliance and resilience risks of embedded technologies, including smart meters, collectors, gateways, field sensors and Operational Technology (OT) devices, throughout their lifecycle. Embedded devices shall be procured, configured, authenticated, monitored, updated and retired in a manner that preserves safety, reliability and the integrity of metering and control functions.",
    ot_context="applies directly to AMI meters, collectors, gateways and OT field devices, including their physical interfaces, firmware, communications and safety functions",
    std_items=[
        "Requiring AMI and OT device suppliers to meet IEC 62443-4-2 component requirements and IEC 62443-4-1 secure development practices appropriate to the target security level",
        "Protecting physical diagnostic, optical and test interfaces on meters and field devices against unauthorized use and generating alerts for tamper or interface access events",
        "Delivering firmware and configuration updates to embedded devices only through authenticated, integrity-protected channels with staged rollout and rollback capability",
    ],
    guide="Use AMI head-end tamper, interface-access and firmware-event data as security telemetry. Require signed firmware, secure boot and certificate-based device authentication where supported. Evaluate safety aspects (e.g., remote disconnect) through fault tree analysis. Map to CSA IoT SCF controls for the device-to-cloud path.",
)

DOMAIN["END"] = dict(
    intent="The organization shall harden and centrally manage endpoint devices, including OT servers, Human-Machine Interfaces (HMIs), engineering workstations and AMI head-end hosts, to protect against malicious code, unauthorized software and misuse. Endpoint protections for OT shall be validated with manufacturers and deployed so that they do not impair safety or control functions.",
    ot_context="hardens OT endpoints such as HMIs, engineering workstations, historians and head-end servers using manufacturer-validated protections (e.g., application allow-listing) that do not impair control functions",
    std_items=[
        "Deploying manufacturer-validated endpoint protection (e.g., application allow-listing, anti-malware with controlled updates, file integrity monitoring) on OT servers, HMIs, engineering workstations and head-end hosts",
        "Restricting the use of USB and other input/output ports on OT endpoints to authorized, controlled use cases",
    ],
    guide="Prefer application allow-listing and host-based integrity monitoring for OT endpoints where signature-based anti-malware is unsupported. Test endpoint protection updates in a representative OT environment before deployment. Align with IEC 62443-3-3 SR 3.2 and NIST SP 800-82 R3 SI-3 guidance.",
)

DOMAIN["HRS"] = dict(
    intent="The organization shall apply security-informed personnel practices, including screening, role definition, access agreements, separation of duties and termination procedures, to all personnel, contractors and vendors with access to enterprise IT, OT and AMI assets. Personnel with privileged or physical access to control systems, substations, meter shops and AMI head-end systems shall be subject to risk-appropriate screening and ongoing accountability.",
    ot_context="extends personnel security to employees, contractors and vendor personnel with logical or physical access to OT and AMI assets, including field crews and meter technicians",
    std_items=[
        "Applying risk-based personnel screening and access agreements to personnel, contractors and vendors with access to OT and AMI assets",
        "Promptly revoking logical and physical OT and AMI access, and recovering devices, keys and credentials, upon transfer or termination",
    ],
    guide="Include OT and AMI roles in position risk categorization. Coordinate HR, contractor management and OT access administration for timely access changes. Align with NERC CIP-004 personnel and training requirements where applicable.",
)

DOMAIN["IAC"] = dict(
    intent="The organization shall implement the principle of least privilege through identity and access management controls across enterprise IT, OT and AMI environments. Access to control systems, AMI head-end functions, field devices and remote-access paths shall be uniquely identified, strongly authenticated, authorized for a defined purpose and periodically reviewed, with compensating controls documented where OT constraints prevent individual accountability.",
    ot_context="applies least privilege to OT and AMI access, including head-end operator roles, engineering access, device and service accounts, and remote vendor access, with documented compensating controls where shared or local accounts are unavoidable",
    std_items=[
        "Managing OT and AMI accounts (operator, engineering, service, device and vendor accounts) through a documented lifecycle with unique identification where technically feasible and documented compensating controls where shared accounts are required for safe operation",
        "Enforcing multi-factor authentication for all remote access to OT and AMI environments and for privileged access to head-end and control system functions",
        "Reviewing OT and AMI access rights, including vendor and emergency accounts, at least semi-annually and upon role change",
    ],
    guide="Centralize OT identity where feasible (directory integration through the OT DMZ) while preserving local emergency access. Use privileged access management with session recording for engineering and vendor access. Align with IEC 62443-3-3 SR 1.x/2.x, IEC 62443-4-2 CR 1.x and NERC CIP-004/CIP-005/CIP-007 requirements where applicable.",
)

DOMAIN["IRO"] = dict(
    intent="The organization shall maintain a tested incident response capability that integrates enterprise IT, OT and AMI responders and prioritizes safety, service continuity and regulatory reporting. OT and AMI incident response shall address scenarios such as unauthorized control commands, mass disconnect, firmware tampering, head-end compromise and loss of communications, and shall coordinate with system operations, vendors, regulators and sector partners.",
    ot_context="integrates OT and AMI responders, system operations and vendors into incident handling and addresses OT-specific scenarios while preserving safety and service continuity",
    std_items=[
        "Maintaining OT and AMI incident response playbooks (e.g., unauthorized control or disconnect commands, head-end compromise, firmware tampering, loss of communications) that define safe containment actions and operational coordination",
        "Defining regulatory and sector reporting obligations and timelines for OT and AMI incidents (e.g., NERC CIP-008, CISA, state utility commission) and the roles responsible for reporting",
        "Exercising OT and AMI incident scenarios with system operations, field operations and key vendors at least annually",
    ],
    guide="Establish an integrated response structure with OT engineering authority to approve containment actions that affect operations. Pre-arrange vendor incident support and forensic retention of head-end and device logs. Align with NIST SP 800-82 R3 IR controls and IEC 62443-2-1 EVENT requirements.",
)

DOMAIN["IAO"] = dict(
    intent="The organization shall validate that security, compliance and resilience controls for enterprise IT, OT and AMI systems are implemented correctly, operate as intended and produce the desired outcome. Assessments of OT and AMI systems shall use methods that are safe for operational environments and shall inform authorization and risk acceptance decisions by accountable leadership.",
    ot_context="validates OT and AMI controls using operationally safe assessment methods and supports authorization decisions for zones, conduits and systems under consideration",
    std_items=[
        "Documenting assessment boundaries that reflect OT and AMI zones, conduits and systems under consideration",
        "Using operationally safe assessment methods (e.g., configuration review, passive analysis, testing in representative environments) for OT and AMI assets",
    ],
    guide="Maintain System Security Plans that document zone/conduit characteristics, operating environment assumptions and applied controls (ISA/IEC 62443-3-2 ZCR 6). Use independent assessors for high-criticality OT systems.",
)

DOMAIN["MNT"] = dict(
    intent="The organization shall perform and control maintenance of enterprise IT, OT and AMI assets, including field devices, so that maintenance activities, tools, media and remote maintenance sessions do not introduce security weaknesses or operational disruption. Vendor and remote maintenance of OT and AMI systems shall be pre-approved, authenticated, monitored and terminated when complete.",
    ot_context="controls local and remote maintenance of OT and AMI assets, including vendor sessions, maintenance laptops and portable tools used in substations, plants and meter shops",
    std_items=[
        "Pre-approving, authenticating, monitoring and logging remote maintenance sessions to OT and AMI systems and verifying session termination",
        "Controlling maintenance tools and portable devices used with OT and AMI assets, including inspection for malicious code before connection",
    ],
    guide="Route all vendor remote maintenance through a monitored OT remote-access gateway with MFA, time-bound approval and session recording. Maintain dedicated, hardened maintenance laptops for OT. Align with NIST SP 800-82 R3 MA controls and IEC 62443-2-1 NET 3.x remote access requirements.",
)

DOMAIN["MDM"] = dict(
    intent="The organization shall manage mobile devices used in OT, field and AMI operations, including handheld meter programming devices, tablets and in-vehicle computers, so that they are centrally managed, encrypted, restricted to authorized applications and connections, and can be remotely disabled if lost or compromised.",
    ot_context="covers handheld meter programming devices, field tablets and in-vehicle computers that interact with meters, collectors and OT systems",
    std_items=[
        "Centrally managing and encrypting mobile devices that interact with OT and AMI assets, with remote-wipe capability",
        "Restricting mobile devices used for OT and AMI functions to authorized applications and connections",
    ],
    guide="Enroll field devices in MDM with separate OT profiles; prohibit personally owned devices from AMI programming or OT functions; align with IEC 62443-3-3 SR 2.3 portable and mobile device requirements.",
)

DOMAIN["NET"] = dict(
    intent="The organization shall architect and operate defense-in-depth network protections that segment enterprise IT, OT and AMI networks into zones and conduits based on risk, enforce deny-by-default data flows between zones, protect wireless and backhaul communications, and tightly control remote access. Network security for OT and AMI shall preserve the availability and determinism of control and metering traffic.",
    ot_context="implements ISA/IEC 62443-3-2 zones and conduits across enterprise, DMZ, control center, substation, backhaul and AMI mesh networks with deny-by-default conduit enforcement and monitored remote access",
    std_items=[
        "Partitioning OT and AMI networks into zones and conduits based on risk assessment, with enterprise IT, OT, safety-related and AMI field networks in separate zones and all inter-zone traffic routed through monitored, deny-by-default conduits",
        "Maintaining an OT demilitarized zone (DMZ) for all data exchange between enterprise IT (including hosted services) and OT or AMI head-end systems, with no direct enterprise-to-OT connectivity",
        "Protecting AMI RF mesh, cellular and other wireless or backhaul communications with authentication and encryption and modelling them as separate zones",
    ],
    guide="Document zone/conduit drawings and characteristics (ZCR 6.3/6.4). Implement firewalls or data diodes at zone boundaries, deny-by-default rules with documented business justification, and passive monitoring of conduits. Align with IEC 62443-3-3 SR 5.x, NIST SP 800-82 R3 SC-7 and NERC CIP-005 Electronic Security Perimeter requirements where applicable.",
)

DOMAIN["PES"] = dict(
    intent="The organization shall limit physical access to control centers, substations, plants, communications sites, meter shops and AMI head-end facilities to authorized individuals, monitor physical access, and provide environmental protections that prevent avoidable equipment failure and service interruption. Physical security for OT and AMI shall address distributed and unattended field locations.",
    ot_context="addresses control centers, substations, plants, communications sites, meter shops and unattended field enclosures housing OT and AMI assets",
    std_items=[
        "Enforcing and logging physical access to control centers, substations, communications sites, meter shops and head-end facilities, and reviewing access rights at least annually",
        "Protecting unattended field enclosures, collectors and network equipment with locks, tamper detection and periodic inspection",
    ],
    guide="Apply layered physical security proportional to zone criticality (ISA/IEC 62443-3-2 ZCR 6.4 physical boundary). Integrate physical access events with security monitoring. Align with NERC CIP-006 Physical Security Perimeter and NIST SP 800-82 R3 PE controls where applicable.",
)

DOMAIN["PRI"] = dict(
    intent="The organization shall implement a risk-based and legally defensible data privacy program that governs the collection, use, retention, sharing and protection of personal data and Customer Energy Usage Data (CEUD) generated by Advanced Metering Infrastructure. Privacy practices shall honor customer transparency, choice and access rights, limit CEUD processing to authorized purposes, and satisfy applicable utility commission, state and federal privacy requirements.",
    ot_context="governs Customer Energy Usage Data and personal data collected through AMI meters and processed by head-end, meter data management, billing, analytics and third-party systems",
    std_items=[
        "Identifying Customer Energy Usage Data and associated personal data as in-scope personal data and documenting its collection, processing, retention and sharing",
        "Limiting the use and sharing of Customer Energy Usage Data to authorized purposes with customer transparency and, where required, consent or opt-out",
    ],
    guide="Maintain a CEUD data inventory and data-flow map from meter to third parties. Apply aggregation, de-identification and retention limits for analytics. Align with NIST Privacy Framework outcomes and applicable state utility commission privacy rules.",
)

DOMAIN["PRM"] = dict(
    intent="The organization shall integrate security, compliance and resilience requirements into the planning, resourcing and delivery of OT and AMI projects and programs, including meter deployments, head-end upgrades, network modernization and control system replacements, so that security is designed in rather than retrofitted.",
    ot_context="ensures OT and AMI projects (e.g., meter deployment, head-end upgrades, control system replacements) define and fund security requirements from initiation",
    std_items=[
        "Defining security, compliance and resilience requirements, including target security levels, for OT and AMI projects at initiation",
        "Allocating resources for OT and AMI security activities across project delivery and operations",
    ],
    guide="Include a Cyber Security Requirements Specification (ISA/IEC 62443-3-2 ZCR 6) in OT and AMI project deliverables and gate reviews.",
)

DOMAIN["RSK"] = dict(
    intent="The organization shall proactively identify, assess, prioritize and treat cyber risks to enterprise IT, OT and AMI systems using a consistent methodology that recognizes safety, reliability, regulatory and customer consequences. OT and AMI risk assessments shall follow the ISA/IEC 62443-3-2 zone and conduit approach to establish target security levels and shall be approved by accountable asset owners.",
    ot_context="applies the ISA/IEC 62443-3-2 risk assessment workflow to OT and AMI zones and conduits, establishing target security levels and documented risk treatment approved by accountable asset owners",
    std_items=[
        "Performing initial and detailed cyber security risk assessments for OT and AMI systems under consideration using the corporate risk matrix and consequence scales that include safety, reliability, environmental, financial and regulatory impact",
        "Establishing and documenting a target security level (SL-T) for each OT and AMI zone and conduit and recording residual risk and treatment decisions in the risk register",
        "Obtaining documented approval of OT and AMI risk assessment results and treatment plans from the accountable asset-owner management",
    ],
    guide="Adopt the ISA/IEC 62443-3-2 ZCR 1-7 workflow and Annex B risk matrix conventions; reference ISA-TR84.00.09 and process hazard analyses for safety-related zones; use IEC 62443-3-3 SL-C to evaluate countermeasure effectiveness.",
)

DOMAIN["SEA"] = dict(
    intent="The organization shall apply industry-recognized secure engineering and architecture principles, including defense-in-depth, zone and conduit partitioning and secure-by-design, to enterprise IT, OT and AMI systems. Architecture decisions for OT and AMI shall achieve the target security level for each zone and conduit while preserving safety, reliability and operational determinism.",
    ot_context="applies defense-in-depth and zone/conduit partitioning to OT and AMI architectures in order to achieve the target security level for each zone and conduit",
    std_items=[
        "Documenting OT and AMI reference architectures that define zones, conduits, DMZ patterns, trust boundaries and the target security level for each zone and conduit",
        "Reviewing OT and AMI designs against the reference architecture and IEC 62443-3-3 system requirements before deployment",
    ],
    guide="Use the Purdue model and ISA/IEC 62443-3-2 partitioning for OT; model AMI as head-end zone, backhaul conduit, collector/mesh zone and meter zone; align SL-T to IEC 62443-3-3 SR/RE selection.",
)

DOMAIN["OPS"] = dict(
    intent="The organization shall deliver secure, compliant and resilient operations through defined procedures, runbooks and security operations capabilities that cover enterprise IT, OT and AMI environments, with clear hand-offs between the security operations function, system operations and field operations.",
    ot_context="defines operating procedures and security operations coverage for OT and AMI, including coordination between the SOC, system operations and field operations",
    std_items=[
        "Maintaining standardized operating procedures for OT and AMI security operations, including coordination with system and field operations",
    ],
    guide="Document a security concept of operations for OT and AMI that defines monitoring scope, escalation paths and authority to act in operational environments.",
)

DOMAIN["SAT"] = dict(
    intent="The organization shall foster a security, compliance and resilience-minded workforce through awareness and role-based training that includes OT and AMI-specific content for engineers, operators, field crews, meter technicians and vendor personnel.",
    ot_context="delivers OT and AMI-specific awareness and role-based training to engineers, operators, field crews, meter technicians and vendor personnel",
    std_items=[
        "Delivering role-based OT and AMI security training to engineering, operations, field and vendor personnel before access is granted and at least annually thereafter",
    ],
    guide="Include OT scenarios (removable media, remote access, social engineering of field crews, safe incident reporting) in training; align with NERC CIP-004 training requirements where applicable.",
)

DOMAIN["TDA"] = dict(
    intent="The organization shall develop and acquire technology, including AMI meters, collectors, head-end systems, OT devices and integration software, through processes that define minimum security requirements, require secure development practices from suppliers, verify security before deployment and sustain product security support throughout the asset lifecycle.",
    ot_context="establishes security requirements and supplier secure-development expectations for AMI and OT products and verifies them before deployment",
    std_items=[
        "Specifying IEC 62443-4-2 component requirements, IEC 62443-4-1 secure development practices and target security levels in AMI and OT acquisition requirements",
        "Requiring suppliers to provide vulnerability disclosure, security update and end-of-support commitments for AMI and OT products",
    ],
    guide="Use the Cyber Security Requirements Specification (ISA/IEC 62443-3-2 ZCR 6.1) as the acquisition baseline; require software bills of materials and signed firmware; align with NIST SP 800-161 supplier requirements.",
)

DOMAIN["TPM"] = dict(
    intent="The organization shall manage the security, compliance and resilience risks of third parties that supply, integrate, host or support OT and AMI technologies through due diligence, contractual requirements, flow-down of security obligations, ongoing monitoring and controlled access.",
    ot_context="governs AMI vendors, meter manufacturers, system integrators, telecommunications carriers and managed service providers that supply or support OT and AMI",
    std_items=[
        "Including OT and AMI security requirements (including IEC 62443 conformance, vulnerability handling, incident notification and remote access terms) in supplier contracts and flowing them down to subcontractors",
        "Assessing the criticality and security posture of AMI and OT suppliers and integrators before onboarding and periodically thereafter",
    ],
    guide="Maintain a supplier inventory for OT and AMI; prioritize assessments by consequence of compromise; align with NIST SP 800-161 C-SCRM practices and IEC 62443-2-4 service provider requirements.",
)

DOMAIN["THR"] = dict(
    intent="The organization shall maintain threat intelligence-informed capabilities to identify, assess and manage threats to enterprise IT, OT and AMI systems, including sector-specific threats to energy delivery and metering infrastructure, and shall share and consume threat information with sector partners.",
    ot_context="incorporates OT and energy-sector threat intelligence (e.g., E-ISAC, CISA advisories, vendor advisories) into risk assessment, monitoring and response",
    std_items=[
        "Consuming and actioning OT and energy-sector threat intelligence and vendor security advisories for AMI and OT products",
    ],
    guide="Participate in sector information sharing; maintain a threat catalog for OT and AMI zones (ISA/IEC 62443-3-2 ZCR 5.1); feed indicators into OT monitoring.",
)

DOMAIN["VPM"] = dict(
    intent="The organization shall reduce exploitable weaknesses in enterprise IT, OT and AMI assets through risk-based vulnerability identification, ranking and remediation. OT and AMI vulnerability management shall use operationally safe discovery methods, coordinate firmware and patch deployment with manufacturers and system operations, and apply documented compensating controls where timely patching is not feasible.",
    ot_context="applies operationally safe vulnerability identification and risk-based remediation to OT and AMI assets, with compensating controls where patching is constrained by safety, availability or vendor support",
    std_items=[
        "Identifying vulnerabilities in OT and AMI assets through vendor advisories, passive monitoring, configuration review and scanning only where validated as safe",
        "Deploying firmware and security patches to OT and AMI assets within risk-based timelines agreed with OT Engineering and System Operations, with testing, staged rollout and rollback, and documenting compensating controls where remediation is delayed",
    ],
    guide="Track vulnerabilities against the OT/AMI asset inventory; use ISA-TR62443-2-3 patch management guidance; align with NERC CIP-007 R2 patch management where applicable.",
)

DOMAIN["WEB"] = dict(
    intent="The organization shall protect Internet-facing services, including customer energy portals, vendor portals and application interfaces that expose AMI or OT data, through secure design, strong customer authentication, protective infrastructure and ongoing monitoring.",
    ot_context="protects customer-facing portals and APIs that expose AMI-derived data from being used as a path to AMI or OT systems",
    std_items=[
        "Isolating customer-facing portals and APIs that present AMI data from OT and head-end systems through the DMZ and read-only data services",
    ],
    guide="Expose only de-identified or customer-authorized data; place portals behind a WAF; never permit portal infrastructure to initiate connections into OT zones.",
)

# ---------------------------------------------------------------------------
# Sub-group intent overrides (prefix match) - more specific policy statements
# ---------------------------------------------------------------------------
INTENT_OVERRIDE = [
    ("NET-14", "The organization shall restrict remote access to OT and AMI environments to authorized, strongly authenticated and monitored sessions that traverse managed access control points, so that vendors, integrators and remote operators cannot establish unmanaged paths into control or metering systems."),
    ("NET-15", "The organization shall protect wireless and radio-frequency communications used by OT and AMI, including RF mesh, cellular backhaul and plant wireless networks, through authentication, encryption, boundary definition and rogue detection, treating wireless networks as distinct zones."),
    ("IAC-10", "The organization shall manage authenticators for enterprise, OT and AMI accounts, including device and service credentials, so that default credentials are eliminated, authenticators are protected and rotated, and compensating controls are documented where field devices cannot support modern authenticator practices."),
    ("IAC-16", "The organization shall manage privileged access to OT and AMI systems through dedicated privileged accounts, privileged access management and session monitoring, so that engineering, head-end administrative and vendor privileges are granted for a defined purpose and duration."),
    ("BCD-11", "The organization shall maintain protected, integrity-verified backups of OT and AMI systems, including controller logic, head-end configuration, meter programs and cryptographic material, and shall validate that those backups can restore operations within required timeframes."),
    ("BCD-12", "The organization shall maintain protected, integrity-verified backups of OT and AMI systems, including controller logic, head-end configuration, meter programs and cryptographic material, and shall validate that those backups can restore operations within required timeframes."),
    ("DCH-12", "The organization shall control the use of removable media and portable storage with OT and AMI assets so that media cannot introduce malicious code or exfiltrate control system data."),
    ("PES-07", "The organization shall provide supporting utilities, fire protection and environmental controls for facilities housing OT and AMI assets so that preventable hardware failures and service interruptions are avoided."),
    ("PES-08", "The organization shall provide supporting utilities, fire protection and environmental controls for facilities housing OT and AMI assets so that preventable hardware failures and service interruptions are avoided."),
    ("PES-09", "The organization shall provide supporting utilities, fire protection and environmental controls for facilities housing OT and AMI assets so that preventable hardware failures and service interruptions are avoided."),
    ("MON-0", "The organization shall generate, centrally collect, protect and retain security event logs from enterprise IT, OT and AMI systems with synchronized time stamps, so that events can be correlated, investigated and used as evidence without impairing operations."),
    ("MON-1", "The organization shall generate, centrally collect, protect and retain security event logs from enterprise IT, OT and AMI systems with synchronized time stamps, so that events can be correlated, investigated and used as evidence without impairing operations."),
    ("TPM-05", "The organization shall define and enforce contractual security, privacy, incident notification, remote access and flow-down requirements for vendors, integrators and service providers that supply or support OT and AMI technologies."),
    ("VPM-05", "The organization shall apply a risk-based approach to software and firmware patching across enterprise IT, OT and AMI assets, coordinating with manufacturers and system operations so that security updates are tested, staged and deployed without compromising safety or availability, with compensating controls documented where patching is delayed."),
    ("CRY-09", "The organization shall manage cryptographic keys and certificates for enterprise, OT and AMI systems, including meter keys and firmware signing keys, through a documented lifecycle with separation of duties and protected storage that preserves operational availability."),
    ("EMB-07", "The organization shall securely update software and firmware on embedded devices, including smart meters and field devices, through authenticated, integrity-protected and staged processes with rollback capability."),
]

# ---------------------------------------------------------------------------
# Control-specific overrides (exact SCF ID). Keys: ot_context, std_items, guide
# ---------------------------------------------------------------------------
CTRL = {}

CTRL["GOV-01"] = dict(
    std_items=[
        "Chartering an OT and AMI security program within the enterprise security, compliance and resilience program, with documented scope covering control centers, substations, plants, telecommunications and AMI field infrastructure",
        "Assigning executive accountability and an OT Security Lead for OT and AMI cyber risk",
        "Aligning the program with IEC 62443-2-1 and applicable regulatory obligations and reporting status to the governing body at least annually",
    ],
)
CTRL["AST-02"] = dict(
    std_items=[
        "Maintaining an inventory of OT and AMI assets (meters, collectors, gateways, RTUs, PLCs, HMIs, engineering workstations, historians, head-end and MDM servers, network and security devices) that records owner, location, firmware version, zone/conduit assignment and criticality",
        "Reconciling the OT and AMI inventory with the AMI head-end and the enterprise CMDB at least quarterly and after deployment campaigns",
    ],
)
CTRL["AST-04"] = dict(
    std_items=[
        "Maintaining current network diagrams and data-flow diagrams for OT and AMI environments that identify zones, conduits, access points, protocols and external connections, consistent with ISA/IEC 62443-3-2 ZCR 6.3",
        "Reviewing and updating OT and AMI diagrams after significant changes and at least annually",
    ],
)
CTRL["NET-03"] = dict(
    ot_context="defines and protects the external boundary of OT and AMI networks and key internal boundaries between enterprise IT, the OT DMZ, control, safety and AMI field zones, consistent with ISA/IEC 62443-3-2 zone and conduit partitioning",
    std_items=[
        "Defining the external boundary and key internal boundaries of OT and AMI networks as zones and conduits, and documenting every access point",
        "Routing all communications between enterprise IT (including hosted services) and OT or AMI head-end systems through an OT DMZ with boundary protection devices and no direct connectivity",
        "Monitoring and controlling communications at each zone boundary with deny-by-default rules and documented business justification for each permitted flow",
    ],
    guide="Model boundaries per ISA/IEC 62443-3-2 ZCR 1.1 and 3.x; align with IEC 62443-3-3 SR 5.2, NIST SP 800-82 R3 SC-7 and NERC CIP-005 Electronic Security Perimeters where applicable; consider data diodes for one-way historian or telemetry flows.",
)
CTRL["NET-06"] = dict(
    ot_context="implements ISA/IEC 62443-3-2 zone and conduit partitioning (ZCR 3.1 through 3.6), separating enterprise IT, OT, safety-related, wireless, temporarily connected and externally connected assets",
    std_items=[
        "Grouping OT and AMI assets into zones based on risk assessment, criticality, function and required access, and modelling communications between zones as conduits",
        "Placing enterprise IT, OT control, safety-related, AMI head-end, AMI field/wireless, temporarily connected and externally connected assets in separate zones",
        "Documenting zone and conduit characteristics, including target security level, for each zone and conduit",
    ],
    guide="Apply the Purdue model and ISA/IEC 62443-3-2 ZCR 3 recommendations; use IEC 62443-3-3 SR 5.1 and NIST SP 800-82 R3 segmentation guidance; verify segmentation through configuration review and passive monitoring.",
)
CTRL["NET-14"] = dict(
    std_items=[
        "Requiring all remote access to OT and AMI environments to traverse a managed remote-access gateway in the OT DMZ with multi-factor authentication, time-bound approval and session logging",
        "Prohibiting direct remote connectivity (e.g., vendor modems, unmanaged VPNs, remote desktop exposed to enterprise or Internet networks) to OT and AMI assets",
        "Providing the capability to immediately disconnect or disable remote access to OT and AMI environments",
    ],
    guide="Treat remote access as an external zone per ISA/IEC 62443-3-2 ZCR 3.6; align with IEC 62443-2-1 NET 3.x, NIST SP 800-82 R3 AC-17 and NERC CIP-005 R2 interactive remote access requirements where applicable.",
)
CTRL["NET-15"] = dict(
    std_items=[
        "Modelling AMI RF mesh, cellular backhaul and plant wireless networks as separate zones with access points or gateways as conduits",
        "Enforcing authentication and encryption for wireless communications and detecting rogue or unauthorized wireless devices in OT and AMI environments",
    ],
    guide="Apply ISA/IEC 62443-3-2 ZCR 3.5; align with IEC 62443-3-3 SR 1.6 and NIST SP 800-82 R3 AC-18.",
)
CTRL["IAC-01"] = dict(
    std_items=[
        "Governing identity and access management for OT and AMI environments, including head-end operator roles, engineering access, device and service accounts and vendor access, under the enterprise IAM program with OT-specific standards",
        "Documenting compensating controls where OT or AMI components cannot support unique identification or centralized authentication",
    ],
)
CTRL["IAC-06"] = dict(
    std_items=[
        "Enforcing multi-factor authentication for all remote access to OT and AMI environments and for privileged access to head-end, control system and engineering functions",
        "Documenting compensating controls (e.g., physical access controls, jump hosts, session monitoring) where OT components cannot natively support multi-factor authentication",
    ],
)
CTRL["IAC-15"] = dict(
    std_items=[
        "Managing OT and AMI accounts, including operator, engineering, service, device, emergency and vendor accounts, through a documented lifecycle with periodic review",
        "Removing or disabling default accounts and credentials on OT and AMI components, or documenting compensating controls where removal is not supported",
    ],
)
CTRL["IAC-16"] = dict(
    std_items=[
        "Managing privileged access to head-end, control system, engineering and network security functions through privileged access management with session recording",
        "Granting vendor and integrator privileged access on a time-bound, approved basis",
    ],
)
CTRL["IAC-19"] = dict(
    std_items=[
        "Prohibiting shared credentials except where required for safe OT operation, in which case documenting the accounts, the compensating controls (e.g., physical access control, logging, periodic credential change) and the accountable owner",
    ],
)
CTRL["CFG-02"] = dict(
    std_items=[
        "Developing secure configuration baselines for each OT and AMI asset class (head-end and MDM servers, HMIs, engineering workstations, historians, network and security devices, RTUs/PLCs, collectors and meters) validated with the manufacturer and OT Engineering",
        "Maintaining baselines under configuration control and comparing deployed configurations to the baseline at least annually and after changes",
    ],
)
CTRL["CFG-03"] = dict(
    std_items=[
        "Disabling unnecessary ports, protocols, services, applications and physical interfaces (including optical and diagnostic ports) on OT and AMI components where technically feasible and safe",
        "Documenting required ports, protocols and services for each OT and AMI asset class with business justification",
    ],
)
CTRL["VPM-05"] = dict(
    std_items=[
        "Evaluating manufacturer security updates for OT and AMI assets within risk-based timelines (e.g., assessment within thirty-five (35) days of release) and deploying updates within timelines agreed with OT Engineering and System Operations",
        "Testing firmware and patches in a representative environment, deploying in stages with rollback capability, and coordinating deployment with maintenance windows",
        "Documenting compensating controls and risk acceptance where updates cannot be applied due to safety, availability or vendor support constraints",
    ],
)
CTRL["VPM-06"] = dict(
    std_items=[
        "Using operationally safe vulnerability identification methods (vendor advisories, passive monitoring, configuration review, offline analysis) for OT and AMI assets and performing active scanning only where validated as safe and approved by OT Engineering",
    ],
)
CTRL["MNT-05"] = dict(
    std_items=[
        "Pre-approving, authenticating (with multi-factor authentication), monitoring, logging and recording remote maintenance sessions to OT and AMI systems",
        "Verifying termination of remote maintenance sessions and disabling vendor accounts when not in use",
    ],
)
CTRL["END-04"] = dict(
    std_items=[
        "Deploying manufacturer-validated anti-malware or application allow-listing on OT servers, HMIs, engineering workstations and head-end hosts, with signature and policy updates tested and deployed under change control",
    ],
)
CTRL["MON-01"] = dict(
    std_items=[
        "Including OT and AMI head-end, network, remote-access and field-device telemetry (e.g., tamper, interface access, firmware events) in continuous monitoring",
        "Deploying passive, protocol-aware monitoring at OT and AMI zone boundaries and key conduits",
    ],
)
CTRL["MON-02"] = dict(
    std_items=[
        "Forwarding security event logs from AMI head-end systems, OT servers, HMIs, network security devices and remote-access gateways to the centralized logging capability through the OT DMZ",
        "Capturing AMI head-end audit events, including disconnect/reconnect commands, firmware operations, key management operations and configuration changes",
    ],
)
CTRL["MON-07"] = dict(
    std_items=[
        "Synchronizing OT and AMI system clocks to an authoritative, protected time source and monitoring for time drift that would impair event correlation or metering integrity",
    ],
)
CTRL["CRY-01"] = dict(
    std_items=[
        "Protecting AMI head-end to collector, collector to meter and backhaul communications with approved cryptography where supported, and documenting compensating controls for legacy protocols that cannot be encrypted",
        "Protecting the integrity of control and firmware traffic through cryptographic authentication or integrity mechanisms",
    ],
)
CTRL["CRY-09"] = dict(
    std_items=[
        "Managing AMI meter keys, device certificates and firmware signing keys through a documented lifecycle (generation, distribution, storage, rotation, revocation and destruction) with separation of duties and hardware-protected storage",
        "Maintaining an inventory of cryptographic keys and certificates for OT and AMI with expiry tracking and rotation plans",
    ],
)
CTRL["BCD-11"] = dict(
    std_items=[
        "Backing up OT and AMI systems, including controller logic, HMI projects, head-end and MDM configuration, meter programs and cryptographic material, to protected, offline or immutable storage",
        "Testing restoration of OT and AMI backups at least annually in an isolated environment",
    ],
)
CTRL["PES-03"] = dict(
    std_items=[
        "Enforcing physical access controls at control centers, substations, plants, communications sites, meter shops and head-end facilities proportional to zone criticality, and logging access",
        "Protecting unattended field enclosures and collectors with locks, tamper detection and periodic inspection",
    ],
)
CTRL["IRO-01"] = dict(
    std_items=[
        "Integrating OT and AMI responders, System Operations and key vendors into the incident response capability with defined authority to approve containment actions that affect operations",
    ],
)
CTRL["IRO-04"] = dict(
    std_items=[
        "Including OT and AMI scenarios (unauthorized control or disconnect commands, head-end compromise, firmware tampering, loss of communications, ransomware affecting OT) in the incident response plan with safe containment and recovery actions",
        "Defining OT and AMI regulatory and sector reporting obligations, timelines and responsible roles within the plan",
    ],
)
CTRL["IRO-10"] = dict(
    std_items=[
        "Reporting OT and AMI incidents to regulators, sector partners and customers in accordance with applicable obligations (e.g., NERC CIP-008, CISA, state utility commission, customer notification laws) and documented timelines",
    ],
)
CTRL["RSK-04"] = dict(
    std_items=[
        "Performing initial and detailed cyber security risk assessments for each OT and AMI system under consideration following the ISA/IEC 62443-3-2 workflow (ZCR 2 through ZCR 5)",
        "Using consequence scales that include personnel safety, reliability and service delivery, environmental, financial, regulatory and customer impact",
    ],
)
CTRL["RSK-04.1"] = dict(
    std_items=[
        "Recording OT and AMI zone and conduit risks, target security levels, residual risk and treatment decisions in the risk register",
    ],
)
CTRL["RSK-13"] = dict(
    std_items=[
        "Obtaining documented approval of OT and AMI risk assessment results, target security levels and treatment plans from accountable asset-owner management (ISA/IEC 62443-3-2 ZCR 7.1)",
    ],
)
CTRL["SEA-03"] = dict(
    std_items=[
        "Documenting a defense-in-depth reference architecture for OT and AMI that defines zones, conduits, DMZ patterns and the target security level for each zone and conduit",
    ],
)
CTRL["TPM-05"] = dict(
    std_items=[
        "Including in AMI and OT supplier contracts: conformance to applicable IEC 62443 requirements, vulnerability disclosure and remediation commitments, security update and end-of-support commitments, incident notification timelines, remote access terms and flow-down to subcontractors",
    ],
)
CTRL["TDA-02"] = dict(
    std_items=[
        "Specifying minimum security requirements for AMI and OT products, including IEC 62443-4-2 component requirements, secure firmware update, device authentication, logging and target security level, in acquisition documents and the Cyber Security Requirements Specification",
    ],
)
CTRL["EMB-01"] = dict(
    std_items=[
        "Establishing an embedded technology security standard covering AMI meters, collectors, gateways and OT field devices across acquisition, deployment, operation, update and retirement",
    ],
)
CTRL["EMB-03"] = dict(
    std_items=[
        "Managing OT risks through the ISA/IEC 62443-3-2 zone and conduit risk assessment process and the IEC 62443-2-1 security program requirements",
    ],
)
CTRL["EMB-04"] = dict(
    std_items=[
        "Disabling or protecting meter optical ports, collector diagnostic interfaces and field device test interfaces against unauthorized use, and alerting on interface access and tamper events",
    ],
)
CTRL["EMB-07"] = dict(
    std_items=[
        "Deploying meter and field device firmware only when cryptographically signed and integrity-verified, through staged campaigns with rollback capability and monitoring of update success",
    ],
)
CTRL["EMB-12"] = dict(
    std_items=[
        "Configuring meters and collectors to initiate communications to authorized head-end or collector endpoints and to reject unsolicited inbound connections where supported",
    ],
)
CTRL["EMB-13"] = dict(
    std_items=[
        "Restricting meter, collector and gateway communications to authorized peers and head-end endpoints through certificate-based authentication or equivalent mechanisms",
    ],
)
CTRL["EMB-15"] = dict(
    std_items=[
        "Evaluating the safety aspects of remote disconnect, load control and other embedded functions through fault tree analysis or equivalent methods and designating safety-related zones accordingly (ISA/IEC 62443-3-2 ZCR 3.3)",
    ],
)
CTRL["EMB-16"] = dict(
    std_items=[
        "Enforcing certificate-based authentication between meters, collectors, gateways and head-end services, with certificates issued and revoked through the managed PKI",
    ],
)
CTRL["PRI-01"] = dict(
    std_items=[
        "Including Customer Energy Usage Data and associated personal data collected through AMI within the scope of the data privacy program and documenting the applicable utility commission, state and federal privacy requirements",
    ],
)
CTRL["PRI-04"] = dict(
    std_items=[
        "Limiting the collection, processing and sharing of Customer Energy Usage Data to the purposes identified in customer notices and regulatory authorizations",
    ],
)
CTRL["PRI-07"] = dict(
    std_items=[
        "Sharing Customer Energy Usage Data with third parties only under contractual privacy and security obligations and, where required, customer authorization",
    ],
)
CTRL["THR-01"] = dict(
    std_items=[
        "Incorporating energy-sector and OT threat intelligence (e.g., sector ISAC, CISA ICS advisories, manufacturer advisories) into risk assessments, monitoring use cases and response planning",
    ],
)
CTRL["CHG-02"] = dict(
    std_items=[
        "Applying configuration change control to OT and AMI changes, including firmware campaigns, controller logic, head-end configuration and zone or conduit rule changes, with OT Engineering and System Operations approval",
    ],
)
CTRL["SAT-03"] = dict(
    std_items=[
        "Delivering role-based OT and AMI security training to engineers, operators, field crews, meter technicians and vendor personnel before access is granted and at least annually thereafter",
    ],
)
CTRL["HRS-04"] = dict(
    std_items=[
        "Applying risk-based screening to personnel, contractors and vendor personnel with authorized logical or unescorted physical access to OT and AMI assets",
    ],
)
CTRL["DCH-12"] = dict(
    std_items=[
        "Permitting only authorized, scanned removable media with OT and AMI assets and tracking media used for maintenance and firmware transfer",
    ],
)
