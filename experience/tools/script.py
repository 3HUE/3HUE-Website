#!/usr/bin/env python3
"""The guided-tour script. Run this to regenerate content/tour.json (python tools/script.py).
Every guide line gets an id = "<node>-<n>"; tools/build-voice.py renders media/voice/<id>.mp3 + .json timings."""
import json, os

R = 'media/scene/rooms/'
G = {'name': 'AiVRIC', 'title': 'Your 3HUE guide', 'voice': 'en-US-AvaNeural'}

def cam(x0=0.5, y0=0.5, z0=1.0, x1=0.5, y1=0.5, z1=1.08):
    return {'from': {'x': x0, 'y': y0, 'z': z0}, 'to': {'x': x1, 'y': y1, 'z': z1}}

def chips(title, items): return {'type': 'chips', 'title': title, 'items': items}
def stats(items): return {'type': 'stats', 'items': items}
def card(title, body, img=None): return {'type': 'card', 'title': title, 'body': body, 'img': img}
def image(src, cap): return {'type': 'image', 'src': src, 'cap': cap}

N = {}
def scene(id, chapter, bg, lines, next=None, cam_=None, title=None, choice=None):
    N[id] = {'type': 'scene', 'chapter': chapter, 'bg': bg, 'cam': cam_ or cam(), 'title': title,
             'lines': [{'id': f'{id}-{i+1}', 'text': t, 'show': s} for i, (t, s) in enumerate(lines)],
             'next': next, 'choice': choice}
def choice(prompt, options, remember=None):
    return {'prompt': prompt, 'remember': remember, 'options': options}
def opt(label, next, tag=None, sub=None): return {'label': label, 'next': next, 'tag': tag, 'sub': sub}

# ---------------------------------------------------------------- 1. Arrival
scene('arrive', 'Arrival', R + 'vision.jpg', [
    ("Welcome to 3HUE. I'm AiVRIC — the risk intelligence fabric that runs through this building, and I'll be your guide today.", None),
    ("Everything you're about to see is real: six managed security programs, an engineering team, a boardroom, and the pathway that connects them. It's how 3HUE turns governance into decisions executives can act on.", None),
    ("Before we walk, tell me who I'm walking with. I'll shape the tour around what matters to you.", None),
], cam_=cam(0.5, 0.55, 1.0, 0.5, 0.5, 1.10), title='Inside 3HUE',
   choice=choice('Who am I walking with today?', [
       opt('An executive weighing the investment', 'why', 'exec', 'CEO, CFO, board member'),
       opt('A technology leader', 'why', 'tech', 'CIO, CISO, head of IT'),
       opt('A security or compliance practitioner', 'why', 'practitioner', 'GRC, audit, risk, IT security'),
       opt('Just show me everything', 'why', 'all'),
   ], remember='audience'))

# ---------------------------------------------------------------- 2. Why this exists
scene('why', 'Why this building exists', R + 'boardroom.jpg', [
    ("Let's start where most security conversations end — in the boardroom. The reason 3HUE built this model is simple: the adversary got faster than the traditional way of defending.", None),
    ("A zero-day can become a breach in under thirty minutes. Seventy-one percent of breaches are only detected after the data has already left. And deepfake-driven fraud rose nine hundred percent in a single year.",
     stats([{'n': '<30 min', 'l': 'zero-day to breach'}, {'n': '71%', 'l': 'breaches detected after exfiltration'}, {'n': '900%', 'l': 'rise in deepfake fraud'}])),
    ("At the same time, the pressure from the other direction is rising. Seventy-two new privacy laws were proposed in one year, ninety-two percent of boards now expect reporting on cyber and compliance posture, and sixty percent of consumers walk away after a data misuse event.",
     stats([{'n': '72', 'l': 'new privacy laws proposed in a year'}, {'n': '92%', 'l': 'of boards expect cyber posture reporting'}, {'n': '60%', 'l': 'consumer abandonment after data misuse'}])),
    ("Tools alone can't close that gap. What closes it is a program: governance that sets direction, engineering that closes the gaps, and operations that watch around the clock — all feeding one picture the executives at this table can trust.", None),
], next='model', cam_=cam(0.5, 0.5, 1.12, 0.5, 0.48, 1.0))

