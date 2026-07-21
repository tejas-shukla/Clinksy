// POST /api/professionals — professional onboarding (advisors, solicitors, surveyors).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  ADVISOR_SPECIALISATIONS,
  SOLICITOR_SPECIALISATIONS,
  SURVEYOR_SPECIALISMS,
  SURVEY_TYPES,
  FEE_MODELS,
  APPOINTMENT_MODES,
  JURISDICTIONS,
} from "@/lib/matching/criteria";

export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLES = ["MORTGAGE_ADVISOR", "SOLICITOR", "SURVEYOR"] as const;
type Role = (typeof ROLES)[number];

const REG_BODY: Record<Role, string[]> = {
  MORTGAGE_ADVISOR: ["FCA"],
  SOLICITOR: ["SRA", "CLC"],
  SURVEYOR: ["RICS"],
};

const VALID_SPECS: Record<Role, Set<string>> = {
  MORTGAGE_ADVISOR: new Set(ADVISOR_SPECIALISATIONS.map((s) => s.value)),
  SOLICITOR: new Set(SOLICITOR_SPECIALISATIONS.map((s) => s.value)),
  SURVEYOR: new Set(SURVEYOR_SPECIALISMS.map((s) => s.value)),
};

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}
function strArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const role = str(body.role) as Role | undefined;
  if (!role || !ROLES.includes(role)) {
    return NextResponse.json({ error: "Choose a valid professional role." }, { status: 400 });
  }

  const name = str(body.name);
  const email = str(body.email)?.toLowerCase();
  const registrationNumber = str(body.registrationNumber);
  const registrationBody = str(body.registrationBody);

  if (!name) return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!registrationNumber || !registrationBody || !REG_BODY[role].includes(registrationBody)) {
    return NextResponse.json(
      { error: `Enter your ${REG_BODY[role].join(" or ")} registration number.` },
      { status: 400 },
    );
  }

  const specialisations = strArray(body.specialisations).filter((s) => VALID_SPECS[role].has(s));
  const coverageAreas = strArray(body.coverageAreas).map((a) => a.toUpperCase().trim()).filter(Boolean);
  const nationwide = body.nationwide === true;

  // Role-specific validation
  if (role === "MORTGAGE_ADVISOR" && !nationwide && coverageAreas.length === 0) {
    return NextResponse.json(
      { error: "Add at least one coverage area, or select nationwide." },
      { status: 400 },
    );
  }
  const jurisdiction = str(body.jurisdiction);
  if (role === "SOLICITOR" && !JURISDICTIONS.some((j) => j.value === jurisdiction)) {
    return NextResponse.json({ error: "Select your jurisdiction." }, { status: 400 });
  }
  const surveyTypes = strArray(body.surveyTypes).filter((s) =>
    SURVEY_TYPES.some((t) => t.value === s),
  );
  if (role === "SURVEYOR") {
    if (coverageAreas.length === 0) {
      return NextResponse.json({ error: "Add the postcode areas you cover." }, { status: 400 });
    }
    if (surveyTypes.length === 0) {
      return NextResponse.json({ error: "Select at least one survey type." }, { status: 400 });
    }
  }

  const feeModel = str(body.feeModel);
  const appointmentMode = str(body.appointmentMode);
  const weeklyCapacityRaw = Number(body.weeklyCapacity);
  const weeklyCapacity =
    Number.isFinite(weeklyCapacityRaw) && weeklyCapacityRaw > 0
      ? Math.min(Math.floor(weeklyCapacityRaw), 100)
      : 5;

  const existing = await prisma.professional.findUnique({
    where: { email_role: { email, role } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "You've already registered with this email. Contact us to update your profile." },
      { status: 409 },
    );
  }

  const professional = await prisma.professional.create({
    data: {
      role,
      name,
      email,
      phone: str(body.phone),
      firmName: str(body.firmName),
      registrationNumber,
      registrationBody,
      ricsGrade: role === "SURVEYOR" ? str(body.ricsGrade) : undefined,
      basePostcode: str(body.basePostcode)?.toUpperCase(),
      coverageAreas,
      nationwide: role === "MORTGAGE_ADVISOR" ? nationwide : false,
      jurisdiction: role === "SOLICITOR" ? jurisdiction : undefined,
      specialisations,
      wholeOfMarket: role === "MORTGAGE_ADVISOR" ? body.wholeOfMarket === true : undefined,
      panelLenders: role === "MORTGAGE_ADVISOR" ? strArray(body.panelLenders) : [],
      feeModel:
        role === "MORTGAGE_ADVISOR" && FEE_MODELS.some((f) => f.value === feeModel)
          ? feeModel
          : undefined,
      appointmentMode: APPOINTMENT_MODES.some((m) => m.value === appointmentMode)
        ? appointmentMode
        : undefined,
      lenderPanels: role === "SOLICITOR" ? strArray(body.lenderPanels) : [],
      cqsAccredited: role === "SOLICITOR" ? body.cqsAccredited === true : undefined,
      feeStructure: role === "SOLICITOR" ? str(body.feeStructure) : undefined,
      surveyTypes,
      turnaroundDays:
        role === "SURVEYOR" && Number.isFinite(Number(body.turnaroundDays))
          ? Math.max(1, Math.floor(Number(body.turnaroundDays)))
          : undefined,
      languages: strArray(body.languages).length > 0 ? strArray(body.languages) : ["English"],
      weeklyCapacity,
      // Goes live after manual verification of the registration number.
      status: "PENDING_VERIFICATION",
    },
  });

  console.log(
    `[Clinkeys] Professional signup: ${professional.name} (${professional.role}, ${professional.registrationBody} ${professional.registrationNumber})`,
  );

  return NextResponse.json({ ok: true, id: professional.id });
}
