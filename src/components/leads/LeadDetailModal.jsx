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
} from 'react-icons/ri';
import { leadAPI } from '../../services/api';

const statusOptions = [
  { value: 'new', label: 'New Lead / Requirement' },
  { value: 'contacted', label: 'Contacted Client' },
  { value: 'in_progress', label: 'In Progress / Site Visit' },
  { value: 'closed_won', label: 'Deal Closed / Converted' },
  { value: 'closed_lost', label: 'Closed / Lost' },
  { value: 'rejected', label: 'Invalid / Rejected' },
];

const LeadDetailModal = ({ lead, onClose, onUpdateSuccess }) => {
  const [currentStatus, setCurrentStatus] = useState(lead?.status || 'new');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  if (!lead) return null;

  // Extract client information
  const contactName = lead.contact?.name || lead.name || lead.fullName || 'Valued Client';
  const mobileNum = lead.contact?.mobile || lead.phone || lead.mobile || 'N/A';
  const emailAddr = lead.contact?.email || lead.email || '';
  const clientAddress = lead.address || lead.contact?.address || 'Not Provided';

  // Extract user requirements
  const refId = lead.referenceId || `ZJ-DEAL-${lead._id?.slice(-6)?.toUpperCase() || 'REQ'}`;
  const budget = lead.budget || lead.buyDetails?.budgetMax || lead.sellDetails?.expectedPrice || 'Flexible / Discussion';
  const propertyType = lead.propertyType || lead.buyDetails?.propertyType || lead.sellDetails?.propertyType || 'Real Estate';
  const locality = lead.locality || lead.buyDetails?.preferredLocations?.[0] || lead.sellDetails?.locality || 'Indore Prime Corridor';
  const timeline = lead.timeline || lead.buyDetails?.timeline || 'Immediate / 1-3 Months';
  const needHomeLoan = lead.needHomeLoan || lead.buyDetails?.homeLoanRequired;
  const remarks = lead.remarks || lead.message || lead.buyDetails?.additionalRequirements || 'No additional remarks submitted.';
  const propertyTitle = lead.propertyTitle || 'General Real Estate Advisory';
  const department = lead.department || 'Deal Advisory Desk';
  const source = lead.source || 'Website Deal Desk';

  // Format Budget string
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
      `Hello ${contactName},\n\nGreetings from *Zamin Junction Private Desk*.\n\nWe have received your requirement [Ref: *${refId}*] for *${propertyType.toUpperCase()}* in *${locality}* (Budget: ${formatBudgetDisplay(budget)}).\n\nOur senior property advisor is reviewing verified title inventory matching your criteria. When would be a good time for a brief 5-minute call today?\n\nBest Regards,\n*Super Admin | Zamin Junction*`
    );
    return `https://wa.me/${numWithCountry}?text=${text}`;
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 max-sm:p-2 bg-navy/60 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
          className="bg-surface rounded-3xl border border-border shadow-elevated w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between bg-bg/50">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center font-display font-extrabold text-2xl shadow-xs border border-gold/30">
                <RiHome4Line />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-extrabold text-xl text-navy">
                    {contactName}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold uppercase bg-gold/15 text-gold border border-gold/40">
                    {refId}
                  </span>
                </div>
                <p className="text-2xs text-text-secondary font-medium mt-0.5 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <RiCalendarLine />
                    {new Date(lead.createdAt || Date.now()).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span>•</span>
                  <span>Source: {source}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-text-secondary hover:text-navy hover:bg-bg transition-colors cursor-pointer"
            >
              <RiCloseLine className="text-2xl" />
            </button>
          </div>

          {/* Modal Content Scroll */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
            {/* Quick Outreach Action Bar */}
            <div className="p-4 rounded-2xl bg-gold/5 border border-gold/30 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-bold text-navy">Direct Client Outreach Desk</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-success text-white font-display font-bold text-xs flex items-center gap-1.5 hover:bg-success/90 transition-all shadow-xs cursor-pointer"
                >
                  <RiWhatsappLine className="text-base" /> WhatsApp Client
                </a>

                <a
                  href={`tel:${mobileNum}`}
                  className="px-4 py-2 rounded-xl bg-navy text-gold font-display font-bold text-xs flex items-center gap-1.5 hover:bg-navy-light transition-all shadow-xs cursor-pointer"
                >
                  <RiPhoneLine className="text-base" /> Call Client
                </a>
              </div>
            </div>

            {/* Section 1: Client Personal & Contact Details */}
            <div className="p-5 rounded-2xl bg-bg border border-border/80 space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-xs text-navy uppercase tracking-wider">
                  1. Client Identity & Contact Info
                </h4>
                {lead.mobileVerified && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-success-light text-success border border-success/30">
                    <RiShieldCheckLine /> OTP Verified
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Mobile */}
                <div className="flex items-start gap-3">
                  <RiPhoneLine className="text-gold text-base shrink-0 mt-0.5" />
                  <div>
                    <p className="text-2xs text-text-muted font-bold uppercase">Phone Number</p>
                    <a href={`tel:${mobileNum}`} className="font-bold text-navy text-sm hover:underline">
                      +91 {mobileNum}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <RiMailLine className="text-gold text-base shrink-0 mt-0.5" />
                  <div>
                    <p className="text-2xs text-text-muted font-bold uppercase">Email Address</p>
                    <p className="font-semibold text-navy text-sm">
                      {emailAddr || 'Not provided'}
                    </p>
                  </div>
                </div>

                {/* Full Address */}
                <div className="flex items-start gap-3 sm:col-span-2">
                  <RiMapPinLine className="text-gold text-base shrink-0 mt-0.5" />
                  <div>
                    <p className="text-2xs text-text-muted font-bold uppercase">Residence / Current Address</p>
                    <p className="font-semibold text-navy text-xs mt-0.5">
                      {clientAddress}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Detailed Requirement Specifications */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-xs text-navy uppercase tracking-wider">
                2. User Requirement Specifications
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Target Property Type */}
                <div className="p-3 rounded-xl border border-border bg-surface">
                  <p className="text-2xs text-text-muted font-bold uppercase">Property Type</p>
                  <p className="font-bold text-navy text-xs mt-0.5 capitalize">
                    {propertyType.replace(/_/g, ' ')}
                  </p>
                </div>

                {/* Corridor / Locality */}
                <div className="p-3 rounded-xl border border-border bg-surface">
                  <p className="text-2xs text-text-muted font-bold uppercase">Target Locality</p>
                  <p className="font-bold text-navy text-xs mt-0.5">
                    {locality}
                  </p>
                </div>

                {/* Target Budget */}
                <div className="p-3 rounded-xl border border-border bg-surface">
                  <p className="text-2xs text-text-muted font-bold uppercase">Budget Range</p>
                  <p className="font-bold text-navy text-xs mt-0.5">
                    {formatBudgetDisplay(budget)}
                  </p>
                </div>

                {/* Timeline */}
                <div className="p-3 rounded-xl border border-border bg-surface">
                  <p className="text-2xs text-text-muted font-bold uppercase">Purchase Timeline</p>
                  <p className="font-bold text-navy text-xs mt-0.5">
                    {timeline}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Inquired Property Details (if linked) */}
            <div className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center text-lg shrink-0">
                  <RiBuildingLine />
                </div>
                <div>
                  <p className="text-2xs text-text-muted font-bold uppercase">Inquired Listing / Asset</p>
                  <h5 className="font-display font-bold text-navy text-xs mt-0.5">
                    {propertyTitle}
                  </h5>
                </div>
              </div>

              <span className="px-3 py-1 rounded-xl text-2xs font-extrabold uppercase bg-gold/10 text-gold border border-gold/30 shrink-0">
                {department}
              </span>
            </div>

            {/* Section 4: Home Loan Assistance Preference */}
            <div className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center text-lg">
                  <RiBankLine />
                </div>
                <div>
                  <p className="text-2xs text-text-muted font-bold uppercase">Home Loan Support</p>
                  <p className="font-bold text-navy text-xs mt-0.5">
                    {needHomeLoan
                      ? 'Client Requested Bank Financing & EMI Assistance'
                      : 'Self-Funded / No Home Loan Needed'}
                  </p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-2xs font-extrabold uppercase border ${
                  needHomeLoan
                    ? 'bg-success-light text-success border-success/30'
                    : 'bg-bg text-text-muted border-border'
                }`}
              >
                {needHomeLoan ? 'Loan Assistance Needed' : 'Self Funded'}
              </span>
            </div>

            {/* Section 5: Client Remarks / Message */}
            <div className="p-4 rounded-2xl bg-bg border border-border space-y-1.5">
              <div className="flex items-center gap-2 text-gold">
                <RiChatQuoteLine className="text-base" />
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-navy">
                  User Remarks & Special Instructions
                </h4>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed font-medium whitespace-pre-wrap pl-6">
                &quot;{remarks}&quot;
              </p>
            </div>

            {/* Section 6: Status Update Workflow */}
            <div className="p-5 rounded-2xl bg-surface border border-gold/30 space-y-3">
              <h4 className="font-display font-bold text-xs text-navy uppercase tracking-wider">
                Update Lead Processing Status
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    disabled={updating}
                    onClick={() => handleStatusChange(opt.value)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-display text-2xs font-bold border transition-all cursor-pointer ${
                      currentStatus === opt.value
                        ? 'bg-navy text-gold border-gold/50 shadow-md ring-2 ring-gold/30'
                        : 'bg-surface text-text-secondary border-border hover:border-gold/30'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {currentStatus === opt.value && <RiCheckLine className="text-sm text-gold" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 7: Internal Admin Notes */}
            <div className="p-4 rounded-2xl bg-bg border border-border space-y-3">
              <h4 className="font-display font-bold text-xs text-navy uppercase tracking-wider">
                Internal Admin Notes
              </h4>

              {Array.isArray(lead.notes) && lead.notes.length > 0 && (
                <div className="space-y-2 mb-3">
                  {lead.notes.map((n, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-surface border border-border text-xs">
                      <p className="text-navy font-medium">{n.text}</p>
                      <p className="text-3xs text-text-muted mt-1">
                        {n.addedAt ? new Date(n.addedAt).toLocaleString('en-IN') : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add internal note for advisory team..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-surface border border-border text-xs text-navy focus:outline-hidden focus:border-gold"
                />
                <button
                  type="submit"
                  disabled={addingNote || !noteText.trim()}
                  className="px-4 py-2 rounded-xl bg-navy text-gold hover:bg-navy-light text-2xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {addingNote ? 'Saving...' : 'Add Note'}
                </button>
              </form>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border bg-bg/50 flex items-center justify-between">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-xl font-display font-bold text-xs bg-danger-light text-danger border border-danger/30 hover:bg-danger hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RiDeleteBin6Line className="text-sm" /> {deleting ? 'Deleting...' : 'Delete Requirement'}
            </button>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-display font-bold text-xs bg-navy text-gold hover:bg-navy-light transition-colors cursor-pointer shadow-gold"
            >
              Done & Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LeadDetailModal;
