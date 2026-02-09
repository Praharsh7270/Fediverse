
import React, { useState } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post("/api/auth/forgot-password", { email });
            alert("OTP sent to your email!");
            setStep(2);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to send OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        setLoading(true);
        try {
            await API.post("/api/auth/reset-password", {
                email,
                otp,
                newPassword,
                confirmPassword,
            });
            alert("Password reset successful! Please login.");
            navigate("/login");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid vh-100 p-0">
            <div className="row g-0 h-100">
                {/* Left Side: Image */}
                <div className="col-md-6 d-none d-md-block">
                    <div className="h-100 w-100 position-relative">
                        <img
                            src="https://images.unsplash.com/photo-1555421689-d68471e189f2"
                            alt="Forgot Password Cover"
                            className="w-100 h-100"
                            style={{ objectFit: "cover" }}
                        />
                        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50"></div>
                        <div className="position-absolute bottom-0 start-0 p-5 text-white">
                            <h2 className="fw-bold display-6">Recovery</h2>
                            <p className="lead">Securely reset your password.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="col-md-6 d-flex align-items-center justify-content-center bg-light">
                    <div className="p-4 p-md-5 shadow-lg bg-white rounded-4" style={{ maxWidth: "450px", width: "90%" }}>

                        {/* Back Button */}
                        <div className="mb-4">
                            <button
                                onClick={() => navigate("/login")}
                                className="btn btn-outline-secondary btn-sm"
                            >
                                &larr; Back to Login
                            </button>
                        </div>

                        <div className="text-center mb-4">
                            <h2 className="fw-bold mb-2">Forgot Password</h2>
                            <p className="text-muted">
                                {step === 1 ? "Enter your email to receive an OTP" : "Enter OTP and new password"}
                            </p>
                        </div>

                        {step === 1 ? (
                            <form onSubmit={handleRequestOtp}>
                                <div className="form-floating mb-3">
                                    <input
                                        type="email"
                                        className="form-control rounded-3"
                                        id="floatingEmail"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <label htmlFor="floatingEmail">Email address</label>
                                </div>
                                <div className="d-grid gap-2">
                                    <button
                                        className="btn btn-primary btn-lg rounded-3"
                                        type="submit"
                                        disabled={loading}
                                        style={{ backgroundColor: "#4f9cff", borderColor: "#4f9cff" }}
                                    >
                                        {loading ? "Sending..." : "Send OTP"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword}>
                                <div className="form-floating mb-3">
                                    <input
                                        type="text"
                                        className="form-control rounded-3"
                                        id="floatingOtp"
                                        placeholder="Enter OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                    />
                                    <label htmlFor="floatingOtp">OTP</label>
                                </div>
                                <div className="form-floating mb-3">
                                    <input
                                        type="password"
                                        className="form-control rounded-3"
                                        id="floatingNewPass"
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                    <label htmlFor="floatingNewPass">New Password</label>
                                </div>
                                <div className="form-floating mb-4">
                                    <input
                                        type="password"
                                        className="form-control rounded-3"
                                        id="floatingConfirmPass"
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <label htmlFor="floatingConfirmPass">Confirm Password</label>
                                </div>
                                <div className="d-grid gap-2">
                                    <button
                                        className="btn btn-success btn-lg rounded-3"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? "Resetting..." : "Reset Password"}
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
