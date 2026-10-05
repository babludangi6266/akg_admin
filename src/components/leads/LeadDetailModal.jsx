import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RiCloseLine,
  RiShieldCheckLine,
  RiPhoneLine,
  RiMailLine,
  RiHome4Line,
  RiPriceTag3Line,
  RiDeleteBin6Line,
  RiCheckLine,
  RiBankLine,
  RiMapPinLine,
  RiTimeLine,
  RiWhatsappLine,
  RiChatQuoteLine,
  RiBuildingLine,
  RiCalendarLine,
  RiFileCopyLine,
  RiUserLine,
  RiExternalLinkLine,
  RiCheckDoubleLine,
  RiCompass3Line,
  RiBriefcaseLine,
  RiInformationLine,
  RiExchangeDollarLine,
  RiCoinsLine,
} from 'react-icons/ri';
import { leadAPI } from '../../services/api';

const statusOptions = [
  { value: 'new', label: 'New Requirement', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'contacted', label: 'Contacted Client', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'in_progress', label: 'Site Visit / Review', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'closed_won', label: 'Converted / Won', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'closed_lost', label: 'Closed / Lost', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  { value: 'rejected', label: 'Invalid / Rejected', badge: 'bg-slate-100 text-slate-700 border-slate-300' },
];

const LeadDetailModal = ({ lead, onClose, onUpdateSuccess }) => {
  const [currentStatus, setCurrentStatus] = useState(lead?.status || 'new');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  if (!lead) return null;

  // Extract client information
  const contactName = lead.contact?.name || lead.name || lead.fullName || 'Valued Client';
  const mobileNum = lead.contact?.mobile || lead.phone || lead.mobile || 'N/A';
  const emailAddr = lead.contact?.email || lead.email || '';
  const clientAddress = lead.address || lead.contact?.address || 'Indore Region, MP';

  // Extract requirements
  const refId = lead.referenceId || `ZJ-${lead._id?.slice(-6)?.toUpperCase() || 'REQ'}`;
  const budget = lead.budget || lead.buyDetails?.budgetMax || lead.sellDetails?.expectedPrice || 'Flexible / Discussion';
  const amount = lead.amount || lead.budget || '';
  const propertyType = lead.propertyType || lead.buyDetails?.propertyType || lead.sellDetails?.propertyType || 'Real Estate Asset';
  const locality = lead.location || lead.locality || lead.buyDetails?.preferredLocations?.[0] || lead.sellDetails?.locality || 'Indore Prime Corridor';
  const area = lead.area || 'Flexible / As per availability';
  const partnerType = lead.partnerType || '';
  const dealsIn = Array.isArray(lead.dealsIn) ? lead.dealsIn : (lead.dealsIn ? [lead.dealsIn] : []);
  const isPartner = lead.category === 'partner' || Boolean(partnerType);
  const isSell = lead.category === 'sell';
  const isBuy = lead.category === 'buy' || (!isPartner && !isSell);
  const timeline = lead.timeline || lead.buyDetails?.timeline || 'Immediate / 1-3 Months';
  const needHomeLoan = lead.needHomeLoan || lead.buyDetails?.homeLoanRequired;
  const remarks = lead.remarks || lead.message || lead.buyDetails?.additionalRequirements || 'No additional remarks provided.';
  const propertyTitle = lead.propertyTitle || (isPartner ? 'Channel Partner Onboarding Application' : (isSell ? 'Direct Property Sale Mandate' : 'High-Intent Acquisition Requirement'));
  const source = lead.source || (isPartner ? 'Partner Desk Portal' : (isSell ? 'Seller Mandate Desk' : 'Verified Buy Flow'));

  // Format Budget helper
  const formatBudgetDisplay = (b) => {
    if (!b) return 'Flexible';
    if (typeof b === 'number') {
      if (b >= 10000000) return `₹ ${(b / 10000000).toFixed(2)} Cr`;
      if (b >= 100000) return `₹ ${(b / 100000).toFixed(2)} Lakhs`;
      return `₹ ${b.toLocaleString('en-IN')}`;
    }
    return String(b);
  };

  // WhatsApp Outreach Link
  const getWhatsAppUrl = () => {
    if (!mobileNum || mobileNum === 'N/A') return '#';
    const cleanNumber = mobileNum.replace(/[^0-9]/g, '');
    const numWithCountry = cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`;
    const text = encodeURIComponent(
      `Hello ${contactName},\n\nGreetings from *Zamin Junction Private Client Desk*.\n\nWe are actively reviewing your requirement [Ref: *${refId}*] for *${propertyType.toUpperCase()}* in *${locality}* (Budget: ${formatBudgetDisplay(budget)}).\n\nWhen would be a convenient time for a brief 5-minute call today to present verified title options?\n\nBest Regards,\n*Private Wealth & Property Desk | Zamin Junction*`
    );
    return `https://wa.me/${numWithCountry}?text=${text}`;
  };

  // Copy reference ID
  const handleCopyRef = () => {
    navigator.clipboard.writeText(refId);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // Update Status
  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      if (lead._id && lead._id.length === 24) {
        await leadAPI.updateLeadStatus(lead._id, { status: newStatus });
      }
      setCurrentStatus(newStatus);
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (err) {
      console.error('Failed to update lead status:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Add Internal Note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      if (lead._id && lead._id.length === 24) {
        await leadAPI.updateLeadStatus(lead._id, { note: noteText.trim() });
      }
      setNoteText('');
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setAddingNote(false);
    }
  };

  // Delete Lead
  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete this requirement for "${contactName}"?`)) return;
    setDeleting(true);
    try {
      if (lead._id && lead._id.length === 24) {
        await leadAPI.deleteLead(lead._id);
      }
      if (onUpdateSuccess) onUpdateSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to delete lead:', err);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = statusOptions.find((opt) => opt.value === status);
    return s ? s.badge : 'bg-slate-100 text-slate-700 border-slate-300';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-navy/70 backdrop-blur-sm select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25 }}
          className="bg-surface rounded-3xl border border-border shadow-elevated w-full max-w-[98vw] xl:max-w-7xl 2xl:max-w-[1550px] max-h-[95vh] overflow-hidden flex flex-col"
        >
          {/* ══════════ FULL-WIDTH STICKY HEADER ══════════ */}
          <div className="p-4 sm:p-6 border-b border-border bg-gradient-to-r from-bg via-surface to-bg flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Client Avatar / Icon */}
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-gradient-to-br from-navy to-navy-light text-gold flex items-center justify-center font-display font-black text-xl sm:text-2xl shadow-md border border-gold/40 shrink-0">
                {isPartner ? <RiBriefcaseLine /> : isSell ? <RiPriceTag3Line /> : <RiHome4Line />}
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display font-black text-lg sm:text-2xl text-navy truncate">
                    {contactName}
                  </h2>

                  {/* Ref ID Badge with copy */}
                  <button
                    onClick={handleCopyRef}
                    title="Click to copy Reference ID"
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-mono font-extrabold uppercase bg-gold/15 text-gold border border-gold/40 hover:bg-gold/25 transition-colors cursor-pointer"
                  >
                    <span>{refId}</span>
                    <RiFileCopyLine className="text-xs" />
                    {copiedRef && <span className="text-[10px] text-emerald-600 font-bold ml-1">Copied!</span>}
                  </button>

                  {/* Current Status Pill */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(currentStatus)}`}>
                    {currentStatus.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-text-muted font-medium">
                  <span className="flex items-center gap-1">
                    <RiCalendarLine className="text-gold" />
                    {new Date(lead.createdAt || Date.now()).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span>•</span>
                  <span>Portal Source: <strong className="text-navy">{source}</strong></span>
                  {lead.mobileVerified && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <RiShieldCheckLine /> OTP Verified Client
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions & Close */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all shadow-xs cursor-pointer"
              >
                <RiWhatsappLine className="text-base" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`tel:${mobileNum}`}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-navy text-gold font-bold text-xs hover:bg-navy-light transition-all shadow-xs cursor-pointer"
              >
                <RiPhoneLine className="text-base" />
                <span>Call Client</span>
              </a>

              <button
                onClick={onClose}
                className="p-2.5 rounded-xl text-text-secondary hover:text-navy hover:bg-bg transition-colors cursor-pointer border border-border"
                title="Close Modal"
              >
                <RiCloseLine className="text-xl" />
              </button>
            </div>
          </div>

          {/* ══════════ FULL-WIDTH RESPONSIVE TWO-COLUMN BODY ══════════ */}
          <div className="p-4 sm:p-6 lg:p-7 overflow-y-auto flex-1 space-y-6">

            {/* Mobile-only Quick Action Bar */}
            <div className="flex sm:hidden items-center gap-2 p-3 rounded-2xl bg-bg border border-border">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <RiWhatsappLine className="text-base" /> WhatsApp
              </a>
              <a
                href={`tel:${mobileNum}`}
                className="flex-1 py-2 rounded-xl bg-navy text-gold font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <RiPhoneLine className="text-base" /> Call
              </a>
            </div>

            {/* Grid Split: Left (Client & Specifications 7 cols) + Right (CRM Status & Notes 5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* ── LEFT DOSSIER COLUMN (7 COLS) ── */}
              <div className="lg:col-span-7 space-y-5">

                {/* 1. Client Identity & Contact Cards */}
                <div className="p-5 rounded-2xl bg-bg border border-border/80 space-y-3.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-extrabold text-xs uppercase tracking-wider text-navy flex items-center gap-1.5">
                      <RiUserLine className="text-gold text-sm" />
                      Client Identity & Verification
                    </h3>
                    <span className="text-[10px] font-bold text-text-muted">Primary Record</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    {/* Mobile Card */}
                    <div className="p-3.5 rounded-xl bg-surface border border-border/80 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-base shrink-0">
                        <RiPhoneLine />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Phone / Mobile</p>
                        <a href={`tel:${mobileNum}`} className="font-bold text-navy text-sm hover:underline hover:text-gold block truncate">
                          +91 {mobileNum}
                        </a>
                      </div>
                    </div>

                    {/* Email Card */}
                    <div className="p-3.5 rounded-xl bg-surface border border-border/80 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-base shrink-0">
                        <RiMailLine />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Email Address</p>
                        <p className="font-bold text-navy text-sm truncate">
                          {emailAddr || 'Not provided'}
                        </p>
                      </div>
                    </div>

                    {/* Address Card */}
                    <div className="p-3.5 rounded-xl bg-surface border border-border/80 flex items-start gap-3 sm:col-span-2">
                      <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-base shrink-0">
                        <RiMapPinLine />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Residence / Office Location</p>
                        <p className="font-semibold text-navy text-xs mt-0.5">
                          {clientAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Requirement Specifications (Grid of 4 Metric Tiles) */}
                <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-extrabold text-xs uppercase tracking-wider text-navy flex items-center gap-1.5">
                      <RiCompass3Line className="text-gold text-sm" />
                      {isPartner ? 'Partner Onboarding Specifications' : isSell ? 'Sell Mandate Parameters' : 'Acquisition Parameters'}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gold/10 text-gold uppercase">
                      Target Mandate
                    </span>
                  </div>

                  {isPartner ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl border border-border bg-bg">
                        <p className="text-[10px] text-text-muted font-bold uppercase">Partner Category</p>
                        <p className="font-display font-black text-purple-700 text-sm mt-1 uppercase">
                          {partnerType || 'Broker / Consultant'}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-border bg-bg">
                        <p className="text-[10px] text-text-muted font-bold uppercase">Operating Corridor</p>
                        <p className="font-bold text-navy text-sm mt-1">
                          {area || locality}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-border bg-bg">
                        <p className="text-[10px] text-text-muted font-bold uppercase">Verification Status</p>
                        <p className="font-bold text-sm mt-1 text-emerald-600 flex items-center gap-1">
                          {lead.mobileVerified ? '✓ OTP Confirmed' : 'Submitted'}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-border bg-bg sm:col-span-3">
                        <p className="text-[10px] text-text-muted font-bold uppercase mb-2">Primary Specialization</p>
                        <div className="flex flex-wrap gap-2">
                          {dealsIn.length > 0 ? (
                            dealsIn.map((cat, i) => (
                              <span key={i} className="px-3 py-1 rounded-lg bg-gold/15 text-gold border border-gold/30 text-xs font-bold">
                                {cat}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-text-muted">Plots, Luxury Villas, Commercial Corridors</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Metric 1: Property Type */}
                      <div className="p-3.5 rounded-xl border border-border bg-bg">
                        <p className="text-[10px] text-text-muted font-bold uppercase">Asset Type</p>
                        <p className="font-display font-black text-navy text-sm mt-1 capitalize">
                          {propertyType}
                        </p>
                      </div>

                      {/* Metric 2: Area / Size */}
                      <div className="p-3.5 rounded-xl border border-border bg-bg">
                        <p className="text-[10px] text-text-muted font-bold uppercase">Plot / Carpet Area</p>
                        <p className="font-bold text-navy text-sm mt-1 truncate">
                          {area}
                        </p>
                      </div>

                      {/* Metric 3: Budget Allocation */}
                      <div className="p-3.5 rounded-xl border border-border bg-bg">
                        <p className="text-[10px] text-text-muted font-bold uppercase">Budget / Valuation</p>
                        <p className="font-display font-black text-gold text-sm mt-1">
                          {isSell
                            ? (amount ? (typeof amount === 'number' ? formatBudgetDisplay(amount) : amount) : 'Open to Offer')
                            : formatBudgetDisplay(budget)}
                        </p>
                      </div>

                      {/* Metric 4: Location */}
                      <div className="p-3.5 rounded-xl border border-border bg-bg">
                        <p className="text-[10px] text-text-muted font-bold uppercase">Target Location</p>
                        <p className="font-bold text-navy text-sm mt-1 truncate">
                          {locality}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Inquired Asset & Financing Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Inquired Asset */}
                  <div className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center text-lg shrink-0">
                        <RiBuildingLine />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-text-muted font-bold uppercase">Inquired Asset</p>
                        <p className="font-bold text-navy text-xs mt-0.5 truncate">{propertyTitle}</p>
                      </div>
                    </div>
                  </div>

                  {/* Financing Preference */}
                  <div className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center text-lg shrink-0">
                        <RiBankLine />
                      </div>
                      <div>
                        <p className="text-[10px] text-text-muted font-bold uppercase">Banking / Financing</p>
                        <p className="font-bold text-navy text-xs mt-0.5">
                          {needHomeLoan ? 'Loan Assistance Requested' : 'Self-Funded Acquisition'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shrink-0 border ${
                      needHomeLoan ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-bg text-text-muted border-border'
                    }`}>
                      {needHomeLoan ? 'Bank EMI' : 'Cash/Capital'}
                    </span>
                  </div>
                </div>

                {/* 4. Client Remarks */}
                <div className="p-4 sm:p-5 rounded-2xl bg-bg border border-border space-y-2">
                  <div className="flex items-center gap-2 text-gold">
                    <RiChatQuoteLine className="text-base shrink-0" />
                    <h4 className="font-display font-extrabold text-xs uppercase tracking-wider text-navy">
                      Client Special Instructions & Remarks
                    </h4>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed font-medium pl-6 italic whitespace-pre-wrap">
                    &ldquo;{remarks}&rdquo;
                  </p>
                </div>
              </div>

              {/* ── RIGHT CRM WORKFLOW & AUDIT COLUMN (5 COLS) ── */}
              <div className="lg:col-span-5 space-y-5">

                {/* 1. Status Update Matrix */}
                <div className="p-5 rounded-2xl bg-surface border border-gold/40 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-black text-xs uppercase tracking-wider text-navy flex items-center gap-1.5">
                      <RiExchangeDollarLine className="text-gold text-sm" />
                      Deal Processing Stage
                    </h3>
                    <span className="text-[10px] font-bold text-text-muted">Instant Sync</span>
                  </div>

                  <p className="text-2xs text-text-muted font-medium">
                    Click any stage button to update the status in the central CRM database.
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        disabled={updating}
                        onClick={() => handleStatusChange(opt.value)}
                        className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-display text-xs font-bold border transition-all cursor-pointer ${
                          currentStatus === opt.value
                            ? 'bg-navy text-gold border-gold shadow-md ring-2 ring-gold/30'
                            : 'bg-surface text-text-secondary border-border hover:border-gold/50 hover:bg-bg'
                        }`}
                      >
                        <span className="truncate">{opt.label}</span>
                        {currentStatus === opt.value && <RiCheckDoubleLine className="text-sm text-gold shrink-0 ml-1" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Internal Advisory Notes Stream */}
                <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-black text-xs uppercase tracking-wider text-navy flex items-center gap-1.5">
                      <RiInformationLine className="text-gold text-sm" />
                      Internal Advisory Notes
                    </h3>
                    <span className="text-[10px] font-bold text-text-muted">Confidential</span>
                  </div>

                  {/* Existing Notes */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {Array.isArray(lead.notes) && lead.notes.length > 0 ? (
                      lead.notes.map((n, i) => (
                        <div key={i} className="p-3 rounded-xl bg-bg border border-border text-xs space-y-1">
                          <p className="text-navy font-semibold">{n.text}</p>
                          <p className="text-[10px] text-text-muted font-medium flex items-center gap-1">
                            <RiTimeLine className="text-xs" />
                            {n.addedAt ? new Date(n.addedAt).toLocaleString('en-IN') : 'Just now'}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-xl bg-bg/50 border border-dashed border-border text-center text-text-muted text-xs">
                        No internal notes yet. Enter a note below to record client feedback or site visit details.
                      </div>
                    )}
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add note for advisory desk..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                    />
                    <button
                      type="submit"
                      disabled={addingNote || !noteText.trim()}
                      className="px-4 py-2.5 rounded-xl bg-navy text-gold hover:bg-navy-light text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-xs shrink-0"
                    >
                      {addingNote ? 'Saving...' : 'Add Note'}
                    </button>
                  </form>
                </div>

                {/* 3. System Telemetry & Metadata Card */}
                <div className="p-4 rounded-2xl bg-bg border border-border space-y-2 text-2xs text-text-secondary">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy">Record Reference ID:</span>
                    <span className="font-mono font-bold text-navy">{refId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy">Database ObjectId:</span>
                    <span className="font-mono text-text-muted">{lead._id || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy">Last Synchronization:</span>
                    <span>{new Date().toLocaleTimeString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════ FULL-WIDTH STICKY FOOTER ══════════ */}
          <div className="p-4 sm:p-5 border-t border-border bg-bg flex items-center justify-between shrink-0">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2.5 rounded-xl font-display font-bold text-xs bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-600 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <RiDeleteBin6Line className="text-sm" />
              <span>{deleting ? 'Deleting...' : 'Delete Requirement'}</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-display font-bold text-xs bg-navy text-gold hover:bg-navy-light transition-all cursor-pointer shadow-gold border border-gold/30"
              >
                Close & Return
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LeadDetailModal;
