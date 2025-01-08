import { useState } from "react";
import styles from "../../styles/FindByPassword.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function FindByPassword() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{2,3})(\d{3,4})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return value;
  };

  const handlePhoneChange = (e) => {
    const input = e.target.value;
    setPhone(formatPhoneNumber(input));
  };

  const handleFindPassword = async (event) => {
    event.preventDefault();

    if (!email) {
      alert("이메일을 입력해주세요.");
      return;
    }
    if (!name) {
      alert("이름을 입력해주세요.");
      return;
    }
    if (!dob) {
      alert("생년월일을 입력해주세요.");
      return;
    }
    if (!phone) {
      alert("전화번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/user/find/pw", {
        email: email,
        name: name,
        birthdate: dob,
        phone: phone,
      });
      const temporaryPassword = response.data; // 서버에서 임시 비밀번호 받기
      alert(
        `임시 비밀번호는 ${temporaryPassword}입니다. 로그인 후 변경해주세요.`
      );
      navigate("/login");
    } catch (error) {
      console.error("비밀번호 찾기 실패:", error);
      alert("비밀번호를 찾을 수 없습니다. 입력 정보를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>비밀번호 찾기</h1>
      <form>
        <div className={styles.formGroupPw}>
          <label htmlFor="email">이메일</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="abc@example.com"
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroupPw}>
          <label htmlFor="name">이름</label>
          <input
            type="text"
            id="name"
            value={name}
            placeholder="홍길동"
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroupPw}>
          <label htmlFor="dob">생년월일</label>
          <input
            type="text"
            id="dob"
            value={dob}
            placeholder="19900101"
            onChange={(e) => setDob(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroupPw}>
          <label htmlFor="phone">전화번호</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            placeholder="010-1234-5678"
            onChange={handlePhoneChange}
            className={styles.input}
            required
          />
        </div>
        <button
          type="submit"
          className={styles.FindPasswordBtn}
          onClick={handleFindPassword}
          disabled={loading}
        >
          {loading ? "처리 중..." : "비밀번호 찾기"}
        </button>
      </form>
    </div>
  );
}
