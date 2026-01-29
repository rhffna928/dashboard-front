export interface InverterList2Row {
  plantId: number;     // 발전소 아이디
  groupId: number;     // 그룹 아이디
  unitId: number;      // 국번

  invId: string;
  invName: string;
  invType: string;
  invModel: string;
  invProtocol: string;

  invCapacity: number; // double(22,1)
  minPower: number;
  maxPower: number;
  todayGen: number;
  totalGen: number;

  useYn: string;       // "Y" | "N" 등 서버 정의에 맞춤
  invFault: string;

  mccbId: number;      // DEFAULT 0
  mccbStatus: number;
}
