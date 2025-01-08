import styles from "../../styles/LoginForm.module.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { saveJwtToken, setRole, setUserInfo } from "../../redux/userInfoSlice";
import apiClient from "../../api/axiosInstance";
import errorDisplay from "../../api/errorDisplay";
import axios from "axios";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.userId) {
      setEmail(location.state.userId); // 이전 페이지에서 이메일 전달 시 기본값 설정
    }
  }, [location.state]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const params = new URLSearchParams();
    params.append("username", email);
    params.append("password", password);

    try {
      // 로그인 요청
      const response = await axios.post(
        "http://13.124.100.87:8080/api/user/login",
        params,
        {
          withCredentials: true,
        }
      );

      // JWT 토큰 추출
      const token = response.headers["authorization"]?.split(" ")[1];
      const role = response.data.role;

      // Redux 상태 업데이트
      await dispatch(saveJwtToken(token));
      await dispatch(setRole(role));

      // 사용자 정보 요청
      if (role === "ROLE_USER") {
        const userInfoResponse = await axios.get(
          "http://13.124.100.87:8080/api/user/userinfo",
          {
            params: { email },
            withCredentials: true,
          }
        );

        // Redux에 사용자 정보 저장
        await dispatch(setUserInfo(userInfoResponse.data));
      }

      // 홈 페이지로 이동
      navigate("/");
    } catch (error) {
      errorDisplay(error); // 사용자 친화적인 에러 메시지 출력
      console.error("로그인 실패:", error.response?.data || "서버 연결 실패");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.container}>
        <Link to="/">
          <img
            src="/BookverseLogo.png"
            className={styles.logoImage}
            alt="Bookverse logo"
          />
        </Link>
        <input
          type="email"
          placeholder="아이디 (email)"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className={styles.button}>
          로그인
        </button>
        <div className={styles.orContainer}>
          <hr className={styles.line} />
        </div>
        <button className={styles.naverButton}>네이버 로그인</button>
        <div className={styles.linkContainer}>
          <Link to="/register" className={styles.link}>
            회원가입
          </Link>
          <Link to="/finduserinfo" className={styles.link}>
            아이디/비밀번호 찾기
          </Link>
        </div>
      </div>
    </form>
  );
}
