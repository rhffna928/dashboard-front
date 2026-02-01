export type GetAlarmDeviceIdOptionsParams = {
  plantId?: number | null;
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
  deviceType?: string; // default ALL
};