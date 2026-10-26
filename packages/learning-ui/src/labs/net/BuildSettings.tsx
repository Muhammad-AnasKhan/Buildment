"use client";

// Settings for whatever is selected on the canvas: a device's interface
// addresses, default gateway, extra routes and forwarding, or a cable and the
// two ends it joins. Input is kept as typed; the kernel-style error under a
// field says why the engine will ignore it.

import type { BuildDevice, BuildState } from "./build-model";
import {
  checkAddress,
  checkGateway,
  checkRoute,
  describeEnd,
  deviceById,
  endpointDevice,
  endpointIface,
  ifaceNamesOf,
  peerEnd,
  updateDevice,
} from "./build-model";
import type { Selection } from "./BuildCanvas";

interface Props {
  state: BuildState;
  selected: Selection;
  onChange: (next: BuildState) => void;
  onRemoveDevice: (id: string) => void;
  onRemoveCable: (id: string) => void;
}

const inputClass = "w-full min-w-0 min-h-9 rounded-lg border border-border bg-background px-2 py-1 font-mono text-sm";
const smallButton = "min-h-9 rounded-lg border border-border px-3 py-1 text-sm font-medium hover:bg-muted";

function FieldError({ id, message }: { id: string; message: string | null }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 font-mono text-xs text-red-700 dark:text-red-400">
      {message}
    </p>
  );
}

