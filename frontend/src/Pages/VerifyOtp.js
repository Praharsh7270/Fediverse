import React, { useState } from "react";
import API from "../utils/api";
import { useNavigate, useLocation } from "react-router-dom";

export default function VerifyOtp() {
    const [otp, setOtp] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            if (!email) {
                alert("Email missing. Please register again.");
                return;
            }
            await API.post("/api/auth/verify-otp", { email, otp });
            alert("Verification successful!");
            navigate("/login");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Verification failed");
        }
    };

    return (
        <div className="container mt-5 col-md-6">
            <h2 className="mb-4">Verify OTP</h2>
            <p>Enter the OTP sent to <strong>{email}</strong></p>
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
        </div>
    );
}
