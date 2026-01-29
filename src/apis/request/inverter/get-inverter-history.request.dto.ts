export interface GetInverterHistoryRequestDto {
  invId?: number;
  from: string;      // 예: "2026-01-27T00:00:00"
  to: string;        // 예: "2026-01-28T00:00:00"
  bucketSec?: number; // 예: 60, 300, 900...
  page?: number;     // default 0
  size?: number;     // default 20
}