# ---------------------------------------------------------------- 3. The model
scene('model', 'The model: three layers', 'media/scene/master.jpg', [
    ("Here's the whole building at once. 3HUE calls it Virtual CIO-as-a-Service, and it's built top-down in three layers.",
     chips('Three layers, one program', ['01 · GRC management layer — tone at the top', '02 · Secure Engineering & Architecture', '03 · Security Operations — 24/7 SOC'])),
    ("The wings are the GRC management layer — six managed programs that set policy, manage risk, respond to incidents, validate vendors, and keep you audit-ready. Above them, the engineering bridge turns those findings into architecture and hands-on fixes. And underneath everything, a managed security operations center watches in real time.", None),
    ("Each program is a room. We won't visit every one unless you want to — so tell me where the pressure is right now, and I'll take you there first.", None),
], cam_=cam(0.5, 0.45, 1.25, 0.5, 0.5, 1.0),
   choice=choice('Where is the pressure most acute right now?', [
       opt('Incidents and response readiness', 'cirp', 'cirp', 'Cyber-Incident Response Program'),
       opt('Audits and compliance deadlines', 'scs', 'scs', 'Security Compliance Services'),
       opt('Risk visibility for leadership', 'rmp', 'rmp', 'Risk Management Program'),
       opt('Third-party and vendor risk', 'vcp', 'vcp', 'Vendor Compliance Program'),
       opt('We need to build the program itself', 'isp', 'isp', 'Information Security Program'),
       opt('We lack senior security leadership', 'vciso', 'vciso', 'Virtual CISO'),
   ], remember='pressure'))

