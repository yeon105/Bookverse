import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../styles/HomePage.css";
import BookSwiper from "../components/book/BookSwiper";
import errorDisplay from "../api/errorDisplay";
import CategoryBooks from "../components/book/CategoryBooks";
import { setWishList } from "../redux/wishlistSlice";
import apiClient from "../api/axiosInstance";

export default function HomePage() {
  const [popularBooks, setPopularBooks] = useState([]);
  const dispatch = useDispatch();
  const loginFlag = useSelector((state) => state.userInfo.loginFlag); // Redux에서 loginFlag 가져오기
  const user = useSelector((state) => state.userInfo.user);

  // 위시리스트 데이터를 가져와 Redux에 저장
  const fetchWishlist = useCallback(async () => {
    if (!loginFlag || !user?.email) return; // loginFlag가 false거나 user가 없으면 실행하지 않음

    try {
      const response = await apiClient.get(`/api/purchase/wishlist`, {
        params: { email: user.email }, // 사용자 이메일 추가
      });
      dispatch(setWishList(response.data));
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      errorDisplay(error);
    }
  }, [dispatch, loginFlag, user?.email]);

  // 인기 도서 데이터 fetch
  const fetchData = useCallback(async () => {
    try {
      const popularResponse = await axios.get("/api/purchase/top/all", {
        withCredentials: true,
      });
      setPopularBooks(popularResponse.data);
    } catch (error) {
      console.error("Error fetching popular books:", error);
      errorDisplay(error);
    }
  }, []);

  // 마운트될 때 데이터를 가져옴
  useEffect(() => {
    fetchWishlist();
    fetchData();
  }, [fetchWishlist, fetchData]);

  return (
    <div className="swiper-container">
      <h2 className="title">인기도서</h2>
      <BookSwiper books={popularBooks} />
      <h2 className="title">문학/소설</h2>
      <CategoryBooks category="문학/소설" />
      <h2 className="title3">인문학</h2>
      <CategoryBooks category="인문학" />
      <h2 className="title">사회과학</h2>
      <CategoryBooks category="사회과학" />
      <h2 className="title">자연과학</h2>
      <CategoryBooks category="자연과학" />
      <h2 className="title">기술/공학</h2>
      <CategoryBooks category="기술/공학" />
      <h2 className="title2">예술</h2>
      <CategoryBooks category="예술" />
      <h2 className="title2">실용</h2>
      <CategoryBooks category="실용" />
      <h2 className="title2">어학</h2>
      <CategoryBooks category="어학" />
      <h2 className="title5">아동/청소년</h2>
      <CategoryBooks category="아동/청소년" />
      <h2 className="title">학술/전문</h2>
      <CategoryBooks category="학술/전문서적" />
    </div>
  );
}
