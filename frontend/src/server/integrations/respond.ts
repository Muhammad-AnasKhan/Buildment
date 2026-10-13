import { NextResponse } from "next/server";
import { IntegrationAuthError } from "@/server/integrations/authenticate-organization";
import { AllocationError } from "@/server/integrations/allocation";
import { PathmentEnrollmentError } from "@/server/integrations/pathment/create-pathment-enrollment";

export function integrationErrorResponse(error: unknown): NextResponse | null {
  if (error instanceof IntegrationAuthError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof PathmentEnrollmentError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof AllocationError) {
    const status = error.code === "NOT_ALLOCATED" ? 404 : 403;
    return NextResponse.json({ error: error.message, code: error.code }, { status });
  }
  return null;
}
