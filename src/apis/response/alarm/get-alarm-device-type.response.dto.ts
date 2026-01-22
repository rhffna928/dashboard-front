import type ResponseDto from "../Response.dto";

export default interface GetAlarmDeviceTypeResponseDto extends ResponseDto {
  data?: string[];
}

export type GetAlarmDeviceIdsBackendResponse = ResponseDto & {
  deviceIds?: string[]; // 백엔드 실제 키에 맞춰 수정
  // 또는 alarms처럼 다른 키면 그걸로
};