import axios from 'axios';
import type { SignInRequestDto, SignUpRequestDto } from './request/auth';
import type { SignUpResponseDto, SignInResponseDto } from './response/auth';
import type { ResponseDto } from './response';
import type { GetSignInUserResponseDto,GetAdminUserListResponseDto } from './response/user';
import type {} from './response/user';
import type UpdateUserRequestDto from './request/admin/update-user.request.dto';
import type { UpdateUserResponseDto } from './response/admin';

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
const PUT_ADMIN_USER_DELETE = (userId: string) => `${API_DOMAIN}/admin/users/${encodeURIComponent(userId)}`;

export const adminUserDeleteRequest = async (
  userId: string,
  accessToken: string
): Promise<UpdateUserResponseDto | ResponseDto | null> => {
  try {
    const response = await axios.delete(
      PUT_ADMIN_USER_DELETE(userId),
      authorization(accessToken) // <-- headers config
    );
    return response.data as UpdateUserResponseDto;
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
      authorization(accessToken) // <-- headers config
    );
    return response.data as UpdateUserResponseDto;
  } catch (error: any) {
    if (!error?.response) return null;
    return error.response.data as ResponseDto;
  }
};