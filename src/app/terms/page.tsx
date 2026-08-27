import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — The BPO Blueprint',
  description: 'Terms and conditions governing access to The BPO Blueprint course materials and LMS.',
};

export default function TermsPage() {
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
          Terms of <span className="text-[#d4af37]">Service</span>
        </h1>
        <p className="mt-2 font-mono text-xs text-white/50">SourceOasis LTD · Effective Date: 1 July 2025</p>

        <div className="mt-10 space-y-8 text-white/80 leading-relaxed text-sm md:text-base">
          <section className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <h2 className="text-xl font-bold text-white mb-3">1. Access to Course Materials</h2>
            <p>
              Access to The BPO Blueprint LMS is granted solely to the registered individual student. You are strictly prohibited from sharing your login credentials, screen recording, or distributing any training videos or materials.
            </p>
          </section>

          {/* STRICT IP & COURSE PROTECTION CLAUSE */}
          <section className="p-6 rounded-xl bg-red-950/20 border border-red-500/40 text-white/90">
            <h2 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-2">
              <span>⚠️</span> 2. Intellectual Property, Anti-Piracy & Prohibition on Derivative Courses
            </h2>
            
            <h3 className="text-base font-bold text-white mt-4 mb-1">2.1 Exclusive Ownership</h3>
            <p>
              All course recordings, module videos, audio lessons, curriculum frameworks, templates, workflows, and proprietary materials remain the exclusive intellectual property of <strong>SourceOasis LTD</strong>.
            </p>

            <h3 className="text-base font-bold text-white mt-4 mb-1">2.2 Strict Prohibition on Copying, Sharing, Rewording & Reselling</h3>
            <p>
              Your access is personal and non-transferable. <strong>You are strictly prohibited from:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2 text-white/80">
              <li>
                <strong>Public or Private Sharing:</strong> Uploading, sharing, broadcasting, or leaking any course recordings or videos publicly or privately (including on YouTube, TikTok, Telegram, Discord, Google Drive, Mega, or social media).
              </li>
              <li>
                <strong>Creating Derivative or Reworded Content:</strong> Copying, summarizing, transcribing, or rewording the course curriculum or knowledge in your own words to create videos, publish content, or launch and sell competing courses, mentorships, or educational programs.
              </li>
              <li>
                <strong>Commercial Resale:</strong> Reselling, sublicensing, or packaging any proprietary frameworks learned from this program without prior written authorization from SourceOasis LTD.
              </li>
              <li>
                <strong>Account Sharing:</strong> Renting, selling, or loaning your login credentials.
              </li>
            </ul>

            <h3 className="text-base font-bold text-white mt-4 mb-1">2.3 Legal Enforcement Under South African Law & Lawsuits</h3>
            <p>
              Any violation constitutes copyright infringement and intellectual property theft under the <strong>Copyright Act No. 98 of 1978</strong>, the <strong>Cybercrimes Act No. 19 of 2020</strong>, and the common law of the <strong>Republic of South Africa</strong>.
            </p>
            <p className="mt-2 text-red-200">
              SourceOasis LTD actively enforces intellectual property rights and maintains automated forensic tracking. In the event of any unauthorized sharing or commercial derivation:
            </p>
            <ol className="list-decimal pl-6 space-y-1.5 mt-2 text-white/80">
              <li>Your LMS account and access will be <strong>permanently terminated with zero refund</strong>.</li>
              <li>SourceOasis LTD will <strong>institute immediate civil litigation in the High Court of South Africa</strong> seeking maximum statutory damages, full disgorgement of all revenues generated, punitive damages, and immediate court interdicts.</li>
              <li>You will be held personally liable for all legal costs on an attorney-and-client scale and commercial damages.</li>
            </ol>
          </section>

          <section className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <h2 className="text-xl font-bold text-white mb-3">3. Governing Law</h2>
            <p>
              These Terms shall be governed by and interpreted under the laws of the Republic of South Africa.
            </p>
          </section>

          <section className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <h2 className="text-xl font-bold text-white mb-3">4. Contact Information</h2>
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