# ---------------------------------------------------------------- 4. Programs
HUB = choice('Where next?', [
    opt('Information Security Program', 'isp', 'isp'), opt('Cyber-Incident Response Program', 'cirp', 'cirp'),
    opt('Virtual CISO', 'vciso', 'vciso'), opt('Risk Management Program', 'rmp', 'rmp'),
    opt('Security Compliance Services', 'scs', 'scs'), opt('Vendor Compliance Program', 'vcp', 'vcp'),
    opt('Continue to the engineering bridge', 'sea', 'continue'),
])
scene('isp', 'Information Security Program', R + 'isp.jpg', [
    ("This is the Information Security Program room — where a formal program is built and kept alive. Policies, standards, a control baseline, and clear ownership, aligned to frameworks like SCF, NIST, or ISO.", None),
    ("The program formalizes roles and responsibilities, drives consistency across security operations and governance, and scales as regulatory or customer demands grow. Most clients see a mature SOC 2, PCI-DSS, or CMMC-aligned program stood up in under six months.",
     chips('What the ISP delivers', ['Policies, standards & control baseline', 'Roles, responsibilities & ownership', 'Consistent governance across operations', 'Scales with regulatory & customer demands'])),
    ("It runs as a managed program in twelve-month sprints — typically ninety-six to two hundred and forty-four hours a year, with about one hundred and twenty of those keeping SOC 2 evidence current.",
     stats([{'n': '96–244 h', 'l': 'annual commit'}, {'n': '~120 h', 'l': 'annual SOC 2 maintenance'}, {'n': '< 6 mo', 'l': 'to a mature compliant program'}])),
], choice=HUB, cam_=cam(0.58, 0.42, 1.0, 0.5, 0.5, 1.1))
scene('cirp', 'Cyber-Incident Response Program', R + 'cirp.jpg', [
    ("The incident response room. When something goes wrong at two in the morning, this is the program that decides who does what, in what order, and who gets told.", None),
    ("CIRP delivers structured response planning and incident command: clear roles and escalation paths for crisis scenarios, coordinated containment and recovery, and tabletop exercises so the first real incident isn't the first rehearsal.",
     chips('Prepare → Detect → Contain → Investigate → Recover', ['Response planning & playbooks', 'Incident command & escalation paths', 'Annual simulations and tabletop exercises', 'Lessons learned flow back into the risk register'])),
    ("3HUE's teams have led clients through ransomware, data breaches, and insider threats — calm in crisis, clarity through chaos. As a managed program it's seventy to one hundred and twenty hours a year.",
     stats([{'n': '70–120 h', 'l': 'annual commit'}, {'n': '15 min', 'l': 'detection to client notification with the SOC'}, {'n': '24/7', 'l': 'incident coordination'}])),
], choice=HUB, cam_=cam(0.55, 0.42, 1.0, 0.5, 0.5, 1.1))
scene('vciso', 'Virtual CISO', R + 'vciso.jpg', [
    ("The executive advisory office. A Virtual CISO is a former CISO who sits with your leadership — shaping strategy, driving decisions, and owning the security conversation with the board.", None),
    ("There are three leadership options: no vCISO if you already have one, CISO Support to build an internal capability, or a Fractional CISO as staff augmentation. Either way, you get board-facing expertise without the cost of a full-time executive hire.",
     chips('Leadership options', ['Option 1 · No vCISO — you have a security leader', 'Option 2 · CISO Support — build internal capability', 'Option 3 · Fractional CISO — staff augmentation'])),
    ("A vCISO engagement runs sixty-eight to one hundred and sixty-four hours a year, and it's the resource that can capably carry M&A due diligence, audits, and the questions a board asks after a peer gets breached.",
     stats([{'n': '68–164 h', 'l': 'annual commit'}, {'n': '3', 'l': 'engagement models'}, {'n': 'Board-ready', 'l': 'risk & compliance reporting'}])),
], choice=HUB, cam_=cam(0.5, 0.45, 1.0, 0.5, 0.5, 1.1))
scene('rmp', 'Risk Management Program', R + 'rmp.jpg', [
    ("The risk room. The Risk Management Program establishes a real risk function: identify, prioritize, and mitigate — and then keep doing it, so leadership sees risk posture as a living picture, not an annual report.", None),
    ("It prioritizes security investments on actual risk instead of fear, supports risk registers, assessments, and remediation tracking, and builds a culture where decisions are risk-informed. It also makes you ready for regulatory reviews and partner due diligence.",
     chips('What the RMP delivers', ['Enterprise risk strategy & oversight', 'Risk register, assessments & treatment tracking', 'Investment prioritized on real risk', 'Ready for regulators and partner due diligence'])),
    ("Effort scales with your risk landscape — sixty to four hundred and seventy-two hours a year, with about one hundred and forty-four for SOC 2 risk activities.",
     stats([{'n': '60–472 h', 'l': 'annual commit'}, {'n': '~144 h', 'l': 'annual SOC 2 maintenance'}, {'n': 'Continuous', 'l': 'risk monitoring & advisory'}])),
], choice=HUB, cam_=cam(0.55, 0.42, 1.0, 0.5, 0.5, 1.1))
scene('scs', 'Security Compliance Services', R + 'scs.jpg', [
    ("The compliance room — Security Compliance Services. The job here is continuous audit-readiness: never scrambling before an audit, because evidence is being collected and controls are being validated all year.", None),
    ("Continuous change detection watches your systems for unauthorized changes and misconfigurations; policy compliance tracking maps requirements to controls and evidence; and audit stakeholders are prepared before the auditor arrives. Clients see up to a sixty percent reduction in audit preparation time.",
     chips('What SCS delivers', ['Continuous change detection & exception resolution', 'Requirements → controls → evidence traceability', 'Audit stakeholder preparation', 'SOC 2, PCI-DSS, HIPAA, HITRUST, CMMC — one control framework'])),
    ("As a managed program it's sixty to one hundred and twenty hours a year — about sixty of those maintaining SOC 2 across Security, Confidentiality, and Availability.",
     stats([{'n': '60–120 h', 'l': 'annual commit'}, {'n': '−60%', 'l': 'audit preparation time'}, {'n': '1', 'l': 'control framework for every regulation'}])),
], choice=HUB, cam_=cam(0.55, 0.42, 1.0, 0.5, 0.5, 1.1))
scene('vcp', 'Vendor Compliance Program', R + 'vcp.jpg', [
    ("The third-party risk room. Your risk doesn't stop at your firewall — it lives in every supplier with access to your data. The Vendor Compliance Program manages that exposure continuously.", None),
    ("It aligns vendor practices with your risk tolerance, contractual controls, and regulatory expectations; keeps audit-ready documentation of vendor assurance; and validates the attack surface of high-risk vendors proactively rather than after an incident.",
     chips('What the VCP delivers', ['Vendor profiles, tiers & minimum requirements', 'Contract review & ongoing monitoring', 'Attack-surface posture validation', 'Audit-ready vendor assurance records'])),
    ("Effort follows the size of your vendor estate — one hundred and twenty to three hundred and sixty-five hours a year, with about two hundred and forty of those tied to SOC 2 vendor management.",
     stats([{'n': '120–365 h', 'l': 'annual commit'}, {'n': '~240 h', 'l': 'annual SOC 2 maintenance'}, {'n': 'Continuous', 'l': 'third-party assurance'}])),
], choice=HUB, cam_=cam(0.6, 0.42, 1.0, 0.5, 0.5, 1.1))

