import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import gsap from 'gsap';

function LoginAnimated({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Refs for GSAP animations
  const loginBoxRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const buttonRef = useRef(null);
  const errorRef = useRef(null);

  useEffect(() => {
    console.log('LoginAnimated component mounted');
    
    // Ensure elements are visible first
    if (loginBoxRef.current) {
      gsap.set(loginBoxRef.current, { opacity: 1, scale: 1 });
    }
    if (titleRef.current) {
      gsap.set(titleRef.current, { opacity: 1, y: 0 });
    }
    if (subtitleRef.current) {
      gsap.set(subtitleRef.current, { opacity: 1, y: 0 });
    }
    if (emailRef.current) {
      gsap.set(emailRef.current, { opacity: 1, y: 0 });
    }
    if (passwordRef.current) {
      gsap.set(passwordRef.current, { opacity: 1, y: 0 });
    }
    if (buttonRef.current) {
      gsap.set(buttonRef.current, { opacity: 1, y: 0 });
    }
    
    // Simple fade in animation
    gsap.from(loginBoxRef.current, {
      scale: 0.95,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
      delay: 0.1
    });
  }, []);

  useEffect(() => {
    if (error && errorRef.current) {
      gsap.from(errorRef.current, {
        x: -10,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Button loading animation
    gsap.to(buttonRef.current, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });

    try {
      const response = await api.post('/login', {
        email,
        password
      });

      if (response.data && response.data.user) {
        // Success animation
        gsap.to(loginBoxRef.current, {
          scale: 1.05,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.in',
          onComplete: () => onLogin(response.data.user, response.data.token)
        });
      } else {
        setError('Login gagal. Silakan coba lagi.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Email atau password salah');
      setLoading(false);
      
      // Shake animation on error
      gsap.to(loginBoxRef.current, {
        x: [-10, 10, -10, 10, 0],
        duration: 0.4,
        ease: 'power2.out'
      });
    }
  };

  const handleInputFocus = (ref) => {
    gsap.to(ref.current, {
      scale: 1.02,
      duration: 0.2,
      ease: 'power2.out'
    });
  };

  const handleInputBlur = (ref) => {
    gsap.to(ref.current, {
      scale: 1,
      duration: 0.2,
      ease: 'power2.out'
    });
  };

  return (
    <div className="login-container">
      <div className="login-box" ref={loginBoxRef}>
        <h1 ref={titleRef}>Inventaris Gudang</h1>
        <p ref={subtitleRef}>Masuk ke akun Anda</p>

        {error && (
          <div className="error-message" ref={errorRef}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" ref={emailRef}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => handleInputFocus(emailRef)}
              onBlur={() => handleInputBlur(emailRef)}
              placeholder="nama@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group" ref={passwordRef}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => handleInputFocus(passwordRef)}
              onBlur={() => handleInputBlur(passwordRef)}
              placeholder="Masukkan password"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            ref={buttonRef}
            onMouseEnter={() => {
              if (!loading) {
                gsap.to(buttonRef.current, {
                  scale: 1.05,
                  duration: 0.2,
                  ease: 'power2.out'
                });
              }
            }}
            onMouseLeave={() => {
              gsap.to(buttonRef.current, {
                scale: 1,
                duration: 0.2,
                ease: 'power2.out'
              });
            }}
          >
            {loading ? (
              <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                <span className="spinner"></span>
                Memproses...
              </span>
            ) : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginAnimated;
