"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Connection = { challenge: string; state: string; port: number };
export function DesktopConnect() {
  const [connection, setConnection] = useState<Connection | null>(null);
  const [account, setAccount] = useState("");
  const [status, setStatus] = useState<"loading" | "login" | "ready" | "busy" | "done" | "error">("loading");
  const [message, setMessage] = useState("");
  const [loginHref, setLoginHref] = useState("/login");
  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const challenge = params.get("challenge") || "";
    const state = params.get("state") || "";
    const port = Number(params.get("port"));
    if (!/^[A-Za-z0-9_-]{43}$/.test(challenge) || !/^[A-Za-z0-9_-]{43}$/.test(state) || !Number.isInteger(port) || port < 1024 || port > 65535) {
      queueMicrotask(() => {
        if (active) { setStatus("error"); setMessage("This connection link is invalid. Start sign-in from the desktop app."); }
      });
      return () => { active = false; };
    }
    const returnTo = `/desktop/connect?${new URLSearchParams({ challenge, state, port: String(port) })}`;
    void fetch("/api/v1/auth/me", { credentials: "same-origin", cache: "no-store", signal: AbortSignal.timeout(15_000) }).then(async response => {
      if (!active) return;
      setConnection({ challenge, state, port });
      setLoginHref(`/login?redirectTo=${encodeURIComponent(returnTo)}`);
      if (response.status === 401) { setStatus("login"); return; }
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error("Unable to check your account. Please refresh and try again.");
      if (active) { setAccount(body.data.user.email); setStatus("ready"); }
    }).catch(error => { if (active) { setMessage(error instanceof Error ? error.message : "Unable to connect."); setStatus("error"); } });
    return () => { active = false; };
  }, []);

  async function connect() {
    if (!connection) return;
    setStatus("busy"); setMessage("");
    try {
      const response = await fetch("/api/v1/auth/desktop/authorize", { method: "POST", credentials: "same-origin", signal: AbortSignal.timeout(15_000), headers: { "Content-Type": "application/json" }, body: JSON.stringify({ challenge: connection.challenge }) });
      if (response.status === 401) { setStatus("login"); return; }
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.message || "Unable to connect desktop. Please try again.");
      if (typeof body.data?.code !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(body.data.code)) throw new Error("Invalid sign-in response.");
      const callback = new URL(`http://127.0.0.1:${connection.port}/callback`);
      callback.searchParams.set("code", body.data.code); callback.searchParams.set("state", connection.state);
      setStatus("done");
      window.location.assign(callback.toString());
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to connect."); setStatus("ready"); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground"><section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm"><div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground">b.</div><h1 className="text-2xl font-semibold tracking-tight">Connect Buildment desktop</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Sign in on the web, then securely return to your learning workspace.</p>
    {status === "loading" && <p role="status" className="mt-6 text-sm">Checking your account…</p>}
    {status === "login" && <Link href={loginHref} className="mt-6 inline-block rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground">Sign in to Buildment</Link>}
    {(status === "ready" || status === "busy") && <><p className="mt-6 break-all text-sm">Continue as <strong>{account}</strong></p><p className="mt-2 text-xs leading-5 text-muted-foreground">Only continue if you started this request in the Buildment desktop app on this computer.</p><button onClick={() => void connect()} disabled={status === "busy"} className="mt-5 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50">{status === "busy" ? "Connecting…" : "Connect desktop"}</button></>}
    {status === "done" && <p role="status" className="mt-6 text-sm">Returning to the desktop app…</p>}
    {message && <p role="alert" className="mt-5 text-sm text-muted-foreground">{message}</p>}
  </section></main>;
}
