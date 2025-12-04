import axios from 'axios';
import type { SignInRequestDto, SignUpRequestDto } from './request/auth';
import type { SignInResponseDto, SignUpResponseDto } from './response/auth';
import type { ResponseDto } from './response';
import type { GetSignInUserResponseDto } from './response/user';

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

export const SignUpRequest = async (requestBody: SignUpRequestDto) => {
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