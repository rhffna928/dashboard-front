import type ResponseDto from "../Response.dto";

export interface InverterSeriesRow {
  bucketHour: string;     // 예: "2026-03-03 11" 같은 형태
  plantId: number;
  invId: number;
  hourGenKwh: number;     // 1시간 버킷이면 사실상 평균 kW로 봐도 됨
  samples: number;
}

export default interface GetInverterSeriesResponseDto extends ResponseDto {
  series: InverterSeriesRow[];
}