# ---------------------------------------------------------------- 5. Engineering bridge
scene('sea', 'Secure Engineering & Architecture', R + 'sea.jpg', [
    ("Up on the bridge: Secure Engineering and Architecture. Governance finds the gaps — this team closes them. Advisory, design, and hands-on engineering across Architecture, Build, Secure, and Operate.",
     chips('ISG-SEA', ['Architecture', 'Build', 'Secure', 'Operate'])),
    ("This is what makes the model different from a report. A finding in a risk room becomes a design change, a hardened configuration, or an identity control — and it's tracked back to the risk register when it's done.", None),
    ("Everything here is delivered on your platform. For organizations under about five thousand information assets, 3HUE deploys its GRC system on your Microsoft 365 tenant; if you already run an enterprise GRC platform, the team configures and maintains that instead.",
     card('On your platform', 'M365 GRC deployment for smaller estates, or configuration and maintenance of your existing enterprise GRC system.', 'media/systems/m365-grc.jpg')),
], next='fabric', cam_=cam(0.5, 0.42, 1.0, 0.5, 0.5, 1.1))

# ---------------------------------------------------------------- 6. The fabric & Client Vision
scene('fabric', 'AiVRIC & Client Vision', R + 'vision.jpg', [
    ("And this is me. The AiVRIC Risk Intelligence Fabric is where every program's signal converges: findings from the GRC rooms, changes detected across your cloud and endpoints, and events from the SOC — one data layer under every decision.", None),
    ("What executives see is Client Vision: four panels. Posture — your unified cloud, AI, and control posture across the estate. Priorities — findings ranked by business impact, not just severity. Progress — treatments, SLAs, and audit readiness tracked in one place. And Decisions — board-ready readouts.",
     chips('Client Vision', ['Posture', 'Priorities', 'Progress', 'Decisions'])),
    ("Continuous change detection feeds it in real time — inspectors for Azure, AWS, Microsoft 365, and endpoint agents across on-premises and cloud — with actionable indicators of risk defined in your runbooks.",
     card('Continuous change detection', 'Real-time detection of unauthorized changes and misconfigurations, with risk-posture notifications tied to your GRC runbooks.', 'media/systems/change-detection.png')),
    ("Underneath, the managed SOC — operated with 3HUE's partner Whitedog — provides twenty-four-seven detection and response, threat hunting, and red-team testing, with client notification within fifteen minutes of detection.",
     stats([{'n': '24/7', 'l': 'managed detection & response'}, {'n': '15 min', 'l': 'detection to notification'}, {'n': '50+', 'l': 'commercial & open-source tools'}])),
], next='exec', cam_=cam(0.5, 0.5, 1.15, 0.5, 0.5, 1.0))

# ---------------------------------------------------------------- 7. Executive alignment
scene('exec', 'Executive Alignment & Decisions', R + 'boardroom.jpg', [
    ("Back at the table. This is where every stream ends — 3HUE advisors sit with your executives to translate findings into business impact, set priorities, assign accountability, and approve action.", None),
    ("The business case sounds different depending on who's asking. Tell me whose lens to use, and I'll make the case the way they'd want to hear it.", None),
], cam_=cam(0.5, 0.5, 1.0, 0.5, 0.52, 1.1),
   choice=choice('Whose lens should I use for the business case?', [
       opt('The CEO', 'exec-ceo', 'ceo', 'Trust, growth, continuity'),
       opt('The CFO', 'exec-cfo', 'cfo', 'Cost, predictability, exposure'),
       opt('The CIO', 'exec-cio', 'cio', 'Roadmap velocity, uptime'),
       opt('The Board', 'exec-board', 'board', 'Enterprise value, oversight'),
   ], remember='lens'))
