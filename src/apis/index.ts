import axios from 'axios';
import type { SignInRequestDto, SignUpRequestDto } from './request/auth';
import type { SignUpResponseDto, SignInResponseDto } from './response/auth';
import type { ResponseDto } from './response';
import type { GetSignInUserResponseDto } from './response/user';
import type { GetAdminUserListResponseDto } from './response/admin';
import type {} from './response/user';
import type UpdateUserRequestDto from './request/admin/update-user.request.dto';
import type { UpdateUserResponseDto } from './response/admin';
import type { CreateInverterRequestDto, UpdateInverterRequestDto } from './request/inverter_list';
import type { DeleteUserResponseDto } from './request/admin';
import type { CreateInverterResponseDto, DeleteInverterResponseDto,
   GetInverterResponseDto, UpdateInverterResponseDto, GetUserInverterList2ResponseDto
   } from './response/inverter_list';
import type { GetAlarmListResponseDto, GetAlarmDeviceTypeResponseDto } from './response/alarm';
import type { GetAlarmListParams, GetAlarmDeviceIdOptionsParams } from './request/alarm';
import type {GetInverterHistoryResponseDto, GetInverterLastResponseDto} from "./response/inverter";
import type {GetInverterHistoryRequestDto,GetInverterLastRequestDto} from "./request/inverter";

const DOMAIN = 'http://localhost:4000';

const API_DOMAIN = `${DOMAIN}/api/v1`;

const authorization = (accessToken:string) => {
    return {headers: {authorization: `Bearer ${accessToken}`}}
}

const SIGN_IN_URL = () => `${API_DOMAIN}/auth/sign-in`;
const SIGN_UP_URL = () => `${API_DOMAIN}/auth/sign-up`;


export const signInRequest = async (requestBody: SignInRequestDto) => {
    const result = await axios.post(SIGN_IN_URL(), requestBody)
        .then(response => {
            const responseBody: SignInResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if(!error.response.data) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        });
    return result;
}

export const signUpRequest = async (requestBody: SignUpRequestDto) => {
    const result = await axios.post(SIGN_UP_URL(), requestBody)
        .then(response => {
            const responseBody: SignUpResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if(!error.response.data) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        });
    return result;
}


const GET_SIGN_IN_USER_URL = () => `${API_DOMAIN}/user`;


export const getSignInUserRequest = async (accessToken:string) => {
    const result = await axios.get(GET_SIGN_IN_USER_URL(),authorization(accessToken))
        .then(response => {
            const responseBody: GetSignInUserResponseDto = response.data;
            return responseBody;
        })
        .catch(error =>{
            if(!error.responst) return null;
            const responseBody: ResponseDto = error.responst.data;
            return responseBody;
        });
    return result;
}

const GET_ADMIN_USER_LIST = () => `${API_DOMAIN}/admin/users`;

export const getAdminUsersRequest = async(accessToken: string) => {
    const result = await axios.get(GET_ADMIN_USER_LIST(),authorization(accessToken))
        .then(response => {
            const responseBody: GetAdminUserListResponseDto = response.data;
            return responseBody;
        })
        .catch(error =>{
            if(!error.responst) return null;
            const responseBody: ResponseDto = error.responst.data;
            return responseBody;
        });
    return result;
}
const DELETE_ADMIN_USER = (userId: string) => `${API_DOMAIN}/admin/users/${encodeURIComponent(userId)}`;

export const adminUserDeleteRequest = async (
  userId: string,
  accessToken: string
): Promise<DeleteUserResponseDto | ResponseDto | null> => {
  try {
    const response = await axios.delete(
      DELETE_ADMIN_USER(userId),
      authorization(accessToken) // <-- headers config
    );
    return response.data as DeleteUserResponseDto;
  } catch (error: any) {
    if (!error?.response) return null;
    return error.response.data as ResponseDto;
  }
};
const PUT_ADMIN_USER_UPDATE = (userId: string) => `${API_DOMAIN}/admin/users/${encodeURIComponent(userId)}`;

export const putAdminUserUpdateRequest = async (
  userId: string,
  requestBody: UpdateUserRequestDto,
  accessToken: string
): Promise<UpdateUserResponseDto | ResponseDto | null> => {
  try {
    const response = await axios.put(
      PUT_ADMIN_USER_UPDATE(userId),
      requestBody,
      authorization(accessToken)
    );
    return response.data as UpdateUserResponseDto;
  } catch (error: any) {
    if (!error?.response) return null;
    return error.response.data as ResponseDto;
  }
};

const GET_INVERTER_LIST = () => `${API_DOMAIN}/invt_list2`;

export const getInverterListRequest = async (
  accessToken: string
): Promise<GetInverterResponseDto | ResponseDto | null> => {
  try {
    const response = await axios.get(
      GET_INVERTER_LIST()
      ,authorization(accessToken) // <-- headers config
    );
    return response.data as GetInverterResponseDto;
  } catch (error: any) {
    if (!error?.response) return null;
    return error.response.data as ResponseDto;
  }
};

const CREATE_INVERTER_LIST = () => `${API_DOMAIN}/invt_list2/create`;


export const createInverterListRequest = async (
  requestBody: CreateInverterRequestDto,
  accessToken: string
): Promise<CreateInverterResponseDto | ResponseDto | null> => {
  try {
    const response = await axios.post(
      CREATE_INVERTER_LIST()
      ,requestBody
      ,authorization(accessToken)
    );
    return response.data as CreateInverterResponseDto;
  } catch (error: any) {
    if (!error?.response) return null;
    return error.response.data as ResponseDto;
  }
};

