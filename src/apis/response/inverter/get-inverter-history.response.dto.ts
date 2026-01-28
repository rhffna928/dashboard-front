import type ResponseDto from "../Response.dto";

export interface InverterHistoryItem {
  id: number;
  plantId: number;
  invId: number;
  invStatus: string;
  invFault?: string | null;
  inVolt: number;
  inCurrent: number;
  inPower: number;
  outVolt1: number;
  outVolt2: number;
  outVolt3: number;
  outCurrent1: number;
  outCurrent2: number;
  outCurrent3: number;
  outPower: number;
  hz: number;
  todayGen: number;
  totalGen: number;
  recvTime: string;
  regdate: string;
}

export default interface GetInverterHistoryResponseDto extends ResponseDto {
  inverters: InverterHistoryItem[];
  totalElements: number;
  totalPages: number;
}