scene('exec-ceo', 'For the CEO', R + 'boardroom.jpg', [
    ("For the CEO, security is about trust, brand, and momentum. A Virtual CISO delivers board-level cybersecurity leadership that connects risk to innovation and growth. Managed GRC programs integrate governance into daily operations so regulatory exposure shrinks and the company keeps its agility.",
     chips('CEO outcomes', ['Stronger customer trust & brand loyalty', 'Revenue growth through secure innovation', 'No high-impact incident stalling strategic initiatives'])),
    ("And the managed SOC protects uptime and customer trust in real time. The argument to make: quantify avoided costs — breach recovery, lost deals, delayed M&A — and frame security as what lets the company move faster, not slower.", None),
], next='engage', cam_=cam(0.45, 0.5, 1.05, 0.5, 0.5, 1.12))
scene('exec-cfo', 'For the CFO', R + 'boardroom.jpg', [
    ("For the CFO, the case is financial risk management. A Virtual CISO aligns cybersecurity with enterprise risk to improve cost control. Managed GRC programs reduce compliance costs and audit effort by embedding controls into daily operations — audit prep stops being a fire drill.",
     chips('CFO outcomes', ['Reduced financial & reputational exposure', 'Lower total cost of maintaining compliance', 'Predictable security spend aligned to goals'])),
    ("The managed SOC delivers twenty-four-seven response at a predictable cost with no added headcount or tech licenses. Show the ROI as breach costs avoided, audit savings, and — critically — budget volatility removed.", None),
], next='engage', cam_=cam(0.55, 0.5, 1.05, 0.5, 0.5, 1.12))
scene('exec-cio', 'For the CIO', R + 'boardroom.jpg', [
    ("For the CIO, security has to be a delivery enabler. A Virtual CISO integrates security strategy into IT planning and architecture so modernization is risk-aligned from the start. Managed GRC embeds controls into delivery pipelines, which improves roadmap velocity and audit readiness at the same time.",
     chips('CIO outcomes', ['Faster delivery of digital initiatives with less risk', 'Security-aligned IT execution that scales', 'Fewer disruptions from cyber incidents'])),
    ("The managed SOC watches infrastructure and workloads around the clock and takes load off internal teams. Map the investment to KPIs the CIO already reports: faster deployment, fewer audit findings, better SLA compliance.", None),
], next='engage', cam_=cam(0.5, 0.45, 1.05, 0.5, 0.5, 1.12))
scene('exec-board', 'For the Board', R + 'boardroom.jpg', [
    ("For the Board, it's about enterprise value and oversight. A Virtual CISO aligns cybersecurity with strategy and board risk oversight — enabling secure execution of growth, M&A, and innovation. Managed GRC reinforces governance with embedded controls that lower audit risk and improve the board's reporting posture.",
     chips('Board outcomes', ['Stakeholder confidence through governance transparency', 'Faster time-to-market through trusted transformation', 'Reduced regulatory & reputational exposure'])),
    ("The managed SOC gives twenty-four-seven visibility and board assurance on incident response. Tell fiduciary-aligned stories — governance lapses, disclosure risk, recovery leadership — and use peer benchmarks to show where similar companies invest to stay compliant and competitive.", None),
], next='engage', cam_=cam(0.5, 0.5, 1.12, 0.5, 0.5, 1.0))

# ---------------------------------------------------------------- 8. How we engage
scene('engage', 'How 3HUE engages', R + 'plan.jpg', [
    ("So how does an engagement actually run? Three steps. Step one, govern and plan: we align on deliverables in a client operating plan, set operational workload retainers, define performance reporting, and publish a shared responsibility matrix so nothing falls between the cracks.",
     chips('Step 1 · Govern & plan', ['Client operating plan', 'Workload retainers in 12-month sprints', 'Performance reporting', 'Shared responsibility matrix'])),
    ("Step two, GRC operations: deploy the GRC system on your M365 tenant or your enterprise platform, define the control baseline, and operationalize the managed programs — secure share, request workflows, client portal, risk register, vendor profiles, action plans, and BI.",
     chips('Step 2 · Deploy GRC operations', ['GRC system on M365 or your platform', 'Control baseline tailored to your risk', 'Client portal, risk register, vendor profiles', 'Continuous change detection'])),
    ("Step three, security operations: the managed SOC — detection and response, internet threat protection, zero-trust network access, threat hunting and red-team testing — with continuous oversight by your vCISO and GRC team, so incident response never creates a compliance problem.",
     chips('Step 3 · Managed SOC', ['MDR across endpoints, servers & cloud', 'Internet threat protection', 'Managed zero-trust network access', 'Threat hunting & red-team testing'])),
    ("Pricing follows the same shape: choose a leadership option, choose your managed programs, choose your core security services. Everything is scoped and committed for the year — no surprise headcount, no tech licenses to carry.", None),
], next='pathway', cam_=cam(0.5, 0.5, 1.0, 0.5, 0.5, 1.1))

