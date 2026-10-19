import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Determine redirect target
  const fromLocation = (location.state as any)?.from?.pathname || '/admin';

  // If already logged in, redirect directly
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(fromLocation, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, fromLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your administrator email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your administrator password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(trimmedEmail, password);
      navigate(fromLocation, { replace: true });
    } catch (err: any) {
      console.error('[Admin Login Error]', err);
      const msg = err.message || 'Invalid email address or password.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F4EF] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-[#246B45] hover:opacity-90 transition-opacity"
          >
            <span className="w-9 h-9 rounded-lg bg-[#246B45] text-white flex items-center justify-center font-black text-lg">
              DF
            </span>
            <span>DIVINE FAVOUR</span>
          </Link>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#246B45]/10 text-[#246B45] text-xs font-semibold tracking-wide uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrative Control Portal</span>
          </div>
          <h2 className="mt-4 text-xl font-bold text-[#252A27]">
            Sign in to manage operations
          </h2>
          <p className="mt-1 text-xs text-[#252A27]/70">
            Authorized personnel only. Sessions are encrypted and audited.
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 bg-white py-8 px-6 shadow-xl shadow-[#252A27]/5 rounded-2xl border border-[#252A27]/10 sm:px-10">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 animate-fadeIn">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
              <div className="text-sm leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#252A27]"
              >
                Administrator Email
              </label>
              <div className="mt-1.5 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#252A27]/40">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@divinefavour.com"
                  className="block w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-[#252A27] placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#246B45] focus:border-transparent transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-[#252A27]"
              >
                Password
              </label>
              <div className="mt-1.5 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#252A27]/40">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-[#252A27] placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#246B45] focus:border-transparent transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-[#246B45] hover:bg-[#1b5235] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#246B45] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-100 flex items-center justify-between text-xs text-[#252A27]/60">
            <Link
              to="/"
              className="text-[#246B45] hover:underline font-medium inline-flex items-center gap-1"
            >
              ← Back to main website
            </Link>
            <span className="text-neutral-400">v1.0 • Secure Session</span>
          </div>
        </div>
      </div>
    </div>
  );
};
