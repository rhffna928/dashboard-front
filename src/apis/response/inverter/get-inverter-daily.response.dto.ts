import type ResponseDto from "../Response.dto";

export interface InverterDailyRow {
  hour: string;     // 예: "2026-03-03" 같은 형태
  plantId: number;
  invId: number;
  totalValue: number;     
  samples: number;
}

export default interface GetInverterDailyResponseDto extends ResponseDto {
  series: InverterDailyRow[];
}