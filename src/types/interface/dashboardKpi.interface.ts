export interface DashboardKpi {
  genHours: number;           // 또는 genTime?: string 으로 바꾸고 싶으면 백엔드/프론트 같이 바꾸면 됨
  totalGenKwh: number;
  monthGenKwh: number;
  yesterdayGenKwh: number;
  todayGenKwh: number;
  currentPowerKw: number;
}