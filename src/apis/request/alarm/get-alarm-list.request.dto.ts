export type GetAlarmListParams = {
  plantId?: number | null;
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
  deviceType?: string; // default ALL
  deviceId?: string;   // default ALL
  page?: number;       // default 0
  size?: number;       // default 20
};