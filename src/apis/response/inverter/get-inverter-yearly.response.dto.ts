import type ResponseDto from "../Response.dto";

export interface InverterYearlyRow {
  month: string;     // 예: "2026" 같은 형태
  plantId: number;
  invId: number;
  totalValue: number;     
  samples: number;
}

export default interface GetInverterYearlyResponseDto extends ResponseDto {
  series: InverterYearlyRow[];
}