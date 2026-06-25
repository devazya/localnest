import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const INPUT_STYLE = {
  width: '100%',
  padding: '11px 14px',
  background: 'rgba(255,255,255,0.9)',
  border: '1.5px solid rgba(109,74,255,0.15)',
  borderRadius: 11,
  fontSize: 14,
  color: 'var(--text-primary)',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
  fontFamily: 'inherit',
};

const BTN_PRIMARY = {
  width: '100%',
  padding: '12px',
  background: 'var(--primary)',
  color: '#fff',
  border: 'none',
  borderRadius: 11,
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: '0 4px 14px rgba(109,74,255,0.28)',
  fontFamily: 'inherit',
};

const GOOGLE_BTN = {
  width: '100%',
  padding: '11px',
  background: '#fff',
  color: '#1a1a1a',
  border: '1.5px solid rgba(0,0,0,0.12)',
  borderRadius: 11,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  fontFamily: 'inherit',
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(109,74,255,0.1)' }} />
      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>or</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(109,74,255,0.1)' }} />
    </div>
  );
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }) {
  const [mode, setMode] = useState(defaultMode); // 'login' | 'signup' | 'forgot'
  const [form, setForm] = useState({ email: '', password: '', fullName: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    setError('');
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) return setError('Please fill in all fields.');
    setLoading(true);
    const { error } = await signIn(form.email, form.password);
    setLoading(false);
    if (error) return setError(error.message);
    onClose();
  };

  const handleSignUp = async () => {
    if (!form.email || !form.password || !form.fullName) return setError('Please fill in all fields.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.fullName);
    setLoading(false);
    if (error) return setError(error.message);
    setSuccess('Account created! Please check your email to verify your account.');
  };

  const handleForgot = async () => {
    if (!form.email) return setError('Please enter your email address.');
    setLoading(true);
    const { error } = await resetPassword(form.email);
    setLoading(false);
    if (error) return setError(error.message);
    setSuccess('Password reset link sent! Check your email.');
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    setLoading(false);
    if (error) setError(error.message);
  };

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setSuccess('');
    setForm({ email: '', password: '', fullName: '', confirmPassword: '' });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(15,10,30,0.55)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'rgba(252,250,255,0.97)',
            border: '1.5px solid rgba(109,74,255,0.12)',
            borderRadius: 22,
            padding: '32px 28px',
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 24px 64px rgba(109,74,255,0.18)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1L14 6V14H10V10H6V14H2V6L8 1Z" fill="#fff" />
                  </svg>
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--text-primary)' }}>
                  Local<span style={{ color: 'var(--primary)' }}>Nest</span>
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                {mode === 'login' && 'Welcome back'}
                {mode === 'signup' && 'Create account'}
                {mode === 'forgot' && 'Reset password'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
                {mode === 'login' && 'Sign in to your LocalNest account'}
                {mode === 'signup' && 'Join your local community'}
                {mode === 'forgot' && "We'll send you a reset link"}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'rgba(109,74,255,0.07)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >✕</button>
          </div>

          {/* Success */}
          {success && (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13.5, color: '#059669', lineHeight: 1.5 }}>
              ✅ {success}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13.5, color: '#DC2626', lineHeight: 1.5 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mode === 'signup' && (
              <input
                style={INPUT_STYLE}
                placeholder="Full name"
                value={form.fullName}
                onChange={set('fullName')}
                onFocus={e => e.target.style.borderColor = 'rgba(109,74,255,0.45)'}
                onBlur={e => e.target.style.borderColor = 'rgba(109,74,255,0.15)'}
              />
            )}

            <input
              style={INPUT_STYLE}
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={set('email')}
              onFocus={e => e.target.style.borderColor = 'rgba(109,74,255,0.45)'}
              onBlur={e => e.target.style.borderColor = 'rgba(109,74,255,0.15)'}
            />

            {mode !== 'forgot' && (
              <input
                style={INPUT_STYLE}
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={set('password')}
                onFocus={e => e.target.style.borderColor = 'rgba(109,74,255,0.45)'}
                onBlur={e => e.target.style.borderColor = 'rgba(109,74,255,0.15)'}
                onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignUp())}
              />
            )}

            {mode === 'signup' && (
              <input
                style={INPUT_STYLE}
                type="password"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                onFocus={e => e.target.style.borderColor = 'rgba(109,74,255,0.45)'}
                onBlur={e => e.target.style.borderColor = 'rgba(109,74,255,0.15)'}
                onKeyDown={e => e.key === 'Enter' && handleSignUp()}
              />
            )}

            {mode === 'login' && (
              <div style={{ textAlign: 'right', marginTop: -4 }}>
                <button onClick={() => switchMode('forgot')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12.5, fontWeight: 500, cursor: 'pointer', padding: 0 }}>
                  Forgot password?
                </button>
              </div>
            )}

            <button
              style={{ ...BTN_PRIMARY, opacity: loading ? 0.7 : 1 }}
              onClick={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignUp : handleForgot}
              disabled={loading}
              onMouseEnter={e => !loading && (e.target.style.background = '#5B38E8')}
              onMouseLeave={e => (e.target.style.background = 'var(--primary)')}
            >
              {loading ? '...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>

            {mode !== 'forgot' && (
              <>
                <Divider />
                <button
                  style={{ ...GOOGLE_BTN, opacity: loading ? 0.7 : 1 }}
                  onClick={handleGoogle}
                  disabled={loading}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8f8f8'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
              </>
            )}
          </div>

          {/* Footer switch */}
          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13.5, color: 'var(--text-muted)' }}>
            {mode === 'login' && (
              <>Don't have an account?{' '}
                <button onClick={() => switchMode('signup')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: 13.5, padding: 0 }}>Sign up</button>
              </>
            )}
            {mode === 'signup' && (
              <>Already have an account?{' '}
                <button onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: 13.5, padding: 0 }}>Sign in</button>
              </>
            )}
            {mode === 'forgot' && (
              <>
                <button onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: 13.5, padding: 0 }}>← Back to sign in</button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