const PUT_UPDATE_INVERTER = (id: number) => `${API_DOMAIN}/invt_list2/${encodeURIComponent(id)}`;

export const putUpdateInverterRequest = async (
  id: number,
  requestBody: UpdateInverterRequestDto,
  accessToken: string
): Promise<UpdateInverterResponseDto | ResponseDto | null> => {
  try {
    const response = await axios.put(
      PUT_UPDATE_INVERTER(id),
      requestBody,
      authorization(accessToken) 
    );
    return response.data as UpdateInverterResponseDto;
  } catch (error: any) {
    if (!error?.response) return null;
    return error.response.data as ResponseDto;
  }
};

const DELETE_INVERTER = (id: number) => `${API_DOMAIN}/invt_list2/${encodeURIComponent(id)}`;

export const deleteInverterRequest = async (
  id: number,
  accessToken: string
): Promise<DeleteInverterResponseDto | ResponseDto | null> => {
  try {
    const response = await axios.delete(
      DELETE_INVERTER(id),
      authorization(accessToken) 
    );
    return response.data as DeleteInverterResponseDto;
  } catch (error: any) {
    if (!error?.response) return null;
    return error.response.data as ResponseDto;
  }
};


const GET_ALRAM_LIST = () => `${API_DOMAIN}/alarm/list`;

export const getAlramListRequest = async (
  accessToken: string,
  params: GetAlarmListParams
): Promise<GetAlarmListResponseDto | ResponseDto | null> => {
  try {
    const response = await axios.get(
      GET_ALRAM_LIST(),{
      ...authorization(accessToken) // <-- headers config
      ,params: {
        plantId: params.plantId ?? undefined,
        from: params.from,
        to: params.to,
        deviceType: params.deviceType ?? "ALL",
        deviceId: params.deviceId ?? "ALL",
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    });
    return response.data as GetAlarmListResponseDto;
  } catch (error: any) {
    if (!error?.response) return null;
    return error.response.data as ResponseDto;
  }
};

const GET_ALRAM_DEVICE_TYPE_LIST = () => `${API_DOMAIN}/alarm/device-ids`;

export const getAlramDeviceTypeListRequest = async (
  accessToken: string,
  params: GetAlarmDeviceIdOptionsParams
): Promise<GetAlarmDeviceTypeResponseDto | ResponseDto | null> => {
  try {
    const response = await axios.get(
      GET_ALRAM_DEVICE_TYPE_LIST(),{
        ...authorization(accessToken) // <-- headers config
        ,params: {
          plantId: params.plantId ?? undefined,
          from: params.from,
          to: params.to,
          deviceType: params.deviceType ?? "ALL",
        },
      });
    return response.data as GetAlarmDeviceTypeResponseDto;
  } catch (error: any) {
    if (!error?.response) return null;
    return error.response.data as ResponseDto;
  }
};

const GET_INVERTER_HISTORY_LIST = () => `${API_DOMAIN}/inverters`;

export const getInverterHistoryRequest = async (
  accessToken: string,
  params: GetInverterHistoryRequestDto
): Promise<GetInverterHistoryResponseDto | ResponseDto | null> => {
  try {
    const response = await axios.get(GET_INVERTER_HISTORY_LIST(), {
      ...authorization(accessToken),
      params: {
        plantId: params.plantId ?? undefined,
        invId: params.invId ?? undefined,
        from: params.from,
        to: params.to,
        bucketSec: params.bucketSec ?? 60,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
      // 헤더를 여기서 넣거나(아래), axios interceptor로 전역 주입해도 됨
      // headers: { Authorization: `Bearer ${token}` },
    });
    return response.data as GetInverterHistoryResponseDto;
  } catch (error: any) {
    if (!error?.response) return null;
    return error.response.data as ResponseDto;
  }
};


const GET_USER_PLANT_LIST2 = () => `${API_DOMAIN}/plants/usr`;

export const getUserPlantList2Request = async (
  accessToken: string
): Promise<GetAlarmListResponseDto | ResponseDto | null> => {
  try {
    const response = await axios.get(
      GET_USER_PLANT_LIST2(),authorization(accessToken));
    return response.data as GetAlarmListResponseDto;
  } catch (error: any) {
    if (!error?.response) return null;
    return error.response.data as ResponseDto;
  }
};

const GET_USER_INVERTER_LIST2 = () => `${API_DOMAIN}/invt_list2/usr`;

export const getUserInverterList2Request = async (
  accessToken: string
): Promise<GetUserInverterList2ResponseDto | ResponseDto | null> => {
  try {
    const response = await axios.get(
      GET_USER_INVERTER_LIST2(),authorization(accessToken));
    return response.data as GetUserInverterList2ResponseDto;
  } catch (error: any) {
    if (!error?.response) return null;
    return error.response.data as ResponseDto;
  }
};

const GET_USER_INVERTER_LAST = () => `${API_DOMAIN}/inverters/usr`;

export const getDashboardKpiRequest = async (
  accessToken: string,
  params: GetInverterLastRequestDto
): Promise<GetInverterLastResponseDto | ResponseDto | null> => {
  try {
    const response = await axios.get(GET_USER_INVERTER_LAST(), {
        ...authorization(accessToken),
        params: {
         invId : params.invId ?? undefined
        },
      });
    return response.data as GetInverterLastResponseDto;
  } catch (error: any) {
    if (!error?.response) return null;
    return error.response.data as ResponseDto;
  }
};