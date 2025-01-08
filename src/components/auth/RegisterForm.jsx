import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/RegisterForm.module.css";
import axios from "axios";
import apiClient from "../../api/axiosInstance";

export default function RegisterForm() {
  const [emailName, setEmailName] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const emailDomains = [
    "@gmail.com",
    "@naver.com",
    "@daum.net",
    "@yahoo.com",
    "@outlook.com",
    "직접 입력",
  ];

  // 전화번호 하이픈 추가
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

  // 비밀번호 유효성 검사
  const validatePassword = (password) => {
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(password);
  };

  // 이메일 도메인 선택/입력 처리
  const handleDomainChange = (e) => {
    const selectedDomain = e.target.value;
    setEmailDomain(selectedDomain);
    if (selectedDomain === "직접 입력") {
      setCustomDomain("");
    } else {
      setCustomDomain(selectedDomain);
    }
  };

  // 이메일 중복 확인
  const handleCheckUsername = async () => {
    const fullEmail = `${emailName}${customDomain}`;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!fullEmail) {
      alert("이메일을 입력해주세요");
      return;
    }

    if (!emailRegex.test(fullEmail)) {
      alert("유효하지 않은 이메일 형식입니다. 올바른 이메일을 입력해주세요.");
      setEmailName("");
      setCustomDomain("");
      setEmailDomain("");
      return;
    }

    try {
      const response = await axios.get(
        `http://13.124.100.87:8080/api/user/check/id?email=${fullEmail}`,
        { withCredentials: true }
      );
      if (response.data) {
        alert("사용 가능한 이메일입니다.");
        setIsUsernameChecked(true);
      } else {
        alert("이미 사용중인 이메일입니다.");
        setIsUsernameChecked(false);
      }
    } catch (error) {
      alert("네트워크 오류가 발생했습니다.");
    }
  };

  // 다음 주소 API
  const loadPostcodeScript = () => {
    const script = document.createElement("script");
    script.src =
      "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.onload = () => {
      initPostcode();
    };
    document.head.appendChild(script);
  };

  const initPostcode = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        let fullAddress = data.address;
        let extraAddress = "";
        if (data.addressType === "R") {
          if (data.bname !== "") {
            extraAddress += data.bname;
          }
          if (data.buildingName !== "") {
            extraAddress += extraAddress
              ? `, ${data.buildingName}`
              : data.buildingName;
          }
          fullAddress += extraAddress ? ` (${extraAddress})` : "";
        }
        setAddress(fullAddress);
      },
    }).open();
  };

  const handleAddressSearch = () => {
    if (!window.daum) {
      loadPostcodeScript();
    } else {
      initPostcode();
    }
  };

  // 회원가입 유효성 검사
  const isFormValid = () => {
    if (!validatePassword(password)) {
      alert("비밀번호는 8자 이상이며, 영문, 숫자, 특수문자를 포함해야 합니다.");
      return false;
    }
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return false;
    }
    return (
      emailName &&
      customDomain &&
      password &&
      confirmPassword &&
      name &&
      dob &&
      address &&
      phone &&
      isUsernameChecked
    );
  };

  // 회원가입 요청
  const handleRegister = async (event) => {
    event.preventDefault();
    const email = `${emailName}${customDomain}`;
    if (!isFormValid()) {
      return;
    }

    const joinData = {
      email,
      pw: password,
      name,
      birthdate: dob,
      addr: address,
      phone,
    };

    setLoading(true);
    try {
      await axios.post(`http://13.124.100.87:8080/api/user/join`, joinData, {
        withCredentials: true,
      });
      alert("회원가입 성공");
      navigate("/login");
    } catch (error) {
      alert("회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Link to="/">
        <img src="/BookverseLogo.png" className={styles.logoImage} alt="Logo" />
      </Link>
      <form onSubmit={handleRegister}>
        <div className={styles.formGroup}>
          <div className={styles.emailContainer}>
            <input
              type="text"
              value={emailName}
              onChange={(e) => setEmailName(e.target.value)}
              className={styles.emailInput}
              placeholder="이메일"
              required
            />
            <select
              value={emailDomain}
              onChange={handleDomainChange}
              className={styles.emailDomain}
              required
            >
              <option value="">도메인 선택 또는 입력</option>
              {emailDomains.map((domain, index) => (
                <option key={index} value={domain}>
                  {domain !== "직접 입력" ? domain : "도메인 직접 입력"}
                </option>
              ))}
            </select>
            {emailDomain === "직접 입력" && (
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className={styles.customDomainInput}
                placeholder="도메인 입력"
                required
              />
            )}
            <button
              type="button"
              className={styles.checkbtn}
              onClick={handleCheckUsername}
              disabled={loading}
            >
              {loading ? "확인 중..." : "중복확인"}
            </button>
          </div>
        </div>
        <div className={styles.formGroup}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            placeholder="비밀번호 / 8자 이상 / 영문, 숫자, 특수문자 포함"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={styles.input}
            placeholder="비밀번호 확인"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            placeholder="이름"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <input
            type="text"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            placeholder="생년월일 8자리"
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <div className={styles.addressContainer}>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="주소"
              className={styles.input}
              required
            />
            <button
              type="button"
              onClick={handleAddressSearch}
              className={styles.addressSearchBtn}
            >
              주소 찾기
            </button>
          </div>
        </div>
        <div className={styles.formGroup}>
          <input
            type="tel"
            value={phone}
            placeholder="전화번호"
            onChange={handlePhoneChange}
            className={styles.input}
            required
          />
        </div>
        <button type="submit" className={styles.registerbtn} disabled={loading}>
          {loading ? "가입 중..." : "회원가입"}
        </button>
      </form>
    </div>
  );
}
