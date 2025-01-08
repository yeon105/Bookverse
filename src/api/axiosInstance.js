import axios from "axios";
import store from "../redux/store";
import { clearUserInfo, saveJwtToken } from "../redux/userInfoSlice";

const apiClient = axios.create({
  baseURL: "http://13.124.100.87:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (config.data instanceof URLSearchParams) {
      config.headers["Content-Type"] = "application/x-www-form-urlencoded";
    }

    // 스토어에서 JWT 토큰을 가져와 요청 헤더에 추가
    const state = store.getState();
    const jwtToken = state?.userInfo?.jwtToken || null;

    if (jwtToken) {
      config.headers["Authorization"] = `Bearer ${jwtToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 토큰 만료(401) 시 토큰 재발급 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const reissueResponse = await axios.post(
          `${apiClient.defaults.baseURL}/api/reissue`,
          {},
          { withCredentials: true }
        );
        const newToken = reissueResponse.data.accessToken;

        // Redux 상태 업데이트
        store.dispatch(saveJwtToken(newToken));

        // 재발급된 토큰을 요청 헤더에 추가
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

        return apiClient(originalRequest);
      } catch (reissueError) {
        // 로그아웃 처리 및 리다이렉트
        store.dispatch(clearUserInfo());
        window.location.href = "/login";
        return Promise.reject(reissueError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
