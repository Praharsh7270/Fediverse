import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';

function RegisterPage() {
  const [form, setForm] = useState({ username: '', password: '', displayName: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/register', form);
      alert('Registered successfully!');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="w-50">
        <div className="mb-3">
          <label>Username</label>
          <input className="form-control"
            onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </div>
        <div className="mb-3">
          <label>Display Name</label>
          <input className="form-control"
            onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input type="password" className="form-control"
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <button className="btn btn-success">Register</button>
      </form>
    </div>
  );
}

export default RegisterPage;
