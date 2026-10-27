// Wire contract for overall app activity: the browser heartbeat (/api/v1/activity) and the
// admin reports (/api/v1/admin/app-activity). Days are UTC calendar dates (YYYY-MM-DD), the same
// day boundary DailyActivity and streaks use. Dates are ISO strings.
//
// `appSeconds` is estimated active time anywhere in the signed-in app and already includes study
// time. `studySeconds` comes from the existing chapter study clock (DailyActivity). Never add the
// two together.

/** Browser cadence. The server, not these numbers, decides what is credited. */
export const APP_HEARTBEAT_INTERVAL_MS = 60_000;
/** Largest claim one heartbeat may carry (a missed beat plus the current one). */
export const APP_HEARTBEAT_MAX_SECONDS = 120;

export type AppHeartbeatRequest = {
  /** Eligible seconds the client accumulated since its last accepted heartbeat. */
  activeSeconds: number;
  /** Random per payload and reused on retry, so an exact retry is not counted twice. */
  beatId?: string;
};

export type AppHeartbeatResult = {
  creditedSeconds: number;
  duplicate: boolean;
};

export type AppActivityDayRow = {
  date: string;
  appSeconds: number;
  studySeconds: number;
};

export type AppActivityOverview = {
  days: number;
  from: string;
  to: string;
  totals: {
    /** Users with any app activity in the window. */
    activeUsers: number;
    appSeconds: number;
    studySeconds: number;
  };
  daily: Array<AppActivityDayRow & { activeUsers: number }>;
  /** How many users were active on exactly N distinct days of the window (index 0 = 1 day). */
  activeDaysHistogram: number[];
};

export type AppActivityUserRow = {
  user: { id: string; email: string; name: string | null; role: string };
  /** Last app heartbeat anywhere; null when never seen since tracking started. */
  lastActiveAt: string | null;
  activeDays: number;
  appSeconds: number;
  studySeconds: number;
  daily: AppActivityDayRow[];
};

export type AppActivityUsersView = {
  days: number;
  from: string;
  to: string;
  total: number;
  users: AppActivityUserRow[];
};
