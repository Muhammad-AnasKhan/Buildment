import type { CustomCanvasSpec } from "../registry";
import { ReplicaLagCanvas } from "./ReplicaLagCanvas";

export const sysdesignReplicaLag: CustomCanvasSpec = {
  kind: "custom",
  title: "Replica lag: where did my comment go?",
  purpose: "Change the replication lag, how fast the user refreshes and where reads go, to see read-your-writes and monotonic reads break and get fixed.",
  limits:
    "Each replica's lag is fixed for the whole run, and replica 1 is always a quarter as far behind as replica 2. Real lag changes from second to second and jumps under heavy writes. Reads take no time, the leader never fails, and there is only one writer. The 'any replica' router takes turns instead of choosing at random, so the run is the same every time. The 600 ms default is like a PostgreSQL streaming replica under heavy writes (PostgreSQL describes lag as typically under one second); Aurora replicas usually lag much less than 100 ms. With one writer, routing to a replica at the client's last-write position also fixes monotonic reads; with several writers the client must also raise its position after each read. Use it to see when the anomalies happen and what each fix costs, not to predict real lag.",
  component: ReplicaLagCanvas,
};
