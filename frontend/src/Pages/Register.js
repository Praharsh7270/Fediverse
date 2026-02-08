
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
    <div className="container-fluid vh-100 p-0">
      <div className="row g-0 h-100">
        {/* Left Side: Image */}
        <div className="col-md-6 d-none d-md-block">
          <div className="h-100 w-100 position-relative">
            <img
              src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d"
              alt="Signup Cover"
              className="w-100 h-100"
              style={{ objectFit: "cover" }}
            />
            <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50"></div>
            <div className="position-absolute bottom-0 start-0 p-5 text-white">
              <h2 className="fw-bold display-6">Join the Revolution</h2>
              <p className="lead">Experience the future of social networking.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="col-md-6 d-flex align-items-center justify-content-center bg-light">
          <div className="p-4 p-md-5 shadow-lg bg-white rounded-4" style={{ maxWidth: "500px", width: "90%" }}>

            {/* Back Button */}
            <div className="mb-4">
              <button
                onClick={() => navigate("/")}
                className="btn btn-outline-secondary btn-sm"
              >
                &larr; Back to Home
              </button>
            </div>

            <div className="text-center mb-4">
              <h2 className="fw-bold mb-2">
                {step === "verify" ? "Verify Account" : "Create Account"}
              </h2>
              <p className="text-muted">
                {step === "verify" ? "Enter the OTP sent to your email" : "Join Fediverse today"}
              </p>
            </div>

            {step === "register" ? (
              <form
                noValidate
                className={`needs-validation ${validated ? "was-validated" : ""}`}
                onSubmit={handleSignup}
              >
                {/* Username */}
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    name="username"
                    id="floatingUsername"
                    className="form-control rounded-3"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="floatingUsername">Username</label>
                  <div className="invalid-feedback">Please enter a username.</div>
                </div>

                {/* Email */}
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    name="email"
                    id="floatingEmail"
                    className="form-control rounded-3"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="floatingEmail">Email address</label>
                  <div className="invalid-feedback">Please enter a valid email.</div>
                </div>

                {/* Password */}
                <div className="form-floating mb-4">
                  <input
                    type="password"
                    name="password"
                    id="floatingPassword"
                    className="form-control rounded-3"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="floatingPassword">Password</label>
                  <div className="invalid-feedback">Please enter a password.</div>
                </div>

                <div className="d-grid gap-2 mb-3">
                  <button
                    className="btn btn-primary btn-lg rounded-3"
                    type="submit"
                    style={{ backgroundColor: "#4f9cff", borderColor: "#4f9cff" }}
                  >
                    Create Account
                  </button>
                </div>

                {/* Login link */}
                <div className="text-center">
                  <p className="text-muted small">
                    Already have an account?{" "}
                    <a href="/login" className="text-decoration-none fw-bold" style={{ color: "#4f9cff" }}>
                      Login
                    </a>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerify}>
                <div className="form-floating mb-4">
                  <input
                    type="text"
                    name="otp"
                    id="floatingOtp"
                    className="form-control rounded-3"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                  <label htmlFor="floatingOtp">Enter OTP</label>
                </div>
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-success btn-lg rounded-3"
                    type="submit"
                  >
                    Verify OTP
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
