// Maps each lab slug to its LabSpec. A frontend test keeps these keys identical
// to LAB_SLUGS. getLabSpec is the safe lookup: it returns null for anything that
// is not a registered slug, including prototype keys.

import type { LabSlug } from "@/shared/lab/slugs";
import { isLabSlug } from "@/shared/lab/slugs";
import type { LabSpec } from "./types";
import { hldM2UtilisationKnee } from "./hld-m2-utilisation-knee/data";
import { awsWebTier } from "./aws-web-tier/data";
import { k8sWebApp } from "./k8s-web-app/data";
import { dockerComposeStack } from "./docker-compose-stack/data";
import { linuxSingleHost } from "./linux-single-host/data";

export const labRegistry: Record<LabSlug, LabSpec> = {
  "hld-m2-utilisation-knee": hldM2UtilisationKnee,
  "aws-web-tier": awsWebTier,
  "k8s-web-app": k8sWebApp,
  "docker-compose-stack": dockerComposeStack,
  "linux-single-host": linuxSingleHost,
};

export function getLabSpec(slug: string): LabSpec | null {
  if (!isLabSlug(slug)) return null;
  return Object.prototype.hasOwnProperty.call(labRegistry, slug) ? labRegistry[slug] : null;
}
