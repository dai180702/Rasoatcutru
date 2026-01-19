'use client';

import { useEffect, useRef, useState, FormEvent } from 'react';
import { signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { auth } from '../../lib/firebase';

interface LoginFormProps {
  onLoginSuccess: (user: User) => void;
  currentUser: User | null;
  variant?: 'inline' | 'card';
}

export default function LoginForm({ onLoginSuccess, currentUser, variant = 'card' }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false); // dùng cho variant inline
  const inlineRootRef = useRef<HTMLDivElement | null>(null);

  // Close popup when clicking outside or pressing Escape (inline variant only)
  useEffect(() => {
    if (variant !== 'inline') return;
    if (!showForm) return;

    const onMouseDown = (e: MouseEvent) => {
      const root = inlineRootRef.current;
      if (!root) return;
      if (e.target instanceof Node && !root.contains(e.target)) {
        setShowForm(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowForm(false);
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showForm, variant]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess(userCredential.user);
      setEmail('');
      setPassword('');
      setShowForm(false);
    } catch (error) {
      console.error('Login error:', error);
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code === 'auth/invalid-email') {
        setError('Email không hợp lệ.');
      } else if (firebaseError.code === 'auth/user-not-found') {
        setError('Tài khoản không tồn tại.');
      } else if (firebaseError.code === 'auth/wrong-password') {
        setError('Mật khẩu không đúng.');
      } else if (firebaseError.code === 'auth/invalid-credential') {
        setError('Email hoặc mật khẩu không đúng.');
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      alert('Đăng xuất thất bại. Vui lòng thử lại.');
    }
  };

  // Đã đăng nhập
  if (currentUser) {
    if (variant === 'inline') {
      return (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:inline">
            {currentUser.email}
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Đăng xuất
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Đã đăng nhập với:</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {currentUser.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập
  if (variant === 'inline') {
    return (
      <div ref={inlineRootRef} className="relative">
        {showForm && (
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20 p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">
              Đăng nhập
            </h2>
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label
                  htmlFor="email-inline"
                  className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email-inline"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                  placeholder="Nhập email"
                />
              </div>

              <div>
                <label
                  htmlFor="password-inline"
                  className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Mật khẩu
                </label>
                <input
                  type="password"
                  id="password-inline"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                  placeholder="Nhập mật khẩu"
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
                  <p className="text-xs text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  // Variant card (mặc định) - không dùng trong layout hiện tại nhưng giữ lại để tái sử dụng
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
        Đăng nhập để xem danh sách
      </h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Nhập email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mật khẩu <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Nhập mật khẩu"
          />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}