function DeviceSettings({ state, device, onChange, onRemoveDevice }: { state: BuildState; device: BuildDevice; onChange: (s: BuildState) => void; onRemoveDevice: (id: string) => void }) {
  const edit = (change: (d: BuildDevice) => BuildDevice) => onChange(updateDevice(state, device.id, change));
  const names = ifaceNamesOf(state, device);
  const isSwitch = device.kind === "switch";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold">{device.label}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{device.kind}</span>
        <button type="button" onClick={() => onRemoveDevice(device.id)} className={`${smallButton} ml-auto`} aria-label={`Remove ${device.label} and its cables`}>
          Remove
        </button>
      </div>

      {isSwitch ? (
        <div className="text-sm text-muted-foreground">
          <p>A switch has nothing to configure. It learns which MAC address sits behind each port by itself.</p>
          <ul className="mt-2 space-y-0.5 font-mono text-xs">
            {Array.from({ length: device.ports }, (_, i) => `p${i + 1}`).map((port) => {
              const peer = peerEnd(state, `${device.id}.${port}`);
              return (
                <li key={port}>
                  {port}: {peer ? describeEnd(state, peer) : "free"}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <>
          <fieldset className="space-y-2">
            <legend className="mb-1 text-xs font-medium text-muted-foreground">Interfaces</legend>
            {names.length === 0 && <p className="text-sm text-muted-foreground">No interfaces yet. Draw a cable from this device to give it one.</p>}
            {names.map((name) => {
              const peer = peerEnd(state, `${device.id}.${name}`);
              const text = device.addrs[name] ?? "";
              const problem = checkAddress(text);
              const fieldId = `${device.id}-${name}`;
              return (
                <div key={name}>
                  <label htmlFor={fieldId} className="mb-0.5 flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span className="font-mono font-medium">{name}</span>
                    <span className="text-xs text-muted-foreground">{peer ? `cabled to ${describeEnd(state, peer)}` : "not plugged in"}</span>
                  </label>
                  <input
                    id={fieldId}
                    value={text}
                    onChange={(e) => edit((d) => ({ ...d, addrs: { ...d.addrs, [name]: e.target.value } }))}
                    placeholder="192.168.1.23/24"
                    spellCheck={false}
                    autoCapitalize="off"
                    autoComplete="off"
                    inputMode="decimal"
                    aria-label={`Address for ${name} on ${device.label}, as address and prefix`}
                    aria-invalid={problem !== null}
                    aria-describedby={problem ? `${fieldId}-error` : undefined}
                    className={inputClass}
                  />
                  <FieldError id={`${fieldId}-error`} message={problem} />
                </div>
              );
            })}
          </fieldset>

          <div>
            <label htmlFor={`${device.id}-gateway`} className="mb-0.5 block text-sm font-medium">
              Default gateway
            </label>
            <input
              id={`${device.id}-gateway`}
              value={device.gateway}
              onChange={(e) => edit((d) => ({ ...d, gateway: e.target.value }))}
              placeholder="192.168.1.1"
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              inputMode="decimal"
              aria-label={`Default gateway for ${device.label}`}
              aria-invalid={checkGateway(device, device.gateway) !== null}
              aria-describedby={checkGateway(device, device.gateway) ? `${device.id}-gateway-error` : undefined}
              className={inputClass}
            />
            <FieldError id={`${device.id}-gateway-error`} message={checkGateway(device, device.gateway)} />
            <p className="mt-0.5 text-xs text-muted-foreground">Where this device sends anything outside the networks it is directly on.</p>
          </div>

          <fieldset className="space-y-2">
            <legend className="mb-1 text-xs font-medium text-muted-foreground">Other routes</legend>
            {device.routes.map((route, i) => {
              const problem = checkRoute(device, i);
              const rowId = `${device.id}-route-${i}`;
              return (
                <div key={i}>
                  <div className="flex items-center gap-2">
                    <input
                      value={route.dst}
                      onChange={(e) => edit((d) => ({ ...d, routes: d.routes.map((r, j) => (j === i ? { ...r, dst: e.target.value } : r)) }))}
                      placeholder="10.2.0.0/24"
                      spellCheck={false}
                      autoCapitalize="off"
                      aria-label={`Route ${i + 1} destination on ${device.label}`}
                      aria-invalid={problem !== null}
                      aria-describedby={problem ? `${rowId}-error` : undefined}
                      className={inputClass}
                    />
                    <span className="text-xs text-muted-foreground">via</span>
                    <input
                      value={route.via}
                      onChange={(e) => edit((d) => ({ ...d, routes: d.routes.map((r, j) => (j === i ? { ...r, via: e.target.value } : r)) }))}
                      placeholder="10.0.0.2"
                      spellCheck={false}
                      autoCapitalize="off"
                      aria-label={`Route ${i + 1} gateway on ${device.label}`}
                      aria-invalid={problem !== null}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => edit((d) => ({ ...d, routes: d.routes.filter((_, j) => j !== i) }))}
                      aria-label={`Remove route ${i + 1} from ${device.label}`}
                      className={`${smallButton} shrink-0`}
                    >
                      ×
                    </button>
                  </div>
                  <FieldError id={`${rowId}-error`} message={problem} />
                </div>
              );
            })}
            <button type="button" onClick={() => edit((d) => ({ ...d, routes: [...d.routes, { dst: "", via: "" }] }))} className={smallButton}>
              Add a route
            </button>
          </fieldset>

          {device.kind === "router" && (
            <label className="flex min-h-9 items-start gap-2 text-sm">
              <input type="checkbox" checked={device.forwarding} onChange={(e) => edit((d) => ({ ...d, forwarding: e.target.checked }))} className="mt-1 size-4" />
              <span>
                Forward packets between its networks
                <span className="block text-xs text-muted-foreground">net.ipv4.ip_forward. Without it, a router drops anything not addressed to itself.</span>
              </span>
            </label>
          )}
        </>
      )}
    </div>
  );
}

export function BuildSettings({ state, selected, onChange, onRemoveDevice, onRemoveCable }: Props) {
  if (selected?.type === "device") {
    const device = deviceById(state, selected.id);
    if (device) return <DeviceSettings state={state} device={device} onChange={onChange} onRemoveDevice={onRemoveDevice} />;
  }
  if (selected?.type === "cable") {
    const cable = state.cables.find((c) => c.a === selected.id);
    if (cable) {
      return (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Cable</h3>
          <p className="text-sm">
            <span className="font-mono">{describeEnd(state, cable.a)}</span> to <span className="font-mono">{describeEnd(state, cable.b)}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Removing it keeps the address typed for {endpointIface(cable.a)} on {deviceById(state, endpointDevice(cable.a))?.label}, as a real interface keeps its address when you unplug it.
          </p>
          <button type="button" onClick={() => onRemoveCable(cable.a)} className={smallButton}>
            Remove this cable
          </button>
        </div>
      );
    }
  }
  return (
    <p className="text-sm text-muted-foreground">
      Select a device to set its addresses, gateway and routes. Select a cable to remove it. A device is selected by tapping it, or by focusing it and pressing Enter.
    </p>
  );
}
