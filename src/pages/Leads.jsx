import { useState, useEffect } from 'react';
import {
  RiSearchLine,
  RiFilter3Line,
  RiShieldCheckLine,
  RiEyeLine,
  RiDownload2Line,
  RiRefreshLine,
  RiHome4Line,
  RiPriceTag3Line,
  RiDeleteBin6Line,
  RiWhatsappLine,
  RiPhoneLine,
  RiMapPinLine,
  RiBankLine,
  RiBuildingLine,
  RiCalendarLine,
  RiUserStarLine,
  RiUserLine,
  RiMoneyRupeeCircleLine,
  RiBriefcaseLine,
} from 'react-icons/ri';
import { leadAPI } from '../services/api';
import LeadDetailModal from '../components/leads/LeadDetailModal';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = { limit: 150 };
      if (activeTab !== 'all') params.category = activeTab;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await leadAPI.getLeads(params);

      // Unpack response array correctly from backend paginated response
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.leads)
        ? res.data.leads
        : Array.isArray(res?.leads)
        ? res.leads
        : [];

      setLeads(list);
    } catch (err) {
      console.error('Failed to fetch real MongoDB leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [activeTab, statusFilter]);

  const handleDeleteLead = async (id, name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete entry for "${name || 'Client'}"?`)) return;

    try {
      if (id && id.length === 24) {
        await leadAPI.deleteLead(id);
      }
      setLeads((prev) => prev.filter((item) => item._id !== id));
      fetchLeads();
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  };

  const handleStatusSelect = async (id, newStatus, e) => {
    e.stopPropagation();
    try {
      if (id && id.length === 24) {
        await leadAPI.updateLeadStatus(id, { status: newStatus });
      }
      setLeads((prev) =>
        prev.map((l) => (l._id === id ? { ...l, status: newStatus } : l))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Client-side search & tab filter
  const filteredLeads = leads.filter((lead) => {
    // If activeTab is specific, ensure it matches
    if (activeTab === 'buy') {
      const isBuy = lead.category === 'buy' || lead.source?.includes('Deal') || (!lead.category && !lead.partnerType);
      if (!isBuy) return false;
    } else if (activeTab === 'sell') {
      if (lead.category !== 'sell') return false;
    } else if (activeTab === 'partner') {
      const isPartner = lead.category === 'partner' || lead.partnerType || lead.source?.includes('Partner');
      if (!isPartner) return false;
    } else if (activeTab === 'contact') {
      const isContact = lead.category === 'contact' || lead.source?.includes('Contact') || lead.department?.includes('Contact');
      if (!isContact) return false;
    }

    const q = searchQuery.toLowerCase();
    const name = lead.contact?.name || lead.name || lead.fullName || '';
    const mobile = lead.contact?.mobile || lead.phone || lead.mobile || '';
    const ref = lead.referenceId || '';
    const location =
      lead.location ||
      lead.locality ||
      lead.address ||
      lead.buyDetails?.preferredLocations?.[0] ||
      lead.sellDetails?.locality ||
      '';
    const area = lead.area || '';
    const partnerType = lead.partnerType || '';
    const propTitle = lead.propertyTitle || '';
    const propType = lead.propertyType || lead.buyDetails?.propertyType || '';
    return (
      name.toLowerCase().includes(q) ||
      mobile.includes(q) ||
      ref.toLowerCase().includes(q) ||
      location.toLowerCase().includes(q) ||
      area.toLowerCase().includes(q) ||
      partnerType.toLowerCase().includes(q) ||
      propTitle.toLowerCase().includes(q) ||
      propType.toLowerCase().includes(q)
    );
  });

  // Tab Filtering counts
  const totalCount = leads.length;
  const buyCount = leads.filter(
    (l) => l.category === 'buy' || l.source?.includes('Deal') || l.propertyId
  ).length;
  const sellCount = leads.filter((l) => l.category === 'sell').length;
  const partnerCount = leads.filter(
    (l) => l.category === 'partner' || l.partnerType || l.source?.includes('Partner')
  ).length;
  const contactCount = leads.filter(
    (l) => l.category === 'contact' || l.department?.includes('Contact') || l.source?.includes('Contact')
  ).length;

  // Formatted Budget / Amount string
  const formatBudgetDisplay = (b) => {
    if (!b) return 'Flexible';
    if (typeof b === 'number') {
      if (b >= 10000000) return `₹ ${(b / 10000000).toFixed(2)} Cr`;
      if (b >= 100000) return `₹ ${(b / 100000).toFixed(2)} L`;
      return `₹ ${b.toLocaleString('en-IN')}`;
    }
    return String(b);
  };

  // WhatsApp quick helper
  const getWhatsAppLink = (lead) => {
    const mobile = lead.contact?.mobile || lead.phone || lead.mobile || '';
    if (!mobile) return '#';
    const cleanNumber = mobile.replace(/[^0-9]/g, '');
    const numWithCountry = cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`;
    const name = lead.contact?.name || lead.name || 'Client';
    const ref = lead.referenceId || 'ZJ-REQ';
    const isPartner = lead.category === 'partner';
    const text = encodeURIComponent(
      isPartner
        ? `Hello ${name}, greetings from Zamin Junction Channel Partner Desk regarding your partner onboarding application [Ref: ${ref}]. How may we collaborate with you?`
        : `Hello ${name}, greetings from Zamin Junction Private Desk regarding your property requirement [Ref: ${ref}]. How may we assist your acquisition today?`
    );
    return `https://wa.me/${numWithCountry}?text=${text}`;
  };

  const exportCSV = () => {
    const headers =
      'Ref ID,Category,Client Name,Mobile,Property Type,Area,Budget / Amount,Location,Partner Type,Deals In,Status,Date\n';
    const rows = filteredLeads
      .map((l) => {
        const ref = l.referenceId || l._id;
        const cat = l.category || 'buy';
        const name = (l.contact?.name || l.name || l.fullName || '').replace(/"/g, '""');
        const mobile = l.contact?.mobile || l.phone || l.mobile || '';
        const type = l.propertyType || l.buyDetails?.propertyType || '';
        const area = (l.area || '').replace(/"/g, '""');
        const budget = (l.budget || l.amount || '').replace(/"/g, '""');
        const loc = (l.location || l.locality || l.address || '').replace(/"/g, '""');
        const partnerType = (l.partnerType || '').replace(/"/g, '""');
        const dealsIn = (Array.isArray(l.dealsIn) ? l.dealsIn.join('; ') : (l.dealsIn || '')).replace(/"/g, '""');
        const status = l.status || 'new';
        const date = new Date(l.createdAt || Date.now()).toLocaleDateString();
        return `"${ref}","${cat}","${name}","${mobile}","${type}","${area}","${budget}","${loc}","${partnerType}","${dealsIn}","${status}","${date}"`;
      })
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZaminJunction_Submissions_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display font-extrabold text-2xl text-navy">
              User Requirements & Partner Applications
            </h1>
            <span className="px-3 py-0.5 rounded-full text-2xs font-extrabold uppercase bg-gold/15 text-gold border border-gold/40">
              Live Submissions
            </span>
          </div>
          <p className="text-xs text-text-secondary font-medium mt-0.5">
            Review detailed client requirements for Buy Property, Sell Property, and Join as Property Partner.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLeads}
            className="px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-bg text-text-secondary hover:text-navy font-display font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <RiRefreshLine className={`text-base ${loading ? 'animate-spin' : ''}`} /> Refresh Data
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 rounded-xl bg-navy text-gold hover:bg-navy-light font-display font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-gold"
          >
            <RiDownload2Line className="text-base" /> Export CSV
          </button>
        </div>
      </div>

      {/* Tabs Bar — Tabs tailored to each requirement field */}
      <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 rounded-xl font-display font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-navy text-gold shadow-md'
              : 'text-text-secondary hover:text-navy hover:bg-surface'
          }`}
        >
          All Submissions ({totalCount})
        </button>

        <button
          onClick={() => setActiveTab('buy')}
          className={`px-4 py-2.5 rounded-xl font-display font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'buy'
              ? 'bg-navy text-gold shadow-md'
              : 'text-text-secondary hover:text-navy hover:bg-surface'
          }`}
        >
          <RiHome4Line /> Buy Property ({buyCount})
        </button>

        <button
          onClick={() => setActiveTab('sell')}
          className={`px-4 py-2.5 rounded-xl font-display font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sell'
              ? 'bg-navy text-gold shadow-md'
              : 'text-text-secondary hover:text-navy hover:bg-surface'
          }`}
        >
          <RiPriceTag3Line /> Sell Property ({sellCount})
        </button>

        <button
          onClick={() => setActiveTab('partner')}
          className={`px-4 py-2.5 rounded-xl font-display font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'partner'
              ? 'bg-navy text-gold shadow-md'
              : 'text-text-secondary hover:text-navy hover:bg-surface'
          }`}
        >
          <RiUserStarLine /> Join as Partner ({partnerCount})
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2.5 rounded-xl font-display font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'contact'
              ? 'bg-navy text-gold shadow-md'
              : 'text-text-secondary hover:text-navy hover:bg-surface'
          }`}
        >
          <RiMapPinLine /> Contact Desk ({contactCount})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-md">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-base" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, mobile, reference, location, area..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-bg text-navy text-xs font-semibold focus:border-gold focus:bg-surface focus:outline-hidden transition-all"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <RiFilter3Line className="text-text-muted text-base" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2.5 px-3.5 rounded-xl border border-border bg-bg text-navy text-xs font-bold focus:border-gold focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="new">New Inquiries</option>
            <option value="contacted">Contacted</option>
            <option value="in_progress">In Progress</option>
            <option value="closed_won">Closed / Converted</option>
            <option value="closed_lost">Closed / Lost</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Leads Table Card with Dynamic Headers per activeTab */}
      <div className="rounded-3xl bg-surface border border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg/60 text-2xs uppercase tracking-wider font-extrabold text-text-secondary">
                <th className="py-3.5 px-4">Ref ID & Date</th>
                
                {/* 1. Buy Property Tab Columns */}
                {activeTab === 'buy' && (
                  <>
                    <th className="py-3.5 px-4">Client Contact</th>
                    <th className="py-3.5 px-4">Property Type</th>
                    <th className="py-3.5 px-4">Area (Typing)</th>
                    <th className="py-3.5 px-4">Budget Range</th>
                    <th className="py-3.5 px-4">Location (Typing)</th>
                  </>
                )}

                {/* 2. Sell Property Tab Columns */}
                {activeTab === 'sell' && (
                  <>
                    <th className="py-3.5 px-4">Seller Contact</th>
                    <th className="py-3.5 px-4">Property Type</th>
                    <th className="py-3.5 px-4">Area (Typing)</th>
                    <th className="py-3.5 px-4">Amount / Expected</th>
                    <th className="py-3.5 px-4">Location (Typing)</th>
                  </>
                )}

                {/* 3. Join as Partner Tab Columns */}
                {activeTab === 'partner' && (
                  <>
                    <th className="py-3.5 px-4">Partner Contact</th>
                    <th className="py-3.5 px-4">Partner Category</th>
                    <th className="py-3.5 px-4">Deals In (Categories)</th>
                    <th className="py-3.5 px-4">Operating Area (Typing)</th>
                    <th className="py-3.5 px-4 text-center">OTP Status</th>
                  </>
                )}

                {/* 4. All Submissions / Contact Tab Columns */}
                {(activeTab === 'all' || activeTab === 'contact') && (
                  <>
                    <th className="py-3.5 px-4">Client Contact</th>
                    <th className="py-3.5 px-4">Category & Type</th>
                    <th className="py-3.5 px-4">Area & Location</th>
                    <th className="py-3.5 px-4">Budget / Amount</th>
                    <th className="py-3.5 px-4 text-center">Verification</th>
                  </>
                )}

                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Outreach & Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border text-xs font-semibold">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted font-bold">
                    <RiRefreshLine className="animate-spin text-2xl mx-auto mb-2 text-gold" />
                    Fetching submissions from MongoDB...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted font-bold">
                    No matching submissions found for this tab.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const refId = lead.referenceId || `ZJ-${lead._id?.slice(-6)?.toUpperCase()}`;
                  const name = lead.contact?.name || lead.name || lead.fullName || 'Client';
                  const mobile = lead.contact?.mobile || lead.phone || lead.mobile || 'N/A';
                  const propType = lead.propertyType || lead.buyDetails?.propertyType || 'Property';
                  const area = lead.area || 'Flexible';
                  const budget = lead.budget || lead.amount || lead.buyDetails?.budgetMax || 'Under 20 lac';
                  const amount = lead.amount || lead.budget || 'Open to Offer';
                  const location = lead.location || lead.locality || lead.address || 'Indore';
                  const partnerType = lead.partnerType || 'Broker';
                  const dealsIn = Array.isArray(lead.dealsIn)
                    ? lead.dealsIn.join(', ')
                    : lead.dealsIn || 'Plot, Flat';

                  return (
                    <tr
                      key={lead._id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-bg/40 transition-colors cursor-pointer group"
                    >
                      {/* Ref ID & Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-display font-extrabold text-navy group-hover:text-gold transition-colors block">
                          {refId}
                        </span>
                        <span className="text-2xs text-text-muted font-medium flex items-center gap-1 mt-0.5">
                          <RiCalendarLine className="text-3xs" />
                          {new Date(lead.createdAt || Date.now()).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </td>

                      {/* 1. BUY PROPERTY TAB CELLS */}
                      {activeTab === 'buy' && (
                        <>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-navy">{name}</div>
                            <div className="text-2xs text-text-secondary mt-0.5">+91 {mobile}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-lg bg-gold/15 text-gold border border-gold/30 font-bold text-xs capitalize">
                              {propType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-navy">
                            {area}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-gold font-bold">{formatBudgetDisplay(budget)}</span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-navy">
                            <span className="flex items-center gap-1">
                              <RiMapPinLine className="text-gold text-xs shrink-0" />
                              {location}
                            </span>
                          </td>
                        </>
                      )}

                      {/* 2. SELL PROPERTY TAB CELLS */}
                      {activeTab === 'sell' && (
                        <>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-navy">{name}</div>
                            <div className="text-2xs text-text-secondary mt-0.5">+91 {mobile}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-xs capitalize">
                              {propType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-navy">
                            {area}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <RiMoneyRupeeCircleLine className="text-sm shrink-0" />
                              {amount}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-navy">
                            <span className="flex items-center gap-1">
                              <RiMapPinLine className="text-gold text-xs shrink-0" />
                              {location}
                            </span>
                          </td>
                        </>
                      )}

                      {/* 3. JOIN AS PARTNER TAB CELLS */}
                      {activeTab === 'partner' && (
                        <>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-navy">{name}</div>
                            <div className="text-2xs text-text-secondary mt-0.5 flex items-center gap-1">
                              +91 {mobile}
                              {lead.mobileVerified && (
                                <span className="text-success font-bold" title="OTP Verified">✓</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-300 font-bold text-xs uppercase">
                              {partnerType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-navy max-w-xs truncate" title={dealsIn}>
                            {dealsIn}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-navy">
                            <span className="flex items-center gap-1">
                              <RiMapPinLine className="text-gold text-xs shrink-0" />
                              {area || location}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {lead.mobileVerified ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-success-light text-success text-2xs font-extrabold border border-success/30">
                                <RiShieldCheckLine /> Verified
                              </span>
                            ) : (
                              <span className="text-2xs text-text-muted">Unverified</span>
                            )}
                          </td>
                        </>
                      )}

                      {/* 4. ALL SUBMISSIONS / CONTACT TAB CELLS */}
                      {(activeTab === 'all' || activeTab === 'contact') && (
                        <>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-navy">{name}</div>
                            <div className="text-2xs text-text-secondary mt-0.5">+91 {mobile}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md text-2xs font-bold uppercase bg-bg border border-border">
                              {lead.category || 'Lead'}
                            </span>
                            <span className="block text-2xs text-text-muted mt-0.5 capitalize">
                              {lead.partnerType || propType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-navy text-xs">{location}</div>
                            {area && <span className="text-2xs text-text-muted">{area}</span>}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-gold font-bold">
                              {formatBudgetDisplay(lead.budget || lead.amount)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {lead.mobileVerified ? (
                              <span className="text-success font-bold text-xs" title="OTP Verified">✓ Verified</span>
                            ) : (
                              <span className="text-text-muted text-xs">—</span>
                            )}
                          </td>
                        </>
                      )}

                      {/* Interactive Status Selector */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.status || 'new'}
                          onChange={(e) => handleStatusSelect(lead._id, e.target.value, e)}
                          className={`py-1 px-2.5 rounded-xl border text-2xs font-extrabold focus:outline-hidden cursor-pointer ${
                            lead.status === 'closed_won'
                              ? 'bg-success-light text-success border-success/40'
                              : lead.status === 'in_progress'
                              ? 'bg-gold/15 text-gold border-gold/40'
                              : lead.status === 'contacted'
                              ? 'bg-navy/10 text-navy border-navy/20'
                              : 'bg-bg text-navy border-border'
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="in_progress">In Progress</option>
                          <option value="closed_won">Closed Won</option>
                          <option value="closed_lost">Closed Lost</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>

                      {/* Actions: WhatsApp, Call, View, Delete */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct WhatsApp */}
                          <a
                            href={getWhatsAppLink(lead)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Direct WhatsApp"
                            className="p-1.5 rounded-lg bg-success-light text-success hover:bg-success hover:text-white transition-all cursor-pointer"
                          >
                            <RiWhatsappLine className="text-base" />
                          </a>

                          {/* Direct Call */}
                          <a
                            href={`tel:${mobile}`}
                            title="Call"
                            className="p-1.5 rounded-lg bg-navy/5 text-navy hover:bg-navy hover:text-gold transition-all cursor-pointer"
                          >
                            <RiPhoneLine className="text-base" />
                          </a>

                          {/* View Modal */}
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="px-2.5 py-1.5 rounded-lg bg-navy text-gold hover:bg-navy-light font-display font-bold text-2xs flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                          >
                            <RiEyeLine className="text-sm" /> Details
                          </button>

                          {/* Delete */}
                          <button
                            onClick={(e) => handleDeleteLead(lead._id, name, e)}
                            className="p-1.5 rounded-lg text-danger hover:bg-danger-light transition-all cursor-pointer"
                            title="Delete"
                          >
                            <RiDeleteBin6Line className="text-base" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateSuccess={fetchLeads}
        />
      )}
    </div>
  );
};

export default Leads;
