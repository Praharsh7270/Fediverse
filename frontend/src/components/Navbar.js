




// import React from "react";
// import { Link, useNavigate } from "react-router-dom";

// function Navbar() {
//   const navigate = useNavigate();
//   const isLoggedIn = !!localStorage.getItem("token");
//   const username = localStorage.getItem("username");

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("username");
//     navigate("/login");
//   };

//   return (
//     <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
//       <Link className="navbar-brand" to="/">Photoflux</Link>

//       <div className="collapse navbar-collapse">
//         <ul className="navbar-nav me-auto mb-2 mb-lg-0">
//           {isLoggedIn && (
//             <>
//               <li className="nav-item">
//                 <Link className="nav-link" to="/">Home</Link>
//               </li>
//                <li className="nav-item">
//                 <Link className="nav-link" to="/feed">Feed</Link>
//               </li>
//               <li className="nav-item">
//                 <Link className="nav-link" to="/post">Post</Link>
//               </li>
//               {/* <li className="nav-item">
//                 <Link className="nav-link" to="/users">Users</Link>
//               </li> */}
//               {/* <li className="nav-item">
//                 <Link className="nav-link" to="/remote-follow">Remote Follow</Link>
//               </li> */}
//               <li className="nav-item">
//                 <Link className="nav-link" to={`/followers/${username}`}>profile</Link>
//               </li>
//               <li className="nav-item">
//                 <Link className="nav-link" to="/remote-search">Remote Search</Link>
//               </li>
//               <li className="nav-item">
//                 <Link className="nav-link" to="/local-users">Local Users</Link>
//               </li>
//               <li className="nav-item">
//                 <Link className="nav-link" to={`/users/${username}/outbox`}>My Outbox</Link>
//               </li>
//               {/* <li className="nav-item">
//                 <Link className="nav-link" to={`/image`}>imaga</Link>
//               </li> */}
//             </>
//           )}
//         </ul>
//         {isLoggedIn ? (
//           <button onClick={handleLogout} className="btn btn-outline-light">Logout</button>
//         ) : (
//           <>
//             <Link className="btn btn-outline-light me-2" to="/login">Login</Link>
//             <Link className="btn btn-outline-success" to="/signup">Sign Up</Link>
//           </>
//         )}
//       </div>
//     </nav>
//   );
// }

// export default Navbar;

import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar fixed-top shadow-sm">
      <div className="container-fluid px-3">
        {/* Brand */}
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
          <span style={{ fontSize: "1.3rem" }}>📸</span>
          <span className="ms-2">Photoflux</span>
        </Link>

        {/* Toggle button (IMPORTANT for mobile) */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar content */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {isLoggedIn && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/">Home</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/feed">Feed</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/post">Post</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to={`/profile/${username}`}>
                    Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/remote-search">
                    Remote Search
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/local-users">
                    Local Users
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to={`/users/${username}/outbox`}>
                    My Outbox
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Auth actions */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="btn btn-outline-light"
            >
              Logout
            </button>
          ) : (
            <div className="d-flex auth-buttons gap-3">
              <Link className="btn btn-login" to="/login">
                Login
              </Link>

              <Link className="btn btn-signup" to="/signup">
                Sign Up
              </Link>
            </div>

          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;


