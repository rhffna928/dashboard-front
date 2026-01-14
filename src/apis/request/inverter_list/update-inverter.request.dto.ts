export default interface UpdateInverterRequestDto {
  plantId: number; // 발전소 아이디 (NotNull)
  groupId: number; // 그룹 아이디 (NotNull)
  unitId: number;  // 국번 (NotNull)

  invId?: string | null;
  invName?: string | null;
  invType?: string | null;
  invModel?: string | null;
  invProtocol?: string | null;

  invCapacity: number; // double(22,1) (NotNull)
  minPower: number;    // (NotNull)
  maxPower: number;    // (NotNull)
  todayGen: number;    // (NotNull)
  totalGen?: number | null;

  useYn?: string | null;
  invFault?: string | null;

  mccbId: number;      // DEFAULT 0 (NotNull)
  mccbStatus: number;  // (NotNull)
}