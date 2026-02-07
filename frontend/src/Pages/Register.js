

import React, { useState } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("register"); // 'register' or 'verify'
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Bootstrap validation
    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      const { data } = await API.post("/api/auth/register", formData);
      if (data.next === "Verify_OTP") {
        setStep("verify");
        alert("OTP sent to your email!");
      } else {
        alert("Signup successful");
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.response?.data?.error || "Signup failed");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await API.post("/api/auth/verify-otp", { email: formData.email, otp });
      alert("Verification successful!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="container mt-5 col-md-6">
      <h2 className="mb-4">{step === "verify" ? "Verify OTP" : "Sign Up"}</h2>

      {step === "register" ? (
        <form
          noValidate
          className={`needs-validation ${validated ? "was-validated" : ""}`}
          onSubmit={handleSignup}
        >
          {/* Floating Username */}
          <div className="form-floating mb-3">
            <input
              type="text"
              name="username"
              id="floatingUsername"
              className="form-control"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <label htmlFor="floatingUsername">Username</label>
            <div className="invalid-feedback">Please enter a username.</div>
          </div>

          {/* Floating Password */}
          <div className="form-floating mb-3">
            <input
              type="password"
              name="password"
              id="floatingPassword"
              className="form-control"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="1"
            />
            <label htmlFor="floatingPassword">Password</label>
            <div className="invalid-feedback">
              Please enter a password with at least 1 characters.
            </div>
          </div>

          {/* Floating Email */}
          <div className="form-floating mb-3">
            <input
              type="email"
              name="email"
              id="floatingEmail"
              className="form-control"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <label htmlFor="floatingEmail">Email address</label>
            <div className="invalid-feedback">Please enter a valid email.</div>
          </div>

          <button className="btn btn-outline-primary w-100" type="submit">
            Register
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <div className="form-floating mb-3">
            <input
              type="text"
              name="otp"
              id="floatingOtp"
              className="form-control"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <label htmlFor="floatingOtp">Enter OTP</label>
          </div>
          <button className="btn btn-success w-100" type="submit">
            Verify OTP
          </button>
        </form>
      )}
    </div>
  );
}
