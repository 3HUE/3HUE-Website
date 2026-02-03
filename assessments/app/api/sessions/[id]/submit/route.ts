import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { computeScores } from "../../../../../lib/scoring";
import { getVisibleQuestions, questionnaireData } from "../../../../../lib/questionnaire";
import { buildSchema } from "../../../../../lib/validation";
import { retry } from "../../../../../lib/retry";

function formatPayload(values: Record<string, unknown>, scores: ReturnType<typeof computeScores>) {
  return {
    version: questionnaireData.version,
    submittedAt: new Date().toISOString(),
    profile: {
      orgName: values.org_name,
      orgDomain: values.org_domain,
      primaryContact: values.primary_contact,
      primaryEmail: values.primary_email,
      industry: values.industry
    },
    scope: {
      apps: values.scope_apps,
      cloud: values.scope_cloud,
      awsAccounts: values.aws_accounts,
      awsRegions: values.aws_regions,
      onPrem: values.scope_onprem,
      regions: values.regions,
      users: values.user_count,
      hasOt: values.has_ot
    },
    posture: {
      identityProvider: values.identity_provider,
      mfaCoverage: values.mfa_coverage,
      centralLogging: values.central_logging,
      loggingTool: values.logging_tool,
      vulnerabilityManagement: values.vuln_mgmt,
      backupStrategy: values.backup_strategy,
      incidentResponse: values.ir_plan
    },
    compliance: {
      processesPayments: values.processes_payments,
      pciScope: values.pci_scope,
      frameworks: values.compliance_frameworks,
      lastAudit: values.last_audit,
      gaps: values.audit_gaps
    },
    evidence: {
      uploads: values.evidence_upload,
      notes: values.evidence_notes
    },
    scores
  };
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await prisma.session.findUnique({
    where: { id: params.id },
    include: { answers: true }
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const values: Record<string, unknown> = {};
  session.answers.forEach((answer) => {
    values[answer.questionId] = answer.valueJson;
  });

  const visibleQuestions = getVisibleQuestions(values).filter((question) => question.required);
  const schema = buildSchema(visibleQuestions);
  const parsed = schema.safeParse(values);

  if (!parsed.success) {
    return NextResponse.json({
      error: "Validation failed",
      issues: parsed.error.flatten().fieldErrors
    }, { status: 400 });
  }

  const scores = computeScores(values);
  const payload = formatPayload(values, scores);

  const delivery = await prisma.delivery.upsert({
    where: {
      sessionId_provider: {
        sessionId: params.id,
        provider: "external"
      }
    },
    update: {
      status: "pending",
      attempts: 0,
      lastError: null
    },
    create: {
      sessionId: params.id,
      provider: "external",
      status: "pending",
      attempts: 0
    }
  });

  await prisma.session.update({
    where: { id: params.id },
    data: {
      status: "submitted",
      submittedAt: new Date()
    }
  });

  let externalId: string | null = null;
  let status: "delivered" | "failed" = "delivered";
  let attempts = 0;
  let lastError: string | null = null;

  try {
    const response = await retry(async () => {
      attempts += 1;
      const res = await fetch(process.env.EXTERNAL_ENDPOINT || "http://localhost:3000/api/integrations/external", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error(`External delivery failed with status ${res.status}`);
      }
      return res.json();
    }, 3);

    externalId = response.externalId;
  } catch (error) {
    status = "failed";
    lastError = error instanceof Error ? error.message : "Unknown delivery error";
  }

  await prisma.delivery.update({
    where: { id: delivery.id },
    data: {
      status,
      attempts,
      lastError,
      externalId
    }
  });

  await prisma.session.update({
    where: { id: params.id },
    data: {
      status: status === "delivered" ? "delivered" : "failed"
    }
  });

  return NextResponse.json({ status, externalId });
}
