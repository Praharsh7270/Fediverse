// src/pages/Users.js
import React, { useEffect, useState } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";

function Users() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Error loading users"));
  }, []);

  return (
    <div className="container">
      <h2>All Users</h2>
      <ul className="list-group">
        {users.map((user) => (
          <li className="list-group-item d-flex justify-content-between" key={user._id}>
            @{user.username}
            <button className="btn btn-sm btn-outline-info" onClick={() => navigate(`/profile/${user.username}`)}>
              View
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Users;
