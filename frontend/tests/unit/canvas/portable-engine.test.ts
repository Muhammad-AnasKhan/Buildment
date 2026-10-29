import { createElement as h } from "react";
import { renderToString } from "react-dom/server";
import { dump } from "js-yaml";
import { describe, expect, it } from "vitest";
import { InteractiveCanvas } from "@buildment/learning-ui/canvas/InteractiveCanvas";
import { Lab } from "@buildment/learning-ui/labs/Lab";
import { hldVisualUrlShortener } from "@buildment/learning-ui/labs/hld-visual-url-shortener/data";
import {
  buildSliderSpec,
  evaluateFormula,
  interpolateTemplate,
  portableSliderDataSchema,
} from "@buildment/learning-ui/canvas/models/portable";
import { transformVisualFences } from "@/mdx/transform-visual-fences";

describe("portable content engine (canvases & labs)", () => {
  it("evaluates declarative slider formulas and string templates without eval", () => {
    const env = { interval: 120, timeout: 300 };
    expect(evaluateFormula("interval < timeout ? 1 : 0", env)).toBe(1);
    expect(evaluateFormula("floor(3600 / interval)", env)).toBe(30);
    expect(evaluateFormula("interval < timeout ? 100 : round((timeout / interval) * 100)", env)).toBe(100);
    expect(
      evaluateFormula("interval < timeout ? 100 : round((timeout / interval) * 100)", {
        interval: 400,
        timeout: 300,
      }),
    ).toBe(75);
    expect(interpolateTemplate("{interval < timeout ? 'Kept alive' : 'Expires'}", env)).toBe("Kept alive");
    expect(interpolateTemplate("{interval < timeout ? 'Kept alive' : 'Expires'}", { interval: 400, timeout: 300 })).toBe(
      "Expires",
    );
  });

  it("reproduces the NAT keepalive slider purely from declarative JSON data", () => {
    const parsed = portableSliderDataSchema.parse({
      title: "Keepalives keep a NAT row alive",
      purpose: "Move the interval and the timeout to see whether the NAT row survives.",
      intro: "A keepalive is a small packet sent on purpose before a NAT row's idle timer runs out.",
      inputs: [
        { id: "interval", label: "Keepalive interval", min: 30, max: 600, step: 30, default: 120, unit: "s" },
        { id: "timeout", label: "Router idle timeout", min: 60, max: 600, step: 30, default: 300, unit: "s" },
      ],
      formulas: {
        safe: "interval < timeout ? 1 : 0",
        perHour: "floor(3600 / interval)",
        reachablePercent: "interval < timeout ? 100 : round((timeout / interval) * 100)",
      },
      stats: [
        {
          label: "NAT row",
          value: "{safe ? 'Kept alive' : 'Expires'}",
          detail: "{safe ? 'Reset before timeout' : 'Deleted between keepalives'}",
        },
        { label: "Keepalives / hour", value: "{perHour}" },
        { label: "Server can reach phone", value: "{reachablePercent}%" },
      ],
      barsTitle: "Share of the hour the phone is reachable",
      bars: [
        {
          label: "Reachable time",
          value: "reachablePercent",
          display: "{reachablePercent}% of the hour",
          tone: "{safe ? 'good' : 'bad'}",
        },
      ],
      barMax: 100,
      summary: "At {interval}s interval and {timeout}s timeout, reachable {reachablePercent}% of the hour.",
      limits: "One hour of quiet is assumed, with made-up defaults.",
      futureFieldIgnoredByOlderClients: { custom: true },
    });

    const spec = buildSliderSpec(parsed);
    const initial = spec.compute({ interval: 120, timeout: 300 });
    expect(initial.stats[0]?.value).toBe("Kept alive");
    expect(initial.stats[1]?.value).toBe("30");
    expect(initial.stats[2]?.value).toBe("100%");
    expect(initial.bars?.[0]?.tone).toBe("good");

    const expired = spec.compute({ interval: 400, timeout: 300 });
    expect(expired.stats[0]?.value).toBe("Expires");
    expect(expired.stats[1]?.value).toBe("9");
    expect(expired.stats[2]?.value).toBe("75%");
    expect(expired.bars?.[0]?.tone).toBe("bad");

    const html = renderToString(h(InteractiveCanvas, { renderer: "slider", data: parsed }));
    expect(html).toContain("Keepalives keep a NAT row alive");
    expect(html).not.toContain("not available right now");
  });

  it("renders a graceful version notice when version exceeds MAX_PORTABLE_VERSION", () => {
    const canvasHtml = renderToString(
      h(InteractiveCanvas, { renderer: "net-step", version: 99, data: { title: "Future" } }),
    );
    expect(canvasHtml).toContain("uses format version 99");

    const labHtml = renderToString(h(Lab, { version: 99, spec: hldVisualUrlShortener }));
    expect(labHtml).toContain("uses format version 99");
  });

  it("transforms and renders a full HLD visual challenge ```lab fence from JSON/YAML", () => {
    const { slug: _slug, ...portableSpec } = hldVisualUrlShortener;
    const fence = "```lab\n" + dump({ version: 1, presentation: { spacing: "normal" }, ...portableSpec }) + "\n```";
    const transformed = transformVisualFences(fence);
    expect(transformed).toContain("<Lab");

    const slugHtml = renderToString(h(Lab, { slug: "hld-visual-url-shortener" }));
    const jsonHtml = renderToString(
      h(Lab, { version: 1, presentation: { spacing: "normal" }, spec: portableSpec as never }),
    );
    expect(jsonHtml).not.toContain("not available right now");
    expect(jsonHtml).toBe(slugHtml);
  });
});
