export default interface PlantRequestDto {
  plantCode: number;
  plantName: string;
  plantOwner: string;
  plantMan: string;
  userId: string;
  plantCapacity: string;   // 서버가 문자열로 받는 구조면 string 유지
  plantPrice: string;
  address: string;
  // 수정 시 미전송(null) 가능
  lat?: string;
  lng?: string;
  // 수정 시 미전송(null) 가능
  useYn?: string;   // "Y" | "N"
  smsYn?: string;   // "Y" | "N"
  infoYn?: string;  // "Y" | "N"
  startYmd: string;        // 예: "2021-07-16" 또는 "20210716" (서버 포맷에 맞춤)
  startYear: string;       // 예: "2021"
  moduleInfo: string;
  invInfo: string;
  getDataSec: number;
  yesGen: number;          // Double -> number
  monthGen: number;        // Double -> number
  regdate: string;
}