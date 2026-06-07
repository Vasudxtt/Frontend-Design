import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { login } from '../api/auth';

const schema = z.object({
  username: z.string().min(1, 'User ID is required'),
  password: z.string().min(1, 'Password is required'),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const DEMO_CREDENTIALS = { username: 'vedant-admin', password: 'vedant123' };

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await login(values.username, values.password);
      localStorage.setItem('token', res.token);
      setAuth(res.token, res.user);
      navigate('/dashboard');
    } catch {
      // Fallback: accept known demo credentials when API is unavailable
      if (
        values.username === DEMO_CREDENTIALS.username &&
        values.password === DEMO_CREDENTIALS.password
      ) {
        const fakeToken = `demo-token-${Date.now()}`;
        const fakeUser = { id: '1', username: values.username, name: 'Alex Wando', role: 'Admin' };
        localStorage.setItem('token', fakeToken);
        setAuth(fakeToken, fakeUser);
        navigate('/dashboard');
      } else {
        toast.error('Invalid credentials. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left illustration panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-100 items-center justify-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-12 left-12 w-3 h-3 border-2 border-indigo-300 rounded-full opacity-60" />
        <div className="absolute top-1/3 left-8 text-indigo-200 text-2xl font-light">+</div>
        <div className="absolute bottom-1/3 right-16 text-indigo-200 text-xl font-light">+</div>
        <div className="absolute top-1/2 right-1/4 w-4 h-4 border border-indigo-300 rounded-full opacity-40" />

        {/* Character illustration */}
        <svg width="300" height="300" viewBox="0 0 300 300" fill="none" className="z-10">
          {/* Desk */}
          <rect x="50" y="200" width="200" height="8" rx="4" fill="#4B5563" />
          <rect x="60" y="208" width="12" height="60" rx="3" fill="#6B7280" />
          <rect x="228" y="208" width="12" height="60" rx="3" fill="#6B7280" />

          {/* Laptop body */}
          <rect x="90" y="140" width="120" height="75" rx="6" fill="#E5E7EB" />
          <rect x="93" y="143" width="114" height="69" rx="4" fill="#F8FAFC" />
          {/* Screen lines */}
          <rect x="100" y="152" width="60" height="3" rx="1.5" fill="#D1D5DB" />
          <rect x="100" y="160" width="80" height="3" rx="1.5" fill="#D1D5DB" />
          <rect x="100" y="168" width="50" height="3" rx="1.5" fill="#D1D5DB" />
          <rect x="80" y="215" width="140" height="8" rx="4" fill="#D1D5DB" />

          {/* Character body - flask shape */}
          <ellipse cx="150" cy="120" rx="25" ry="30" fill="#BFDBFE" />
          <rect x="145" y="60" width="10" height="30" rx="5" fill="#93C5FD" />
          {/* Flask bottom */}
          <ellipse cx="150" cy="165" rx="35" ry="15" fill="#93C5FD" opacity="0.6" />
          {/* Flask cap */}
          <rect x="140" y="55" width="20" height="10" rx="3" fill="#60A5FA" />

          {/* Face */}
          <circle cx="144" cy="115" r="4" fill="#1E3A5F" />
          <circle cx="156" cy="115" r="4" fill="#1E3A5F" />
          <circle cx="145.5" cy="113.5" r="1.5" fill="white" />
          <circle cx="157.5" cy="113.5" r="1.5" fill="white" />

          {/* Arms */}
          <path d="M125 130 Q110 155 118 175" stroke="#93C5FD" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M175 130 Q190 155 182 175" stroke="#93C5FD" strokeWidth="8" strokeLinecap="round" fill="none" />

          {/* Hand on keyboard */}
          <ellipse cx="118" cy="178" rx="10" ry="6" fill="#BFDBFE" />
          <ellipse cx="182" cy="178" rx="10" ry="6" fill="#BFDBFE" />
        </svg>

        <div className="absolute bottom-16 text-center">
          <p className="text-indigo-400 text-sm font-medium">Smart Test Management</p>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10">
            <div className="mb-8">
              <Logo size="md" />
            </div>

            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Login</h1>
            <p className="text-sm text-gray-500 mb-8">Use your company provided Login credentials</p>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">User ID</label>
                <input
                  {...register('username')}
                  placeholder="Enter User ID"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-400 transition-all"
                />
                {errors.username && (
                  <p className="text-xs text-red-500">{errors.username.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter Password"
                    className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="text-right -mt-2">
                <button type="button" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Forgot password?
                </button>
              </div>

              <Button type="submit" size="lg" loading={isSubmitting} className="w-full rounded-xl mt-1">
                Login
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
