import type { CustomCanvasSpec } from "../registry";
import { InstancePickerCanvas } from "./InstancePickerCanvas";

// 4.2 "Pick sizes and counts yourself": Daftar needs 500 requests a second in
// exam week. Made-up price list: small 100/s $0.10, medium 200/s $0.20, large
// 400/s $0.40, xlarge 800/s $0.80 an hour; a balancer is $0.05 an hour when
// there is more than one server. Model: models/fleet-sizing.ts.
export const sysdesignM4InstancePicker: CustomCanvasSpec = {
  kind: "custom",
  title: "Pick sizes and counts for 500 a second",
  purpose: "Tap a server size and drag the number of servers; capacity, cost an hour and the load left after one server fails follow.",
  limits:
    "The sizes, speeds and prices are a made-up list in which price grows in step with size; real price lists differ by provider and region. The load balancer is priced at a made-up $0.05 an hour. Every server is assumed to fail alone and to share the load evenly. Real servers also carry fixed overhead (the operating system, connection pools), which is why teams do not run hundreds of tiny ones. Only one failure is shown.",
  component: InstancePickerCanvas,
};
