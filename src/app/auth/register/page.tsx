'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, UserCircle, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { loginSuccess } from '@/store/authSlice';

const SignupPage = () => {
  const router = require('next/navigation').useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'freelancer',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("khalid");
    setLoading(true);
    setError('');
    setSuccess('');
  fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Registration failed');
        }
        return res.json();
      })
      .then(async () => {
        setSuccess('Registration successful! Logging you in...');
        // Auto-login after registration
        try {
          const loginRes = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: form.email, password: form.password }),
          });
          if (!loginRes.ok) throw new Error('Auto-login failed');
          const loginData = await loginRes.json();
          localStorage.setItem('accessToken', loginData.accessToken);
          localStorage.setItem('refreshToken', loginData.refreshToken);
          dispatch(loginSuccess({
            user: loginData.user,
            accessToken: loginData.accessToken,
            refreshToken: loginData.refreshToken,
          }));
          setForm({ name: '', email: '', password: '', role: 'freelancer' });
          router.push('/dashboard');
        } catch (err) {
          setError('Registration succeeded but auto-login failed. Please login manually.');
          setTimeout(() => {
            router.push('/auth/login');
          }, 2000);
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <Link href="/" className="flex items-center mb-6 text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Link>
        <h2 className="text-2xl font-bold mb-2 text-center">Create an Account</h2>
        <p className="text-gray-500 mb-6 text-center">Sign up to start your freelance journey!</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="text-red-500 text-center mb-2">{error}</div>}
          {success && <div className="text-green-600 text-center mb-2">{success}</div>}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Name</label>
            <div className="relative">
              <Input
                name="name"
                type="text"
                placeholder="Your Name"
                value={form.name}
                onChange={handleChange}
                className="pl-10"
                required
              />
              <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <div className="relative">
              <Input
                name="email"
                type="email"
                placeholder="you@email.com"
                value={form.email}
                onChange={handleChange}
                className="pl-10"
                required
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Password</label>
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="pl-10 pr-10"
                required
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 focus:outline-none"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Role</label>
            <div className="flex space-x-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="freelancer"
                  checked={form.role === 'freelancer'}
                  onChange={handleChange}
                  className="accent-blue-600"
                />
                Freelancer
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="client"
                  checked={form.role === 'client'}
                  onChange={handleChange}
                  className="accent-green-600"
                />
                Client
              </label>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold py-2 rounded-full shadow-md hover:from-green-500 hover:to-blue-600 transition-all duration-200"
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
