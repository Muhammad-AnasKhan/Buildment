// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
/** Serializable instructor / learner switch state for workspace sidebars. */
export type InstructorAccessView = {
  canInstruct: boolean;
  requestStatus: "none" | "pending" | "rejected";
  canRequestAccess: boolean;
};

export function instructorAccessView(input: {
  canInstruct: boolean;
  requestStatus: InstructorAccessView["requestStatus"];
  canRequestAccess: boolean;
}): InstructorAccessView {
  return input;
}
