import React, { useState, useEffect } from "react";
import axios from "axios";
import BookNav from "../components/book/BookNav";
import BookCard from "../components/book/BookCard";
import Pagination from "./Pagination";
import styles from "../styles/BookList.module.css";

export default function BookList() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수

  useEffect(() => {
    const fetchBooks = async () => {
      // 조건에 따라 endpoint 설정
      const endpoint =
        selectedCategory !== "전체"
          ? `/api/book/category?category=${encodeURIComponent(
              selectedCategory
            )}&page=${currentPage - 1}&size=10`
          : `/api/book/all?page=${currentPage - 1}&size=10`;

      try {
        const response = await axios.get(`${endpoint}`);
        setBooks(response.data.content);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, [selectedCategory, currentPage]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <BookNav
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <div className={styles.bookListContainer}>
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={paginate}
      />
    </>
  );
}
