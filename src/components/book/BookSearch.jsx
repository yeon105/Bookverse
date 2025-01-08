import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import BookCard from "./BookCard";
import styles from "../../styles/BookSearch.module.css";

function BookSearch() {
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = searchParams.get("query"); // URL에서 query 파라미터를 가져옴
    if (query) {
      fetchBooks(query);
    }
  }, [searchParams]);

  const fetchBooks = async (query) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/book/search`, {
        params: { query: query },
      });
      setBooks(response.data);
    } catch (error) {
      console.error("Failed to fetch books:", error);
      setBooks([]); // 에러 발생 시 책 목록을 비움
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {books.length > 0 ? (
        <>
          <span className={styles.resultTotal}>
            총 {books.length} 건의 검색
          </span>
          <div className={styles.bookSearchListContainer}>
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </>
      ) : (
        <div className={styles.noResult}>
          <h3>{searchParams.get("query")}</h3>
          <p>해당 검색어의 결과가 없습니다. 제목 또는 작가를 입력해주세요.</p>
        </div>
      )}
    </div>
  );
}

export default BookSearch;
