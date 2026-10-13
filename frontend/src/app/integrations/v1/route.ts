import { NextResponse } from "next/server";

const ENDPOINTS = [
  { method: "GET", path: "/integrations/v1/connection", description: "Verify API credentials" },
  { method: "GET", path: "/integrations/v1/courses", description: "List allocated published courses" },
  { method: "GET", path: "/integrations/v1/allocations", description: "List course allocations for your org" },
  {
    method: "GET",
    path: "/integrations/v1/enrollments",
    description: "Lookup enrollment by course_id + learner_email or external_assignment_id",
  },
  { method: "POST", path: "/integrations/v1/enrollments", description: "Create Pathment-style enrollment" },
  {
    method: "POST",
    path: "/integrations/v1/enrollments/cancel",
    description: "Cancel org enrollment (org_slug, email, course_id, optional user_id / mentor_id)",
  },
  { method: "GET", path: "/integrations/v1/progress", description: "Progress for org enrollment" },
  {
    method: "GET",
    path: "/integrations/v1/course-requests",
    description: "List course access requests for your org",
  },
  {
    method: "POST",
    path: "/integrations/v1/course-requests",
    description: "Request access to a published course",
  },
] as const;

export async function GET() {
  return NextResponse.json({
    name: "Buildment Organization API",
    version: "v1",
    auth: {
      headers: ["x-buildment-access-key", "x-buildment-secret-key"],
    },
    endpoints: ENDPOINTS,
  });
}
