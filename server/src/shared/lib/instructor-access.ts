import type { Role } from "../domain/enums.js";

/** Serializable instructor / learner switch state for workspace sidebars. */
export type InstructorAccessView = {
  role: Role;
  requestStatus: "none" | "pending" | "rejected";
  canRequestAccess: boolean;
};

export function instructorAccessView(input: {
  role: Role;
  requestStatus: InstructorAccessView["requestStatus"];
  canRequestAccess: boolean;
}): InstructorAccessView {
  return input;
}
