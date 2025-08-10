// src/pages/AuthPage.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';

interface Props {
  onLoginSuccess: () => void;
}

interface FormState {
  email: string;
  password: string;
}

const AuthPage: React.FC<Props> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState<FormState>({ email: '', password: '' });
  const [message, setMessage] = useState('');
const api = process.env.REACT_APP_BACKEND

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    const url = isLogin
      ? `${api}/auth/login`
      : `${api}/auth/register`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.access_token || 'dummy'); // lưu token nếu có
        setMessage(isLogin ? 'Login successful!' : 'Register successful!');
        onLoginSuccess();
      } else {
        setMessage(data.message || 'Something went wrong');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 to-indigo-300 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
          {isLogin ? 'Login' : 'Register'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg font-semibold"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <button
          className="w-full mt-4 text-sm text-indigo-700 hover:underline"
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage('');
          }}
        >
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </button>
        {message && <div className="mt-4 text-center text-sm text-red-500">{message}</div>}
      </div>
    </div>
  );
};

export default AuthPage;
