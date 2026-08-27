import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — The BPO Blueprint',
  description: 'Privacy policy for The BPO Blueprint LMS under POPIA.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#00ff66] selection:text-black">
      <div className="mx-auto max-w-4xl px-5 py-16 md:py-24">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#00ff66] hover:underline mb-8"
        >
          ← Back to Login
        </Link>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
          Privacy <span className="text-[#d4af37]">Policy</span>
        </h1>
        <p className="mt-2 font-mono text-xs text-white/50">SourceOasis LTD · Effective Date: 1 July 2025</p>

        <div className="mt-10 space-y-8 text-white/80 leading-relaxed text-sm md:text-base">
          <section className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <h2 className="text-xl font-bold text-white mb-3">1. Privacy & POPIA Compliance</h2>
            <p>
              SourceOasis LTD is committed to protecting your personal data in accordance with the Protection of Personal Information Act, 4 of 2013 ("POPIA") of South Africa. We collect and store your contact details strictly to manage your course progress, authentication, and communication.
            </p>
          </section>

          <section className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <h2 className="text-xl font-bold text-white mb-3">2. Contact Details</h2>
            <p>
              SourceOasis LTD, Cape Town, South Africa —{' '}
              <a href="mailto:admin@bpoaccelerator.ai" className="text-[#00ff66] hover:underline">
                admin@bpoaccelerator.ai
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
