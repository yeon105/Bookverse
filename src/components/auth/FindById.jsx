import { useState } from "react";
import styles from "../../styles/FindById.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function FindById() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const navigate = useNavigate();

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, ""); // 숫자만 남김
    const match = cleaned.match(/^(\d{2,3})(\d{3,4})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return value;
  };

  const handlePhoneChange = (e) => {
    const input = e.target.value;
    setPhone(formatPhoneNumber(input)); // 입력값을 포맷팅
  };

  const handleFindId = async (event) => {
    event.preventDefault();
    if (!name) {
      alert("이름을 입력해주세요");
      return;
    }
    if (!dob) {
      alert("생년월일을 선택해주세요");
      return;
    }
    if (!phone) {
      alert("전화번호를 입력해주세요");
      return;
    }

    setLoading(true); // 로딩 시작
    try {
      const response = await axios.post("/api/user/find/id", {
        name: name,
        birthdate: dob, // 서버에서 'birthdate'로 매핑된 필드 이름 확인
        phone: phone,
      });
      const userId = response.data; // 서버에서 직접 반환한 아이디
      alert(`당신의 아이디는 ${userId}입니다`);
      navigate("/login", { state: { userId } });
    } catch (error) {
      console.error("아이디 찾기 실패:", error);
      alert("아이디를 찾을 수 없습니다. 입력 정보를 확인해주세요.");
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>아이디 찾기</h1>
      <form>
        <div className={styles.formGroupId}>
          <label htmlFor="name">이름</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="홍길동"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroupId}>
          <label htmlFor="dob">생년월일</label>
          <input
            type="text"
            id="dob"
            name="dob"
            value={dob}
            placeholder="19900101"
            onChange={(e) => setDob(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroupId}>
          <label htmlFor="phone">전화번호</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={phone}
            placeholder="010-1234-5678"
            onChange={handlePhoneChange}
            className={styles.input}
            required
          />
        </div>
        <button
          type="submit"
          className={styles.FindIdBtn}
          onClick={handleFindId}
          disabled={loading} // 로딩 중 버튼 비활성화
        >
          {loading ? "처리 중..." : "아이디 찾기"}
        </button>
      </form>
    </div>
  );
}
