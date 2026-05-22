'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Lock, Mail, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) router.push('/admin');
        });
    }, [router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

        if (authError) {
            setError('Access Denied: Invalid credentials');
            setIsSubmitting(false);
            setTimeout(() => setError(''), 4000);
        } else {
            router.push('/admin');
        }
    };

    return (
        <div className="login-wrapper">
            <div className="bg-decoration">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
            </div>

            <div className="login-card glass-login">
                <div className="login-header">
                    <div className="auth-badge">
                        <ShieldCheck size={20} /> Admin Access
                    </div>
                    <h2>Parkline<span>Shipping</span></h2>
                    <p>Enter your credentials to access the management portal</p>
                </div>

                {error && (
                    <div className="error-alert">
                        <div className="error-pulse"></div>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-field">
                        <label htmlFor="loginEmail">Email</label>
                        <div className="input-wrapper">
                            <Mail size={18} className="field-icon" />
                            <input
                                type="email"
                                id="loginEmail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>
                    
                    <div className="input-field">
                        <label htmlFor="loginPassword">Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="field-icon" />
                            <input 
                                type="password" 
                                id="loginPassword" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••" 
                                required 
                                autoComplete="current-password" 
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={isSubmitting} className={`login-submit ${isSubmitting ? 'loading' : ''}`}>
                        {isSubmitting ? 'Authenticating...' : 'Sign Into Portal'}
                        {!isSubmitting && <ArrowRight size={18} />}
                    </button>
                </form>

                <div className="login-nav">
                    <Link href="/" className="back-link">
                        <ArrowLeft size={14} /> Return to Public Site
                    </Link>
                </div>
            </div>

            <style jsx>{`
                .login-wrapper {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #0a0a0b;
                    padding: 20px;
                    position: relative;
                    overflow: hidden;
                }
                .bg-decoration {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }
                .blob {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.15;
                }
                .blob-1 {
                    width: 400px;
                    height: 400px;
                    background: var(--accent);
                    top: -100px;
                    right: -100px;
                }
                .blob-2 {
                    width: 300px;
                    height: 300px;
                    background: #3b82f6;
                    bottom: -50px;
                    left: -50px;
                }
                .glass-login {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 24px;
                    width: 100%;
                    max-width: 440px;
                    padding: 40px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    z-index: 10;
                }
                .login-header {
                    text-align: center;
                    margin-bottom: 35px;
                }
                .auth-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255, 90, 0, 0.1);
                    color: var(--accent);
                    padding: 6px 14px;
                    border-radius: 30px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 20px;
                }
                .login-header h2 {
                    font-size: 2rem;
                    font-weight: 800;
                    margin: 0 0 10px 0;
                    color: #fff;
                }
                .login-header h2 span { color: var(--accent); }
                .login-header p {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 0.95rem;
                    line-height: 1.5;
                }
                .error-alert {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #fca5a5;
                    padding: 14px;
                    border-radius: 12px;
                    font-size: 0.88rem;
                    margin-bottom: 25px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .error-pulse {
                    width: 8px;
                    height: 8px;
                    background: #ef4444;
                    border-radius: 50%;
                    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
                .input-field {
                    margin-bottom: 20px;
                }
                .input-field label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 8px;
                }
                .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .field-icon {
                    position: absolute;
                    left: 16px;
                    color: rgba(255, 255, 255, 0.3);
                    transition: color 0.3s;
                }
                .input-wrapper input {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 14px 16px 14px 48px;
                    border-radius: 12px;
                    color: #fff;
                    font-size: 1rem;
                    transition: all 0.3s;
                }
                .input-wrapper input:focus {
                    background: rgba(255, 255, 255, 0.06);
                    border-color: var(--accent);
                    outline: none;
                    box-shadow: 0 0 0 4px rgba(255, 90, 0, 0.1);
                }
                .input-wrapper input:focus + .field-icon {
                    color: var(--accent);
                }
                .login-submit {
                    width: 100%;
                    background: var(--accent);
                    color: #fff;
                    border: none;
                    padding: 16px;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s;
                    margin-top: 10px;
                }
                .login-submit:hover:not(.loading) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px -5px rgba(255, 90, 0, 0.4);
                }
                .login-submit:active { transform: translateY(0); }
                .login-submit.loading {
                    opacity: 0.7;
                    cursor: wait;
                }
                .login-nav {
                    margin-top: 30px;
                    text-align: center;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    padding-top: 25px;
                }
                .back-link {
                    color: rgba(255, 255, 255, 0.4);
                    text-decoration: none;
                    font-size: 0.88rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: color 0.3s;
                }
                .back-link:hover { color: #fff; }
            `}</style>
        </div>
    );
}
