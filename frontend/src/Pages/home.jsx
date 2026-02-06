




import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import React from "react";
import "./Feed.css";

const Home = () => {
  return (
    <div className="feed-container" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* Title */}
      <div className="feed-text-wrapper text-center py-4 bg-dark bg-opacity-50 rounded-5 ">
        <h1 className='text-white' style={{ fontFamily: "'Segoe UI Black', sans-serif", marginBottom: "10px" }}>
          🌐 Welcome to <span style={{ color: "#ffe066" }}>Fediverse</span>
        </h1>
        <p style={{ fontSize: "18px", color: "#ffff", maxWidth: "700px", margin: "0 auto" }}>
          Connect, share, and explore across the decentralized web — powered by freedom, community, and collaboration.
        </p>
      </div>

      {/* Carousel */}
      <div
        id="carouselExampleCaptions"
        className="carousel slide shadow-lg"
        data-bs-ride="carousel"
        data-bs-interval="3500"
        style={{ height: "100vh" }} // Full viewport height
      >
        {/* Indicators */}
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" className="active"></button>
          <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1"></button>
          <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="2"></button>
        </div>

        {/* Slides */}
        <div className="carousel-inner" style={{ height: "100%",width:"100%" }}>
          
          {/* Slide 1 */}
          <div className="carousel-item active" style={{ height: "100%",width:"100%" }}>
            <img
              src="https://img10.hotstar.com/image/upload/f_auto,q_auto/sources/r1/cms/prod/983/1120983-i-633ec2bcc241"
              className="d-block w-100"
              style={{ height: "100%", objectFit: "cover" }}
              alt="Community"
            />
            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded p-3">
              <h5>Join the Global Community</h5>
              <p>Connect with people across a network without borders.</p>
            </div>
          </div>

          {/* Slide 2 */}
          <div className="carousel-item" style={{ height: "100%", width:"100%" }}>
            <img
              src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d"
              className="d-block w-100"
              style={{ height: "100%", objectFit: "cover" }}
              alt="Technology"
            />
            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded p-3">
              <h5>Open Technology</h5>
              <p>Built on freedom, collaboration, and transparency.</p>
            </div>
          </div>

          {/* Slide 3 */}
          <div className="carousel-item" style={{ height: "100%",width:"100%" }}>
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
              className="d-block w-100"
              style={{ height: "100%", objectFit: "cover" }}
              alt="Innovation"
            />
            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded p-3">
              <h5>Innovate Together</h5>
              <p>Shaping the future of the decentralized internet.</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
          <span className="carousel-control-prev-icon"></span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>
    </div>
  );
};

export default Home;
