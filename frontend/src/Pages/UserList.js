// import React, { useEffect, useState, useContext } from "react";
// import axios from "axios";
// import { AuthContext } from "../context/AuthContext";

// const UserList = () => {
//   const { token } = useContext(AuthContext);
//   const [users, setUsers] = useState([]);
//   const [followed, setFollowed] = useState({});
//   const [error, setError] = useState(null);

//   const loggedInUserId = localStorage.getItem("userId");

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const res = await axios.get(
//           "https://221788875025.ngrok-free.app/api/users",
//           {
//             headers: {
//               "ngrok-skip-browser-warning": "true",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         setUsers(res.data);
//       } catch (err) {
//         setError("Failed to load users.");
//       }
//     };
//     fetchUsers();
//   }, [token]);

//   const handleFollow = async (userId) => {
//     try {
//       await axios.post(
//         `https://221788875025.ngrok-free.app/api/users/${userId}/follow`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "ngrok-skip-browser-warning": "true",
//           },
//         }
//       );
//       setFollowed({ ...followed, [userId]: true });
//     } catch (err) {
//       console.error("Follow failed", err);
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h3>All Local Users</h3>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <ul className="list-group mt-3">
//         {users
//           .filter((user) => user._id !== loggedInUserId)
//           .map((user) => (
//             <li
//               key={user._id}
//               className="list-group-item d-flex justify-content-between align-items-center"
//             >
//               <div>
//                 <strong>@{user.username}</strong>
//               </div>
//               <button
//                 className="btn btn-sm btn-outline-primary"
//                 onClick={() => handleFollow(user._id)}
//                 disabled={followed[user._id]}
//               >
//                 {followed[user._id] ? "Following" : "Follow"}
//               </button>
//             </li>
//           ))}
//       </ul>
//     </div>
//   );
// };

// export default UserList;




















// import React, { useEffect, useState, useContext } from "react";
// import axios from "axios";
// import { AuthContext } from "../context/AuthContext";

// const UserList = () => {
//   const { token } = useContext(AuthContext);
//   const [users, setUsers] = useState([]);
//   const [followed, setFollowed] = useState({});
//   const [error, setError] = useState(null);

//   const loggedInUserId = localStorage.getItem("userId");

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const res = await axios.get(
//           `${process.env.REACT_APP_API_URL}/api/users`,
//           {
//             headers: {
//               "ngrok-skip-browser-warning": "true",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         setUsers(res.data);
//       } catch (err) {
//         setError("Failed to load users.");
//       }
//     };
//     fetchUsers();
//   }, [token]);

//   const handleFollow = async (userId) => {
//     try {
//       await axios.post(
//         `${process.env.REACT_APP_API_URL}/api/users/${userId}/follow`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "ngrok-skip-browser-warning": "true",
//           },
//         }
//       );
//       setFollowed({ ...followed, [userId]: true });
//     } catch (err) {
//       console.error("Follow failed", err);
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h3>All Local Users</h3>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <ul className="list-group mt-3">
//         {users
//           .filter((user) => user._id !== loggedInUserId)
//           .map((user) => (
//             <li
//               key={user._id}
//               className="list-group-item d-flex justify-content-between align-items-center"
//             >
//               <div>
//                 <strong>@{user.username}</strong>
//               </div>
//               <button
//                 className="btn btn-sm btn-outline-primary"
//                 onClick={() => handleFollow(user._id)}
//                 disabled={followed[user._id]}
//               >
//                 {followed[user._id] ? "Following" : "Follow"}
//               </button>
//             </li>
//           ))}
//       </ul>
//     </div>
//   );
// };

// export default UserList;



// import React, { useEffect, useState, useContext } from "react";
// import axios from "axios";
// import { AuthContext } from "../context/AuthContext";

// const UserList = () => {
//   const { token } = useContext(AuthContext);
//   const [users, setUsers] = useState([]);
//   const [followed, setFollowed] = useState({});
//   const [error, setError] = useState(null);

//   const loggedInUsername = localStorage.getItem("username");

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const res = await axios.get(
//           `${process.env.REACT_APP_API_URL}/api/users`,
//           {
//             headers: {
//               "ngrok-skip-browser-warning": "true",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         setUsers(res.data);
//       } catch (err) {
//         setError("Failed to load users.");
//       }
//     };
//     fetchUsers();
//   }, [token]);

//   const handleFollow = async (username) => {
//     try {
//       await axios.post(
//         `${process.env.REACT_APP_API_URL}/api/users/${username}/follow`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "ngrok-skip-browser-warning": "true",
//           },
//         }
//       );
//       setFollowed({ ...followed, [username]: true });
//     } catch (err) {
//       console.error("Follow failed", err);
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h3>All Local Users</h3>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <ul className="list-group mt-3">
//         {users
//           .filter((user) => user.username !== loggedInUsername)
//           .map((user) => (
//             <li
//               key={user._id}
//               className="list-group-item d-flex justify-content-between align-items-center"
//             >
//               <div>
//                 <strong>@{user.username}</strong>
//               </div>
//               <button
//                 className="btn btn-sm btn-outline-primary"
//                 onClick={() => handleFollow(user.username)}
//                 disabled={followed[user.username]}
//               >
//                 {followed[user.username] ? "Following" : "Follow"}
//               </button>
//             </li>
//           ))}
//       </ul>
//     </div>
//   );
// };

// export default UserList;
