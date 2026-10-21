// Owns the camera stream for a proctored quiz, apart from React, so its lifecycle
// can be unit tested: a stream that arrives after the quiz ended or the page left
// is stopped at once, and nothing keeps the camera light on by accident.

export type CameraFailure = "denied" | "no-camera" | "unsupported" | "error";

export type CameraStartResult =
  | { status: "on"; stream: MediaStream }
  | { status: "failed"; reason: CameraFailure }
  | { status: "cancelled" };

type GetUserMedia = (constraints: MediaStreamConstraints) => Promise<MediaStream>;

const CONSTRAINTS: MediaStreamConstraints = {
  video: { width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 5, max: 10 }, facingMode: "user" },
  audio: false,
};

function stopTracks(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function failureReason(error: unknown): CameraFailure {
  const name = error instanceof Error || (typeof error === "object" && error !== null && "name" in error)
    ? String((error as { name: unknown }).name)
    : "";
  if (name === "NotAllowedError" || name === "SecurityError") return "denied";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "no-camera";
  return "error";
}

export class CameraSession {
  private stream: MediaStream | null = null;
  /** Bumped by every start and stop, so a slow getUserMedia can tell it was overtaken. */
  private generation = 0;
  private closed = false;

  constructor(private readonly getUserMedia: GetUserMedia | null) {}

  get current(): MediaStream | null {
    return this.stream;
  }

  get isClosed(): boolean {
    return this.closed;
  }

  /** `onEnded` runs if the device stops on its own (unplugged, taken by another app). */
  async start(onEnded: () => void): Promise<CameraStartResult> {
    if (this.closed) return { status: "cancelled" };
    if (!this.getUserMedia) return { status: "failed", reason: "unsupported" };
    const generation = ++this.generation;
    let stream: MediaStream;
    try {
      stream = await this.getUserMedia(CONSTRAINTS);
    } catch (error) {
      if (generation !== this.generation || this.closed) return { status: "cancelled" };
      return { status: "failed", reason: failureReason(error) };
    }
    if (generation !== this.generation || this.closed) {
      stopTracks(stream);
      return { status: "cancelled" };
    }
    stopTracks(this.stream);
    this.stream = stream;
    stream.getVideoTracks()[0]?.addEventListener("ended", () => {
      if (this.stream === stream) onEnded();
    });
    return { status: "on", stream };
  }

  /** Turns the camera off; a start still in flight is discarded when it lands. */
  stop(): void {
    this.generation += 1;
    stopTracks(this.stream);
    this.stream = null;
  }

  /** For good: the quiz finished or the page is leaving. */
  close(): void {
    this.closed = true;
    this.stop();
  }

  reopen(): void {
    this.closed = false;
  }
}
