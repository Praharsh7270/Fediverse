
import React, { useState, useContext } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Bootstrap validation check
    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/api/auth/login", formData);
      login(res.data.token);
      localStorage.setItem("username", res.data.user.username);
      alert("Login successful");
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      alert(
        err.response?.data?.error || "Login failed. Please check credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 col-md-5">
      <h2 className="mb-4">Login</h2>
      <form
        noValidate
        className={`needs-validation ${validated ? "was-validated" : ""}`}
        onSubmit={handleLogin}
      >
        {/* Floating Username */}
        <div className="form-floating mb-3">
          <input
            type="text"
            id="floatingUsername"
            name="username"
            className="form-control"
            placeholder="Username"
            onChange={handleChange}
            value={formData.username}
            required
          />
          <label htmlFor="floatingUsername">Username</label>
          <div className="invalid-feedback">Please enter your username.</div>
        </div>

        {/* Floating Password */}
        <div className="form-floating mb-3">
          <input
            type="password"
            id="floatingPassword"
            name="password"
            className="form-control"
            placeholder="Password"
            onChange={handleChange}
            value={formData.password}
            required
            minLength="1"
          />
          <label htmlFor="floatingPassword">Password</label>
          <div className="invalid-feedback">
            Please enter your password (at least 1 characters).
          </div>
        </div>

        <button className="btn btn-dark w-100" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
