import React, { useState } from 'react';
import { InputField } from '../atoms/InputField';
import { Button } from '../atoms/Button';
import axios from 'axios';
import swlogo from '../../assets/swlogo.png';
import type { SignInRequestDto } from 'apis/request/auth';
import { signInRequest } from '../../apis';
import type SignInResponseDto from 'apis/response/auth/sign-in.response.dto';
import type { ResponseDto } from 'apis/response';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { AUTH_PATH, MAIN_PATH } from '../../constant';

export const LoginPanel: React.FC = () => {
  
  //          state: 쿠키 상태          //
  const [cookies, setCookie] = useCookies();
  // 에러 상태 //
  const navigator = useNavigate();
  //          state: 아이디 상태          //
  const [userId, setUserId] = useState('');
  //          state: 패스워드 상태          //
  const [userPassword, setUserPassword] = useState('');

  // 에러 상태 //
  const [error, setError] = useState<boolean>(false);
  
  // function: sign in response 처리 함수 //
  const signInResponse = (responseBody: SignInResponseDto | ResponseDto | null) =>{
    console.log(responseBody)
    if(!responseBody) {
      alert("네트워크 이상입니다.");
      return;
    }
    const { code } = responseBody;
    if(code === 'AF') alert("모두 입력하세요.");
    if(code === 'DBE') alert("데이터베이스 ERROR");
    if(code === 'SF' || code === 'VF') setError(true);
    if(code === 'SU'){

      const { token, expirationTime } = responseBody as SignInResponseDto;
      const now = new Date().getTime();
      const expires = new Date(now + expirationTime * 1000);

      setCookie('accessToken', token, {expires, path: MAIN_PATH()});
      console.log("Redirecting to: ", MAIN_PATH());
      window.location.href = MAIN_PATH();
    }
  }

  const onSignInButtonClickHandler = async () =>{
    //console.log(signInResponse)
    const requsetBody: SignInRequestDto = {userId,userPassword};

    await signInRequest(requsetBody).then(signInResponse); 
  }

  return (
    <div className="w-full max-w-sm p-8 bg-white shadow-xl rounded-lg">
      <h2 className="text-3xl font-light mb-8 text-gray-700">Login</h2>

      <InputField
        label="ID"
        placeholder="ID"
        type="text"
        value={userId}
        onChange={(e: any) => setUserId(e.target.value)}
      />

      <InputField
        label="PW"
        placeholder="PW"
        type="password"
        value={userPassword}
        onChange={(e: any) => setUserPassword(e.target.value)}
      />

      <div className="mt-6">
        <Button primary className="w-full text-lg" onClick={onSignInButtonClickHandler}>
          로그인
        </Button>
      </div>

      <div className="mt-12 text-center">
        <span className="w-2/5 flex m-auto">
          <img src={swlogo}></img>
        </span>
      </div>
    </div>
  );
};
