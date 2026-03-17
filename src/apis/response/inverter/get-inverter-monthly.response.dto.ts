import type ResponseDto from "../Response.dto";

export interface InverterMonthlyRow {
  day: string;     // 예: "2026-03" 같은 형태
  plantId: number;
  invId: number;
  totalValue: number;     
  samples: number;
}

export default interface GetInverterMonthlyResponseDto extends ResponseDto {
  series: InverterMonthlyRow[];
}