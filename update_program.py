from pathlib import Path
snippet = '''  <button class="acc-card tech-acc-card" type="button" aria-expanded="false" aria-controls="tech-components"><span class="tech-acc-title">Program component details</span><span class="tech-acc-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"></path></svg></span></button><div id="tech-components" class="acc-panel" hidden><div class="acc-panel-inner"><div class="acc-panel-head"><h3>Program component details</h3><p>Summaries of each managed program component and leadership option.</p></div><div class="program-components-grid"><div class="program-mini-card"><h4>Information Security Program (ISP)</h4><p>Builds a formal security program aligned to frameworks like SCF, NIST, or ISO for consistent controls and audit readiness.</p><ul><li>Formalizes policies, roles, and responsibilities.</li><li>Drives consistency in security operations and governance.</li><li>Supports compliance with regulatory and contractual obligations.</li><li>Scales with growing regulatory or customer demands.</li></ul></div><div class="program-mini-card"><h4>Risk Management Program (RMP)</h4><p>Establishes risk management to identify, prioritize, and mitigate security risk with a risk-informed culture and tracking.</p><ul><li>Prioritizes security investments based on actual risk.</li><li>Builds a proactive, risk-informed decision culture.</li><li>Supports risk registers, assessments, and remediation tracking.</li><li>Improves readiness for regulatory reviews and partner diligence.</li></ul></div><div class="program-mini-card"><h4>Vendor Compliance Program (VCP)</h4><p>Manages third-party risk by aligning vendor practices to risk tolerance, contractual controls, and regulatory expectations.</p><ul><li>Improves visibility and control over third-party risks.</li><li>Audit-ready documentation of vendor assurance.</li><li>Reduces exposure through proactive vendor oversight.</li><li>Improves audit confidence and efficiency.</li></ul></div><div class="program-mini-card"><h4>Cyber-Incident Response Program (CIRP)</h4><p>Delivers response planning and incident command services with clear roles, escalation paths, and coordinated recovery.</p><ul><li>Accelerated readiness for high-severity incidents.</li><li>Clear roles and escalation paths for crisis scenarios.</li><li>Rapid, coordinated containment and recovery.</li><li>Improved preparedness for security incidents.</li></ul></div><div class="program-mini-card"><h4>Virtual CISO (vCISO)</h4><p>Executive security leadership integrated with your team to shape strategy, guide decisions, and oversee compliance.</p><ul><li>Board-facing cybersecurity expertise and guidance.</li><li>Strengthens leadership confidence and accountability.</li><li>Supports compliance initiatives and executive reporting.</li><li>Provides a resource for M&A and strategic initiatives.</li></ul></div><div class="program-mini-card"><h4>Fractional CISO</h4><p>Flexible senior CISO support as staff augmentation for organizations that do not need a full-time executive.</p><ul><li>Executive-level leadership without full-time cost.</li><li>Flexible coverage for work overflow or mentoring.</li><li>Strategic guidance during audits or incidents.</li><li>Builds internal capability through knowledge transfer.</li></ul></div></div></div></div>'''
targets = [
    'services/security-compliance-services.html',
    'services/staff-augmentation.html',
    'services/risk-posture-assessment.html',
    'services/it-project-management.html'
]
for path in targets:
    p = Path(path)
    text = p.read_text()
    if 'Program component details' in text:
        continue
    idx = text.find('<div class="tech-accordion"')
    if idx == -1:
        continue
    insert_pos = text.find('<button class="acc-card tech-acc-card"', idx)
    if insert_pos == -1:
        insert_pos = text.find('<div', idx)
    new_text = text[:insert_pos] + snippet + text[insert_pos:]
    p.write_text(new_text)
