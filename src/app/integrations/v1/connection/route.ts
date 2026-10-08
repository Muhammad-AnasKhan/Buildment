import { NextResponse } from "next/server";
import {
  IntegrationAuthError,
  authenticateOrganizationFromRequest,
} from "@/server/integrations/authenticate-organization";

export async function GET(request: Request) {
  try {
    const org = await authenticateOrganizationFromRequest(request);
    return NextResponse.json({
      connected: true,
      organization_slug: org.slug,
      organization_name: org.name,
    });
  } catch (error) {
    if (error instanceof IntegrationAuthError) {
      return NextResponse.json({ connected: false, error: error.message }, { status: 401 });
    }
    throw error;
  }
}
