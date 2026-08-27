'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, CheckCircle2, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredNotice, setRegisteredNotice] = useState(false);

  const [isSandboxNotice, setIsSandboxNotice] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isSuccess = params.get('payment') === 'success' || params.get('registered') === 'true';
      const isSb = params.get('sandbox') === 'true' || process.env.NEXT_PUBLIC_BLUEPRINT_PAYMENTS_TEST === 'true';
      const pId = params.get('payment_id') || params.get('session_id');
      const emailParam = params.get('email');

      if (isSuccess) {
        setRegisteredNotice(true);
        setPaymentSuccess(true);
      }
      if (isSb) {
        setIsSandboxNotice(true);
      }
      if (pId) {
        setPaymentId(pId);
      }
      if (emailParam) {
        setEmail(emailParam);
      }

      if (isSuccess && emailParam) {
        fetch('/api/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailParam,
            paymentId: pId,
            sandbox: isSb
          })
        }).catch(console.error);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          paymentId,
          paymentSuccess,
          sandbox: isSandboxNotice
        }),
      });

      const data = await res.json();
      if (data.status === 'success' && data.user) {
        localStorage.setItem('lms_user', JSON.stringify(data.user));
        router.push('/');
      } else {
        setError(data.message || 'Invalid email or password.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f8fafc] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans selection:bg-[#00f076] selection:text-black">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,240,118,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 font-mono">
            <span className="text-[#00f076]">●</span>
            <span>STUDENT LEARNING PORTAL</span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white tracking-tight">
            The BPO Blueprint
          </h1>
          <p className="text-xs text-slate-400">
            Sign the client. Outsource delivery. Keep the margin.
          </p>

          {isSandboxNotice && (
            <div className="mt-2 inline-block px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-semibold uppercase tracking-wider">
              ⚡ Sandbox Test Mode
            </div>
          )}
        </div>

        {registeredNotice && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#00f076] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-200 leading-relaxed">
              <strong className="font-semibold block text-[#00f076] mb-0.5">Payment Confirmed!</strong>
              Your lifetime access is active. Enter your password below to access the course dashboard.
            </div>
          </div>
        )}

        {/* Card */}
        <div className="card-premium p-6 md:p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#07080c] border border-white/[0.08] focus:border-[#00f076]/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#07080c] border border-white/[0.08] focus:border-[#00f076]/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3 !text-sm mt-2 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Access Dashboard"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="text-center flex items-center justify-center gap-4 text-xs font-mono text-slate-500">
          <Link href="/terms" className="hover:text-slate-300 transition">Terms of Service</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-slate-300 transition">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
