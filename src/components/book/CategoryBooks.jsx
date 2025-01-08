import React, { useEffect, useState } from "react";
import axios from "axios";
import BookSwiper from "./BookSwiper";
import errorDisplay from "../../api/errorDisplay";

function CategoryBooks({ category }) {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // 카테고리 값을 URL 인코딩
        const encodedCategory = encodeURIComponent(category);
        const response = await axios.get(
          `http://13.124.100.87:8080/api/purchase/top/category?category=${encodedCategory}`,
          { withCredentials: true }
        );
        setBooks(response.data);
      } catch (error) {
        errorDisplay(error);
        console.error("Error fetching category books:", error);
      }
    };

    fetchBooks();
  }, [category]);

  return (
    <>
      <BookSwiper books={books} />
    </>
  );
}

export default CategoryBooks;
