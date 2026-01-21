import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const username = localStorage.getItem("username");

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">📷 Photoflux Dashboard</h2>

      <div className="d-flex justify-content-around mb-4">
        <Link to="/search" className="btn btn-outline-dark">🔍 Search Users</Link>
        <Link to={`/users/${username}`} className="btn btn-outline-dark">👤 My Profile</Link>
        <Link to={`/users/${username}/followers`} className="btn btn-outline-dark">👥 Followers</Link>
      </div>

      <div className="text-center mt-5">
        <p className="text-muted">Welcome @{username} to your dashboard.</p>
        <p className="text-muted">Explore local users, view profiles, and share your content!</p>
      </div>
    </div>
  );
};

export default Dashboard;
