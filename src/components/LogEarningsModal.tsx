'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy, Plus, DollarSign, Calendar, Building, Sparkles,
  Trash2, X, CheckCircle2, TrendingUp, Tag, FileText, Loader2, ArrowRight
} from 'lucide-react';

export interface EarningEntry {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  date: string;
  client_name?: string | null;
  service_type?: string | null;
  notes?: string | null;
  created_at?: string;
}

interface LogEarningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onEarningsUpdated?: (totalZar: number) => void;
}

const SERVICE_OPTIONS = [
  "Cold Calling & Appointment Setting",
  "Lead Generation & Email Outreach",
  "Website & Web App Development",
  "Virtual Assistant & Operations",
  "Customer Support & Back Office",
  "Social Media & Content Delivery",
  "Other BPO Service"
];

export function LogEarningsModal({
  isOpen,
  onClose,
  userId,
  onEarningsUpdated,
}: LogEarningsModalProps) {
  const [earnings, setEarnings] = useState<EarningEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('ZAR');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [clientName, setClientName] = useState('');
  const [serviceType, setServiceType] = useState(SERVICE_OPTIONS[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchEarnings();
    }
  }, [isOpen, userId]);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/earnings?userId=${userId}`);
      const data = await res.json();
      if (data.status === 'success') {
        setEarnings(data.earnings || []);
        if (onEarningsUpdated) {
          onEarningsUpdated(data.totalZar || 0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch earnings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEarning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid earning amount.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/earnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: Number(amount),
          currency,
          date,
          clientName,
          serviceType,
          notes,
        }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        setAmount('');
        setClientName('');
        setNotes('');
        setSuccessNotice(true);
        setTimeout(() => setSuccessNotice(false), 3000);
        await fetchEarnings();
      } else {
        setError(data.message || 'Failed to save earning.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to connect to server.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this earning entry?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/earnings?id=${id}&userId=${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.status === 'success') {
        await fetchEarnings();
      }
    } catch (err) {
      console.error('Delete earning error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  const totalEarningsZar = earnings.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0d0d0d] border border-[#00ff66]/30 rounded-3xl p-6 md:p-8 shadow-[0_0_80px_rgba(0,255,102,0.15)] my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white p-2 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] font-mono text-[10px] uppercase font-bold mb-2">
              <Trophy className="w-3.5 h-3.5" /> Student Earnings Tracker
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Log Your BPO Deals
            </h2>
            <p className="text-xs text-white/50 font-mono mt-1">
              Track every client deal and watch your outsourcing revenue grow.
            </p>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 text-right sm:text-right shrink-0">
            <span className="text-[10px] font-mono uppercase text-white/50 block">Total Logged</span>
            <span className="text-2xl font-black font-mono text-[#00ff66]">
              R{totalEarningsZar.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Form to Add New Deal */}
        <form onSubmit={handleAddEarning} className="mt-6 space-y-4 bg-white/[0.02] border border-white/10 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#00ff66]" /> Record a New Client Deal
            </h3>
            {successNotice && (
              <span className="text-xs text-[#00ff66] font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Deal Logged Successfully!
              </span>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Amount */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">
                Deal Amount <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/40 text-xs font-bold font-mono">
                  {currency === 'ZAR' ? 'R' : currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€'}
                </span>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 focus:border-[#00ff66] rounded-xl pl-8 pr-3 py-2 text-sm text-white font-mono placeholder:text-white/20 outline-none"
                />
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-black/60 border border-white/10 focus:border-[#00ff66] rounded-xl px-3 py-2 text-sm text-white font-mono outline-none cursor-pointer"
              >
                <option value="ZAR">ZAR (Rands)</option>
                <option value="USD">USD (Dollars)</option>
                <option value="GBP">GBP (Pounds)</option>
                <option value="EUR">EUR (Euros)</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">
                Date Closed
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black/60 border border-white/10 focus:border-[#00ff66] rounded-xl px-3 py-2 text-sm text-white font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Client / Business Name */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">
                Client / Company (Optional)
              </label>
              <div className="relative">
                <Building className="w-3.5 h-3.5 absolute left-3 top-3 text-white/40" />
                <input
                  type="text"
                  placeholder="e.g. Apex Legal Group (USA)"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 focus:border-[#00ff66] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/20 outline-none"
                />
              </div>
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">
                Service Provided
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full bg-black/60 border border-white/10 focus:border-[#00ff66] rounded-xl px-3 py-2 text-sm text-white outline-none cursor-pointer"
              >
                {SERVICE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">
              Notes / Win Details (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. First monthly retainer signed from cold email outreach template in Chapter 4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-black/60 border border-white/10 focus:border-[#00ff66] rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/20 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#00ff66] to-[#00cc55] text-black font-extrabold py-2.5 rounded-xl hover:brightness-110 transition text-xs shadow-lg cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Log Client Deal</span>
          </button>
        </form>

        {/* History List */}
        <div className="mt-6">
          <h3 className="text-xs font-mono uppercase tracking-wider text-white/50 font-bold mb-3 flex items-center justify-between">
            <span>Recent Logged Earnings ({earnings.length})</span>
            {earnings.length > 0 && (
              <span className="text-[10px] text-[#00ff66] font-normal">
                🎉 Verified LMS Record
              </span>
            )}
          </h3>

          {loading ? (
            <div className="py-8 text-center text-white/40 text-xs flex items-center justify-center gap-2 font-mono">
              <Loader2 className="w-4 h-4 animate-spin text-[#00ff66]" /> Loading earnings history...
            </div>
          ) : earnings.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 text-center text-white/40 text-xs font-mono">
              No deals logged yet. Close your first client using the Blueprint chapters and log it above! 🚀
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto divide-y divide-white/5 rounded-2xl border border-white/10 bg-black/40">
              {earnings.map((entry) => (
                <div key={entry.id} className="p-3.5 flex items-center justify-between hover:bg-white/[0.02] transition">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-mono text-[#00ff66]">
                        {entry.currency === 'ZAR' ? 'R' : entry.currency === 'USD' ? '$' : entry.currency === 'GBP' ? '£' : '€'}
                        {Number(entry.amount).toLocaleString()}
                      </span>
                      {entry.client_name && (
                        <span className="text-xs font-medium text-white">
                          · {entry.client_name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-white/40 font-mono">
                      <span>{entry.date}</span>
                      {entry.service_type && <span>· {entry.service_type}</span>}
                    </div>
                    {entry.notes && (
                      <p className="text-[11px] text-white/60 italic mt-0.5">{entry.notes}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(entry.id)}
                    disabled={deletingId === entry.id}
                    className="p-2 text-white/30 hover:text-red-400 transition cursor-pointer"
                    title="Delete entry"
                  >
                    {deletingId === entry.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
