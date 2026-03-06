import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Lock } from 'lucide-react';

export default function VerifyEmail({ setCurrentUser }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  const type = searchParams.get('type'); // 'guest' or 'standard'

  const [status, setStatus] = useState(type === 'guest' ? 'waiting_input' : 'verifying'); 
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Automatic Verification for Standard Users
  useEffect(() => {
    if (type !== 'guest' && token) {
      handleVerify();
    }
  }, [token, type]);

  // 2. The Verification Logic (Used by both flows)
  const handleVerify = async (passwordInput = null) => {
    if (!token) return setStatus('error');
    
    setIsSubmitting(true);
    try {
      const response = await fetch('https://bid-versus-backend.onrender.com/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          password: passwordInput // Send password if user provided one
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('bidVersusToken', data.token);
        setCurrentUser(data.user);
        setStatus('success');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
    setIsSubmitting(false);
  };

  // 3. Handle Guest Password Form Submit
  const handleGuestSubmit = (e) => {
    e.preventDefault();
    if (password.length < 6) return alert("Password must be at least 6 characters");
    handleVerify(password);
  };

  return (
    <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="card" style={{ textAlign: 'center', padding: '2rem', maxWidth: '400px', width: '100%' }}>
        
        {/* STATE: WAITING FOR GUEST INPUT */}
        {status === 'waiting_input' && (
          <form onSubmit={handleGuestSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <Lock className="w-12 h-12" style={{ margin: '0 auto 1rem auto', color: 'var(--brand-blue)' }} />
              <h2>Set Your Password</h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Your account is almost ready! Please create a password to secure your account.
              </p>
            </div>
            
            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>New Password</label>
              <input 
                type="password" 
                required 
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="******"
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="btn-primary" 
              style={{ width: '100%' }}
            >
              {isSubmitting ? 'Setting Password...' : 'Save & Verify'}
            </button>
          </form>
        )}

        {/* STATE: AUTOMATIC LOADING */}
        {status === 'verifying' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin" style={{ margin: '0 auto 1rem auto', color: 'var(--brand-blue)' }} />
            <h2>Verifying...</h2>
          </>
        )}

        {/* STATE: SUCCESS */}
        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12" style={{ margin: '0 auto 1rem auto', color: 'var(--brand-green)' }} />
            <h2>You're All Set!</h2>
            <p style={{ color: 'var(--text-muted)' }}>Password saved. Logging you in...</p>
          </>
        )}

        {/* STATE: ERROR */}
        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12" style={{ margin: '0 auto 1rem auto', color: '#f87171' }} />
            <h2>Link Invalid</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>This link has expired or was already used.</p>
            <button onClick={() => navigate('/auth')} className="btn-primary" style={{ width: '100%' }}>
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}