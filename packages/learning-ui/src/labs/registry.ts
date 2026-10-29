// Maps each lab slug to its LabSpec. A frontend test keeps these keys identical
// to LAB_SLUGS. getLabSpec is the safe lookup: it returns null for anything that
// is not a registered slug, including prototype keys.

import type { LabSpec } from "./types";
import { hldM2UtilisationKnee } from "./hld-m2-utilisation-knee/data";
import { hldM4ThreeTiers } from "./hld-m4-three-tiers/data";
import { hldM20WaslaRedirects } from "./hld-m20-wasla-redirects/data";
import { hldVisualUrlShortener } from "./hld-visual-url-shortener/data";
import { hldVisualNewsFeed } from "./hld-visual-news-feed/data";
import { hldVisualChat } from "./hld-visual-chat/data";
import { hldVisualProductSearch } from "./hld-visual-product-search/data";
import { hldVisualRideMatching } from "./hld-visual-ride-matching/data";
import { hldVisualTicketDrop } from "./hld-visual-ticket-drop/data";
import { hldVisualWebCrawler } from "./hld-visual-web-crawler/data";
import { hldVisualVideoPlatform } from "./hld-visual-video-platform/data";
import { awsWebTier } from "./aws-web-tier/data";
import { k8sWebApp } from "./k8s-web-app/data";
import { dockerComposeStack } from "./docker-compose-stack/data";
import { linuxSingleHost } from "./linux-single-host/data";
import { netExploreOffice } from "./net-explore-office/data";
import { netLabFixOffice } from "./net-lab-fix-office/data";
import { netLabPlanSchool } from "./net-lab-plan-school/data";
import { netLabBuildTwoSubnets } from "./net-lab-build-two-subnets/data";
import { netLabHomeRouter } from "./net-lab-home-router/data";
import { netLabNoInternet } from "./net-lab-no-internet/data";

export const labRegistry: Record<string, LabSpec> = {
  "hld-m2-utilisation-knee": hldM2UtilisationKnee,
  "hld-m4-three-tiers": hldM4ThreeTiers,
  "hld-m20-wasla-redirects": hldM20WaslaRedirects,
  "hld-visual-url-shortener": hldVisualUrlShortener,
  "hld-visual-news-feed": hldVisualNewsFeed,
  "hld-visual-chat": hldVisualChat,
  "hld-visual-product-search": hldVisualProductSearch,
  "hld-visual-ride-matching": hldVisualRideMatching,
  "hld-visual-ticket-drop": hldVisualTicketDrop,
  "hld-visual-web-crawler": hldVisualWebCrawler,
  "hld-visual-video-platform": hldVisualVideoPlatform,
  "aws-web-tier": awsWebTier,
  "k8s-web-app": k8sWebApp,
  "docker-compose-stack": dockerComposeStack,
  "linux-single-host": linuxSingleHost,
  "net-explore-office": netExploreOffice,
  "net-lab-fix-office": netLabFixOffice,
  "net-lab-plan-school": netLabPlanSchool,
  "net-lab-build-two-subnets": netLabBuildTwoSubnets,
  "net-lab-home-router": netLabHomeRouter,
  "net-lab-no-internet": netLabNoInternet,
};

export function getLabSpec(slug: string): LabSpec | null {
  return Object.prototype.hasOwnProperty.call(labRegistry, slug) ? labRegistry[slug] : null;
}
