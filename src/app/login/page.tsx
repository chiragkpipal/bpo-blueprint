'use client';

import React, { useState, useEffect } from 'react';
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

      // Proactively confirm and activate access in background if returning from payment
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
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Matrix/Glow Styling */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,102,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="font-black text-3xl md:text-4xl text-white tracking-tight">
            BPO<span className="text-[#d4af37]">.</span>BLUEPRINT
          </h1>
          {isSandboxNotice && (
            <div className="mt-2 inline-block px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
              ⚡ Sandbox / Test Mode
            </div>
          )}
        </div>

        {registeredNotice && (
          <div className="mb-6 p-4 rounded-xl bg-[#00ff66]/10 border border-[#00ff66]/30 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#00ff66] shrink-0 mt-0.5" />
            <div className="text-xs text-[#00ff66]">
              <strong className="font-bold block">Payment Confirmed!</strong>
              Your access to The BPO Blueprint is active. Enter your details below to log in.
            </div>
          </div>
        )}

        {/* Card */}
        <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/40">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 focus:border-[#00ff66] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/40">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 focus:border-[#00ff66] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00ff66] text-black font-extrabold py-3.5 rounded-xl hover:bg-[#00ff66]/90 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? "Authenticating..." : "Access Dashboard"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
