export interface Inverter {
  id: number;          // id int(11)
  plantId: number;     // plant_id int(11)
  invId: number;       // inv_id int(11)

  invStatus: string;   // inv_status varchar(50)
  invFault: string;    // inv_fault varchar(50)

  inVolt: number;      // in_volt double(22,1)
  inCurrent: number;   // in_current double(22,1)
  inPower: number;     // in_power double(22,1)

  outVolt1: number;    // out_volt1 double(22,1)
  outVolt2: number;    // out_volt2 double(22,1)
  outVolt3: number;    // out_volt3 double(22,1)

  outCurrent1: number; // out_current1 double(22,1)
  outCurrent2: number; // out_current2 double(22,1)
  outCurrent3: number; // out_current3 double(22,1)

  outPower: number;    // out_power double(22,1)
  hz: number;          // hz double(22,1)

  todayGen: number;    // today_gen double(22,1)
  totalGen: number;    // total_gen double(22,1)

  recvTime: string;    // recv_time datetime  (프론트는 string으로 받는게 편함)
  regdate: string;     // regdate datetime
}

// 그래프용 포인트(시간대별 outPower)
export interface InverterPowerPoint {
  time: string;   // 예: "11:05" 또는 "2026-01-12 11:05"
  outPower: number;
}
