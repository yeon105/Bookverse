import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import apiClient from "../../api/axiosInstance";
import styles from "../../styles/BookDetail.module.css";
import errorDisplay from "../../api/errorDisplay";
import { addToWishList, removeFromWishList } from "../../redux/wishlistSlice";
import { addItem } from "../../redux/cartSlice"; // Import the addItem action
import { selectIsInWishlist } from "../../redux/selectors";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import Review from "../common/Review";
import axios from "axios";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isInWishlist = useSelector((state) =>
    selectIsInWishlist(state, parseInt(id, 10))
  );

  const loginFlag = useSelector((state) => state.userInfo.loginFlag);
  const user = useSelector((state) => state.userInfo.user);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.get(
          `http://13.124.100.87:3000/api/book/bookdetail/${id}`
        );
        setBook(response.data);
      } catch (error) {
        errorDisplay(error);
        navigate("/");
      }
    };
    fetchBookDetails();
  }, [id, navigate]);

  const handleCart = async () => {
    if (!loginFlag || !user?.email) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    try {
      await apiClient.post("/api/purchase/add/cart", {
        email: user.email,
        bookId: Number(id),
        quantity: 1,
      });

      // Redux에 장바구니 데이터 저장
      dispatch(
        addItem({
          id: book.id,
          title: book.title,
          author: book.author,
          price: book.price,
          quantity: 1,
        })
      );

      alert("장바구니에 추가되었습니다!");
    } catch (error) {
      errorDisplay(error);
    }
  };

  const handlePurchase = () => {
    if (!loginFlag) {
      alert("로그인 후 이용해주세요.");
      return;
    }
    navigate("/mymenu/cart/purchase");
  };

  const toggleWishlist = async () => {
    if (!book || loading) return;

    if (!loginFlag || !user?.email) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    setLoading(true);
    try {
      if (isInWishlist) {
        await apiClient.post("/api/purchase/delete/wish", {
          email: user.email,
          bookId: Number(id),
        });
        dispatch(removeFromWishList(book));
      } else {
        await apiClient.post("/api/purchase/add/wish", {
          email: user.email,
          bookId: Number(id),
        });
        dispatch(addToWishList(book));
      }
    } catch (error) {
      errorDisplay(error);
    } finally {
      setLoading(false);
    }
  };

  if (!book) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.bookDetailContainer}>
      <div className={styles.bookDetailCard}>
        <div className={styles.bookDetailCardContent}>
          <img
            src={book.image}
            alt={book.title}
            className={styles.bookDetailImage}
          />
          <h2 className={styles.bookDetailTitle}>{book.title}</h2>
          <h3 className={styles.bookDetailAuthor}>{book.author}</h3>
          <div className={styles.bookDetailLeftButtons}>
            <button
              className={styles.bookDetailAddCartButton}
              onClick={handleCart}
            >
              장바구니 담기
            </button>
            <button
              className={styles.bookDetailAddWishlistButton}
              onClick={toggleWishlist}
              disabled={loading}
            >
              {loading ? (
                "처리 중..."
              ) : isInWishlist ? (
                <FaHeart className={styles.bookDetailHeartIconFilled} />
              ) : (
                <FaRegHeart className={styles.bookDetailHeartIconEmpty} />
              )}
            </button>
          </div>
        </div>
      </div>
      <div className={styles.bookDetailCard}>
        <div>
          <p className={styles.bookDetailDesc}>{book.desc}</p>
          <div className={styles.bookDetailInfoRow}>
            <span className={styles.bookDetailLabel}>카테고리</span>
            <span className={styles.bookDetailCategory}>{book.category}</span>
          </div>
          <div className={styles.bookDetailInfoRow}>
            <span className={styles.bookDetailLabel}>출판사</span>
            <span className={styles.bookDetailValue}>{book.publisher}</span>
          </div>
        </div>
        <div className={styles.bookDetailReviewContainer}>
          <Review bookId={Number(id)} />
        </div>
        <button
          className={styles.bookDetailPurchaseButton}
          onClick={handlePurchase}
        >
          구매하기
        </button>
      </div>
    </div>
  );
}
