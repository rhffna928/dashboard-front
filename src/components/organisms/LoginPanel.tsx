import React, { useState } from 'react';
import { InputField } from '../atoms/InputField';
import { Button } from '../atoms/Button';
import axios from 'axios';
import swlogo from '../../assets/swlogo.png';

export const LoginPanel: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [userPassword, setUserPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:4000/api/v1/auth/sign-in", {
        userId: userId,
        userPassword: userPassword
      });

      const token = response.data.token;

      // JWT 저장
      localStorage.setItem("token", token);

      alert("로그인 성공!");
      // 페이지 이동
      window.location.href = "/dashboard";

    } catch (error: any) {
      console.error(error);
      alert("로그인 실패: ID 또는 PW를 확인해주세요.");
    }
  };

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
        <Button primary className="w-full text-lg" onClick={handleLogin}>
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
