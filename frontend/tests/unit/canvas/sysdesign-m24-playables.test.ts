import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { sysdesignM24EstimatePlay } from "@/canvas/sysdesign-m24-estimate-play/data";
import { sysdesignM24GeohashZoom } from "@/canvas/sysdesign-m24-geohash-zoom/data";
import { sysdesignM24CellEdge } from "@/canvas/sysdesign-m24-cell-edge/data";
import { sysdesignM24QuadtreeSplit } from "@/canvas/sysdesign-m24-quadtree-split/data";
import { sysdesignM24UpdateLoad } from "@/canvas/sysdesign-m24-update-load/data";
import { sysdesignM24BatchMatch } from "@/canvas/sysdesign-m24-batch-match/data";
import { cellIndexAt, cellRect, mapTransform, moveInGrid } from "@/canvas/models/geohash-zoom";

describe("m24 playable canvases render on the server", () => {
  const specs = [
    sysdesignM24EstimatePlay,
    sysdesignM24GeohashZoom,
    sysdesignM24CellEdge,
    sysdesignM24QuadtreeSplit,
    sysdesignM24UpdateLoad,
    sysdesignM24BatchMatch,
  ];
  const html = (s: (typeof specs)[number]) => renderToString(createElement(s.component, { title: s.title, purpose: s.purpose, limits: s.limits })).replaceAll("<!-- -->", "");

  it("draws an svg and the limits fold, with no hex colours or forbidden elements", () => {
    for (const spec of specs) {
      const out = html(spec);
      expect(out, spec.title).toContain("<svg");
      expect(out, spec.title).toContain("What this picture leaves out");
      expect(out, spec.title).not.toMatch(/#[0-9a-fA-F]{6}\b/);
      expect(out, spec.title).not.toMatch(/foreignObject|<animate|<use|<image/);
      expect(out, spec.title).not.toContain("\u2014");
    }
  });

  it("keeps the words honest in their limits and purpose", () => {
    for (const spec of specs) {
      expect(spec.limits.length, spec.title).toBeGreaterThan(80);
      expect(spec.purpose + spec.limits, spec.title).not.toContain("\u2014");
    }
  });

  it("starts each picture in the state the chapter describes", () => {
    expect(html(sysdesignM24EstimatePlay)).toContain("250,000 /s");
    expect(html(sysdesignM24EstimatePlay)).toContain("Updates drive it: keep them in memory");
    expect(html(sysdesignM24GeohashZoom)).toContain("Tap a box to add a letter");
    expect(html(sysdesignM24GeohashZoom)).toContain("the whole world");
    expect(html(sysdesignM24CellEdge)).toContain("9 boxes read");
    expect(html(sysdesignM24QuadtreeSplit)).toContain("22 boxes");
    expect(html(sysdesignM24UpdateLoad)).toContain("100 disk nodes for old data");
    expect(html(sysdesignM24BatchMatch)).toContain("One by one wastes 0.8 km");
  });

  it("gives the sliders and buttons a name", () => {
    expect(html(sysdesignM24GeohashZoom)).toContain("letter s, zoom in");
    expect(html(sysdesignM24CellEdge)).toContain('role="slider"');
    expect(html(sysdesignM24BatchMatch)).toContain("Driver 1 at 0.4 km, one by one 1.9 km, together 1.1 km");
    expect(html(sysdesignM24QuadtreeSplit)).toContain("3,000 drivers in the stadium, 22 boxes, fullest 188");
    expect(html(sysdesignM24UpdateLoad)).toContain('role="slider"');
  });
});

describe("m24 geohash zoom drawing helpers", () => {
  const area = { x: 12, y: 110, w: 396, h: 216 };

  it("cuts the area into cells", () => {
    expect(cellRect(area, 8, 4, 0, 0)).toEqual({ x: 12, y: 110, w: 49.5, h: 54 });
    const last = cellRect(area, 8, 4, 7, 3);
    expect(last.x + last.w).toBeCloseTo(408, 9);
    expect(last.y + last.h).toBeCloseTo(326, 9);
  });

  it("finds the cell under a point", () => {
    expect(cellIndexAt(area, 8, 4, 13, 111)).toBe(0);
    expect(cellIndexAt(area, 8, 4, 407, 325)).toBe(31);
    expect(cellIndexAt(area, 4, 8, 12 + 99 * 1.5, 110 + 27 * 2.5)).toBe(2 * 4 + 1);
    expect(cellIndexAt(area, 8, 4, 5, 200)).toBeNull();
    expect(cellIndexAt(area, 8, 4, 200, 400)).toBeNull();
  });

  it("maps one rectangle onto another for the glide", () => {
    const cell = cellRect(area, 8, 4, 4, 1);
    expect(mapTransform(area, area)).toBe("translate(0px, 0px) scale(1, 1)");
    expect(mapTransform(cell, area)).toContain("scale(8, 4)");
    expect(mapTransform(area, cell)).toContain("scale(0.125, 0.25)");
  });

  it("moves between cells with the arrow keys and stops at the edges", () => {
    expect(moveInGrid(0, 8, 4, "ArrowRight")).toBe(1);
    expect(moveInGrid(0, 8, 4, "ArrowLeft")).toBe(0);
    expect(moveInGrid(0, 8, 4, "ArrowUp")).toBe(0);
    expect(moveInGrid(0, 8, 4, "ArrowDown")).toBe(8);
    expect(moveInGrid(31, 8, 4, "ArrowDown")).toBe(31);
    expect(moveInGrid(7, 8, 4, "ArrowRight")).toBe(7);
    expect(moveInGrid(5, 4, 8, "End")).toBe(31);
    expect(moveInGrid(5, 4, 8, "x")).toBeNull();
  });
});
