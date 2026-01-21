

import React, { useState } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";

function PostForm() {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (file) => {
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !caption) return alert("Both caption and image are required!");

    const formData = new FormData();
    formData.append("image", image);
    formData.append("caption", caption);
    formData.append("username", localStorage.getItem("username"));

    try {
      await API.post("/api/posts/po", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "x-api-secret": process.env.REACT_APP_API_SECRET,
        },
      });
      alert("Post uploaded successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error while posting.");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", background: "#f0f2f5" }}
    >
      <div className="card p-4 shadow-lg" style={{ width: "100%", maxWidth: "500px" }}>
        <h2 className="text-center text-primary mb-4">
          <i className="bi bi-image-fill me-2"></i>Create a Post
        </h2>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Caption Input */}
          <div className="mb-3">
            <label className="form-label">📋 Caption</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              required
            />
          </div>

          {/* Custom Upload Box */}
          <div
            className="mb-3 text-center p-4 border border-2 border-secondary rounded"
            style={{
              borderStyle: "dashed",
              background: "#fafafa",
              cursor: "pointer",
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById("fileInput").click()}
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px" }}
              />
            ) : (
              <>
                <i className="bi bi-cloud-arrow-up fs-1 text-secondary"></i>
                <p className="mb-0">Choose a file or drag & drop it here</p>
                <small className="text-muted">JPEG, PNG, up to 50MB</small>
              </>
            )}
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleFileChange(e.target.files[0])}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="d-grid">
            <button type="submit" className="btn btn-success btn-lg">
              🚀 Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostForm;