# ---------------------------------------------------------------- 9. Pathway & getting started
scene('pathway', 'Enterprise Maturity Pathway', 'media/scene/master.jpg', [
    ("Last stop: the pathway along the base of the building. Baseline, Establish, Operationalize, Integrate, Optimize — every client is somewhere on it, and the first step depends on where you are today.",
     chips('Enterprise Maturity Pathway', ['Baseline', 'Establish', 'Operationalize', 'Integrate', 'Optimize'])),
    ("So — where are you today?", None),
], cam_=cam(0.5, 0.9, 1.6, 0.5, 0.85, 1.35),
   choice=choice('Where is your organization today?', [
       opt('No formal program in place', 'start-none', 'none', 'Or no enterprise-wide evaluation recently'),
       opt('A program exists, but needs a strategic review', 'start-partial', 'partial'),
       opt('Urgent audit deadline or compliance gap', 'start-urgent', 'urgent', 'SOC 2, HIPAA, CMMC, PCI'),
   ], remember='state'))
scene('start-none', 'Getting started', R + 'hallway-1.jpg', [
    ("With no program in place, the right first step is a Holistic Risk and Control Posture Assessment — especially if it's been more than eighteen months since an enterprise-wide evaluation.",
     chips('What you get', ['Formal risk assessment report', 'NIST CSF 2.0 maturity scorecard', 'Security architecture remediation plan', 'Plan of actions & milestones', 'Cyber-risk advisory retainer'])),
    ("It starts with a meeting with Client Success for a deep-dive overview and initial discovery. From there you'll have a scorecard, a remediation plan, and a plan of actions and milestones to build the program on.", None),
], next='close', cam_=cam(0.5, 0.5, 1.0, 0.5, 0.5, 1.1))
scene('start-partial', 'Getting started', R + 'hallway-3.jpg', [
    ("With a program already in place, the first step is a strategic review: 3HUE reviews your existing plans, policies, and controls for modernization opportunities.",
     chips('What you get', ['Review of existing plans, policies & controls', 'Modernization opportunities', 'Stakeholder recommendations session'])),
    ("It starts with a discovery meeting with Client Success, followed by a second session with your stakeholders to walk through the recommendations — then you decide which managed programs to switch on.", None),
], next='close', cam_=cam(0.5, 0.5, 1.0, 0.5, 0.5, 1.1))
scene('start-urgent', 'Getting started', R + 'hallway-2.jpg', [
    ("When the deadline is real, the first step is a Controls Gap Assessment aligned to your framework — SOC 2, HIPAA, CMMC, or PCI — delivered fast.",
     chips('What you get', ['Controls gap assessment aligned to your framework', 'Gap reports & remediation plans', 'Engineering resources to close gaps'])),
    ("Discovery with Client Success, then a stakeholder session on the recommendations, and engineering resources standing by to close the gaps before the auditor does.", None),
], next='close', cam_=cam(0.5, 0.5, 1.0, 0.5, 0.5, 1.1))

# ---------------------------------------------------------------- 10. Close
scene('close', 'Before you go', R + 'vision.jpg', [
    ("That's the building. Governance that sets direction, engineering that closes gaps, operations that never sleep — and one fabric feeding the decisions at the table.", None),
    ("I can send you a summary of the rooms you visited, answer a specific question, or connect you with 3HUE's Client Success team. What would you like?", None),
], cam_=cam(0.5, 0.5, 1.1, 0.5, 0.5, 1.0),
   choice=choice('What would you like to do?', [
       opt('Email me a summary of my tour', 'action:email-summary', 'email'),
       opt('I have a question', 'action:ask', 'ask'),
       opt('Book a conversation with Client Success', 'action:book', 'book', 'info.3hue.net/start-now · 855-374-7129'),
       opt('Replay the tour', 'arrive', 'replay'),
   ]))

TOUR = {
    'guide': G,
    'start': 'arrive',
    'chapters': ['arrive', 'why', 'model', 'isp', 'cirp', 'vciso', 'rmp', 'scs', 'vcp', 'sea', 'fabric', 'exec', 'engage', 'pathway', 'close'],
    'programs': ['isp', 'cirp', 'vciso', 'rmp', 'scs', 'vcp'],
    'contact': {'phone': '855-374-7129', 'web': 'https://info.3hue.net/start-now', 'email': 'success@3hue.net'},
    'nodes': N,
}
if __name__ == '__main__':
    os.makedirs('content', exist_ok=True)
    json.dump(TOUR, open('content/tour.json', 'w'), indent=1, ensure_ascii=False)
    n = sum(len(v['lines']) for v in N.values()); w = sum(len(l['text'].split()) for v in N.values() for l in v['lines'])
    print(f'{len(N)} nodes, {n} lines, {w} words (~{w/150:.1f} min of speech)')
