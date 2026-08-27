'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, CheckCircle2, Shield, Zap } from 'lucide-react';

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
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-[#00ff66] selection:text-black">
      {/* Background Matrix/Glow Ambient Light */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,102,0.12)_0%,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-[#00ff66] tracking-widest uppercase">
            <span>[◉]</span>
            <span>STUDENT LEARNING PORTAL</span>
          </div>
          <h1 className="font-display font-black text-3xl md:text-4xl text-white tracking-tight">
            BPO<span className="text-[#d4af37]">.</span>BLUEPRINT
          </h1>
          <p className="text-xs text-white/50 font-mono">
            Sign the client. Outsource delivery. Keep the margin.
          </p>

          {isSandboxNotice && (
            <div className="mt-2 inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
              ⚡ Sandbox / Test Mode
            </div>
          )}
        </div>

        {registeredNotice && (
          <div className="p-4 rounded-xl bg-[#00ff66]/10 border border-[#00ff66]/40 flex items-start gap-3 shadow-[0_0_30px_rgba(0,255,102,0.15)]">
            <CheckCircle2 className="w-5 h-5 text-[#00ff66] shrink-0 mt-0.5" />
            <div className="text-xs text-[#00ff66] leading-relaxed">
              <strong className="font-bold block uppercase tracking-wider mb-0.5">Payment Confirmed!</strong>
              Your lifetime access to The BPO Blueprint is active. Enter your details below to enter the dashboard.
            </div>
          </div>
        )}

        {/* Card */}
        <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.9)] space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/40">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 focus:border-[#00ff66] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/40">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 focus:border-[#00ff66] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full !py-3.5 !text-xs mt-2 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Access Dashboard"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="text-center flex items-center justify-center gap-4 text-xs font-mono text-white/40">
          <Link href="/terms" className="hover:text-[#00ff66] transition">Terms of Service</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-[#00ff66] transition">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
