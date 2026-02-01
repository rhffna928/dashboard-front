// src/apis/response/alarm/get-alarm-list.response.ts
import type ResponseDto from "../Response.dto"; // 너 프로젝트 공통 ResponseDto 경로에 맞춰
// or: import ResponseDto from "../response.dto";

export type AlarmRow = {
  id: number;
  plantId: number;
  deviceType: string;
  deviceId: string;
  deviceName: string;
  alarmMessage: string;
  alarmFlag: string;    // "발생" | "해제" 등
  alertFlag: string;
  regDate: string;   // ISO
  
};

export type PageDto<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // 0-based
  size: number;
};

export default interface GetAlarmListResponseDto extends ResponseDto {
  data?: PageDto<AlarmRow>;
}

/** 백엔드에서 실제로 오는 원본 형태 */
export type GetAlarmListBackendResponse = ResponseDto & {
  alarms?: AlarmRow[];
  totalElements?: number;
  totalPages?: number;
};
