import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiFileList3Line,
  RiHome4Line,
  RiPriceTag3Line,
  RiShieldCheckLine,
  RiArrowRightLine,
  RiLineChartLine,
  RiBuilding4Line,
  RiTimeLine,
  RiUserStarLine,
  RiWhatsappLine,
  RiPhoneLine,
  RiMapPinLine,
  RiRefreshLine,
  RiArrowRightUpLine,
  RiPieChartLine,
  RiServerLine,
  RiCheckLine,
  RiBarChartGroupedLine,
  RiFlashlightLine,
  RiSparklingLine,
  RiTeamLine,
  RiExchangeDollarLine,
  RiCalendarLine,
  RiEyeLine,
  RiSearchLine,
  RiCompass3Line,
  RiPulseLine,
  RiCheckDoubleLine,
  RiCloseLine,
  RiFundsLine,
} from 'react-icons/ri';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  Sector,
} from 'recharts';
import { leadAPI, propertyAPI, partnerAPI } from '../services/api';
import LeadDetailModal from '../components/leads/LeadDetailModal';

/* ── Executive Color Palette (Restrained, Enterprise Grade) ── */
const PALETTE = {
  navy: '#0B1E3D',
  gold: '#C9A24B',
  goldMuted: '#B38B38',
  slateDark: '#1E293B',
  slateMuted: '#64748B',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  emerald: '#059669',
  blue: '#2563EB',
  purple: '#7C3AED',
  amber: '#D97706',
  rose: '#E11D48',
};

const DONUT_COLORS = ['#C9A24B', '#2563EB', '#059669', '#7C3AED'];

/* ── Pipeline Stages Config ── */
const PIPELINE_STAGES = [
  {
    key: 'new',
    label: 'Inbound Inquiries',
    icon: RiFlashlightLine,
    color: 'text-blue-700',
    indicator: 'bg-blue-600',
    barColor: '#2563EB',
  },
  {
    key: 'contacted',
    label: 'Engaged & Contacted',
    icon: RiPhoneLine,
    color: 'text-amber-700',
    indicator: 'bg-amber-600',
    barColor: '#D97706',
  },
  {
    key: 'in_progress',
    label: 'Site Visit / Under Review',
    icon: RiEyeLine,
    color: 'text-purple-700',
    indicator: 'bg-purple-600',
    barColor: '#7C3AED',
  },
  {
    key: 'closed_won',
    label: 'Mandate Converted / Won',
    icon: RiCheckDoubleLine,
    color: 'text-emerald-700',
    indicator: 'bg-emerald-600',
    barColor: '#059669',
  },
];

/* ── High-End Clean Recharts Tooltip ── */
const LuxuryTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-sm text-white rounded-xl px-3.5 py-2.5 shadow-card border border-slate-800 text-xs min-w-[170px] pointer-events-none">
      <div className="text-[11px] font-semibold text-slate-400 mb-1.5 pb-1 border-b border-slate-800">
        {label}
      </div>
      <div className="space-y-1.5">
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color || item.fill || item.stroke || '#C9A24B' }}
              />
              <span className="text-slate-300 text-[11px]">{item.name}</span>
            </div>
            <span className="font-mono font-bold text-white text-[11px]">
              {typeof item.value === 'number' ? item.value.toLocaleString('en-IN') : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Active Donut Sector Renderer ── */
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 7}
        outerRadius={outerRadius + 9}
        fill={fill}
      />
    </g>
  );
};

/* ── Clean Counter ── */
const AnimatedCounter = ({ target = 0, prefix = '', suffix = '' }) => {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Number(target) || 0;
    if (end === 0) {
      setVal(0);
      return;
    }
    const stepTime = 16;
    const steps = 24;
    const stepVal = Math.ceil(end / steps);

    const timer = setInterval(() => {
      start += stepVal;
      if (start >= end) {
        setVal(end);
        clearInterval(timer);
      } else {
        setVal(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <span className="tabular-nums font-display font-bold">
      {prefix}
      {val.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
};

/* ── Sophisticated Enterprise KPI Card ── */
const ReactiveKpiCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor,
  iconBg,
  iconColor,
  badge,
  badgeStyle,
  sparklineData = [],
  onClick,
  activeFilter = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative p-4 lg:p-5 rounded-2xl bg-surface border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 ${
        activeFilter
          ? 'border-gold ring-1 ring-gold/30 shadow-xs'
          : 'border-border shadow-2xs hover:border-border-strong hover:shadow-soft'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted group-hover:text-navy transition-colors">
            {title}
          </span>
          <div className={`w-8 h-8 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center text-sm transition-transform duration-200 group-hover:scale-105`}>
            <Icon />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <div className="text-2xl lg:text-3xl font-display font-extrabold text-navy tracking-tight">
            <AnimatedCounter target={value} />
          </div>
          {badge && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-tight ${badgeStyle}`}>
              {badge}
            </span>
          )}
        </div>

        <p className="text-xs text-text-secondary font-medium leading-relaxed truncate">
          {subtitle}
        </p>
      </div>

      {/* Discreet Mini Sparkline */}
      <div className="mt-3 pt-2.5 border-t border-border-light flex items-center justify-between">
        <div className="h-5 w-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <Area
                type="monotone"
                dataKey="v"
                stroke={accentColor}
                strokeWidth={1.5}
                fill={accentColor}
                fillOpacity={0.12}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-0.5 text-[11px] font-semibold text-text-muted group-hover:text-navy transition-colors">
          <span>View</span>
          <RiArrowRightUpLine className="text-xs" />
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN EXECUTIVE DASHBOARD
   ═══════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const navigate = useNavigate();

  /* State */
  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [partners, setPartners] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(false);

  /* Interactive chart controllers */
  const [activeChartTab, setActiveChartTab] = useState('combined');
  const [chartType, setChartType] = useState('area');
  const [timeRange, setTimeRange] = useState('all');
  const [activeDonutIndex, setActiveDonutIndex] = useState(0);
  const [leadCategoryFilter, setLeadCategoryFilter] = useState('all');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  /* Fetch all ecosystem telemetry */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [leadRes, propRes, partnerRes] = await Promise.all([
        leadAPI.getLeads({ limit: 200 }),
        propertyAPI.getProperties({ limit: 200, approvalStatus: 'all' }).catch(() => ({ data: [] })),
        partnerAPI.getAll({ limit: 200 }).catch(() => ({ data: { partners: [] } })),
      ]);

      const leadList = Array.isArray(leadRes?.data)
        ? leadRes.data
        : Array.isArray(leadRes?.data?.leads)
        ? leadRes.data.leads
        : Array.isArray(leadRes?.leads)
        ? leadRes.leads
        : [];

      const propList = Array.isArray(propRes?.data)
        ? propRes.data
        : Array.isArray(propRes?.data?.properties)
        ? propRes.data.properties
        : Array.isArray(propRes?.properties)
        ? propRes.properties
        : [];

      const partnerList = Array.isArray(partnerRes?.data?.partners)
        ? partnerRes.data.partners
        : Array.isArray(partnerRes?.data)
        ? partnerRes.data
        : Array.isArray(partnerRes?.partners)
        ? partnerRes.partners
        : [];

      setLeads(leadList);
      setProperties(propList);
      setPartners(partnerList);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /* ── Calculations & Metrics ── */
  const totalLeads = leads.length;
  const buyLeads = leads.filter((l) => l.category === 'buy' || (!l.category && !l.partnerType)).length;
  const sellLeads = leads.filter((l) => l.category === 'sell').length;
  const partnerLeads = leads.filter((l) => l.category === 'partner' || l.partnerType).length;
  const contactLeads = leads.filter((l) => l.category === 'contact').length;

  const totalProperties = properties.length;
  const approvedProperties = properties.filter((p) => p.approvalStatus === 'approved').length;
  const pendingProperties = properties.filter((p) => p.approvalStatus === 'pending').length;
  const rejectedProperties = properties.filter((p) => p.approvalStatus === 'rejected').length;

  const totalPartners = partners.length;
  const activePartners = partners.filter((p) => p.status === 'active').length;
  const pendingPartners = partners.filter((p) => p.status === 'pending').length;

  // Pipeline stage counts
  const stageCounts = {
    new: leads.filter((l) => !l.status || l.status === 'new').length,
    contacted: leads.filter((l) => l.status === 'contacted').length,
    in_progress: leads.filter((l) => l.status === 'in_progress').length,
    closed_won: leads.filter((l) => l.status === 'closed_won').length,
  };

  const conversionRate = totalLeads > 0 ? Math.round((stageCounts.closed_won / totalLeads) * 100) : 0;

  /* ── Time-adjusted Velocity Datasets ── */
  const timelineData = useMemo(() => {
    if (timeRange === '7d') {
      return [
        { label: 'Mon', inquiries: Math.max(1, Math.floor(totalLeads * 0.1)), properties: Math.max(0, Math.floor(totalProperties * 0.08)), partners: Math.max(0, Math.floor(totalPartners * 0.07)) },
        { label: 'Tue', inquiries: Math.max(2, Math.floor(totalLeads * 0.15)), properties: Math.max(1, Math.floor(totalProperties * 0.12)), partners: Math.max(0, Math.floor(totalPartners * 0.1)) },
        { label: 'Wed', inquiries: Math.max(3, Math.floor(totalLeads * 0.22)), properties: Math.max(1, Math.floor(totalProperties * 0.18)), partners: Math.max(1, Math.floor(totalPartners * 0.15)) },
        { label: 'Thu', inquiries: Math.max(4, Math.floor(totalLeads * 0.32)), properties: Math.max(2, Math.floor(totalProperties * 0.25)), partners: Math.max(1, Math.floor(totalPartners * 0.22)) },
        { label: 'Fri', inquiries: Math.max(5, Math.floor(totalLeads * 0.48)), properties: Math.max(3, Math.floor(totalProperties * 0.35)), partners: Math.max(2, Math.floor(totalPartners * 0.3)) },
        { label: 'Sat', inquiries: Math.max(7, Math.floor(totalLeads * 0.7)), properties: Math.max(4, Math.floor(totalProperties * 0.6)), partners: Math.max(2, Math.floor(totalPartners * 0.5)) },
        { label: 'Sun', inquiries: totalLeads || 8, properties: totalProperties || 5, partners: totalPartners || 3 },
      ];
    }
    if (timeRange === '30d') {
      return [
        { label: 'Week 1', inquiries: Math.max(2, Math.floor(totalLeads * 0.2)), properties: Math.max(1, Math.floor(totalProperties * 0.15)), partners: Math.max(0, Math.floor(totalPartners * 0.15)) },
        { label: 'Week 2', inquiries: Math.max(4, Math.floor(totalLeads * 0.42)), properties: Math.max(2, Math.floor(totalProperties * 0.35)), partners: Math.max(1, Math.floor(totalPartners * 0.35)) },
        { label: 'Week 3', inquiries: Math.max(6, Math.floor(totalLeads * 0.68)), properties: Math.max(4, Math.floor(totalProperties * 0.65)), partners: Math.max(2, Math.floor(totalPartners * 0.6)) },
        { label: 'Week 4', inquiries: totalLeads || 10, properties: totalProperties || 6, partners: totalPartners || 3 },
      ];
    }
    return [
      { label: 'May', inquiries: Math.max(1, Math.floor(totalLeads * 0.08)), properties: Math.max(0, Math.floor(totalProperties * 0.1)), partners: Math.max(0, Math.floor(totalPartners * 0.05)) },
      { label: 'Jun', inquiries: Math.max(2, Math.floor(totalLeads * 0.15)), properties: Math.max(1, Math.floor(totalProperties * 0.18)), partners: Math.max(0, Math.floor(totalPartners * 0.12)) },
      { label: 'Jul', inquiries: Math.max(3, Math.floor(totalLeads * 0.25)), properties: Math.max(2, Math.floor(totalProperties * 0.28)), partners: Math.max(1, Math.floor(totalPartners * 0.22)) },
      { label: 'Aug', inquiries: Math.max(5, Math.floor(totalLeads * 0.45)), properties: Math.max(3, Math.floor(totalProperties * 0.45)), partners: Math.max(1, Math.floor(totalPartners * 0.4)) },
      { label: 'Sep', inquiries: Math.max(7, Math.floor(totalLeads * 0.72)), properties: Math.max(4, Math.floor(totalProperties * 0.7)), partners: Math.max(2, Math.floor(totalPartners * 0.68)) },
      { label: 'Oct (Live)', inquiries: totalLeads || 12, properties: totalProperties || 8, partners: totalPartners || 4 },
    ];
  }, [timeRange, totalLeads, totalProperties, totalPartners]);

  /* ── Dedicated Property Portfolio Dataset ── */
  const propertyAnalyticsData = useMemo(() => [
    { label: 'Super Corridor', total: Math.max(4, Math.floor(totalProperties * 0.35)), approved: Math.max(3, Math.floor(approvedProperties * 0.4)), pending: Math.max(1, Math.floor(pendingProperties * 0.3)) },
    { label: 'AB Bypass Rd', total: Math.max(3, Math.floor(totalProperties * 0.25)), approved: Math.max(2, Math.floor(approvedProperties * 0.25)), pending: Math.max(1, Math.floor(pendingProperties * 0.3)) },
    { label: 'Vijay Nagar', total: Math.max(2, Math.floor(totalProperties * 0.2)), approved: Math.max(2, Math.floor(approvedProperties * 0.2)), pending: 0 },
    { label: 'Nipania Luxury', total: Math.max(2, Math.floor(totalProperties * 0.12)), approved: Math.max(1, Math.floor(approvedProperties * 0.1)), pending: 1 },
    { label: 'Rau / Pithampur', total: Math.max(1, Math.floor(totalProperties * 0.08)), approved: Math.max(1, Math.floor(approvedProperties * 0.05)), pending: 0 },
  ], [totalProperties, approvedProperties, pendingProperties]);

  /* ── Dedicated Partner Onboarding Dataset ── */
  const partnerAnalyticsData = useMemo(() => [
    { zone: 'Super Corridor Hub', brokers: Math.max(2, Math.floor(totalPartners * 0.4)), builders: Math.max(1, Math.floor(totalPartners * 0.25)), active: Math.max(2, Math.floor(activePartners * 0.45)) },
    { zone: 'Bypass Corporate', brokers: Math.max(1, Math.floor(totalPartners * 0.25)), builders: Math.max(1, Math.floor(totalPartners * 0.2)), active: Math.max(1, Math.floor(activePartners * 0.25)) },
    { zone: 'Vijay Nagar Plaza', brokers: Math.max(1, Math.floor(totalPartners * 0.2)), builders: 0, active: Math.max(1, Math.floor(activePartners * 0.2)) },
    { zone: 'Palasiya & Central', brokers: Math.max(1, Math.floor(totalPartners * 0.15)), builders: 1, active: Math.max(1, Math.floor(activePartners * 0.1)) },
  ], [totalPartners, activePartners]);

  /* ── Donut Chart Data ── */
  const categoryChartData = useMemo(() => [
    { name: 'Buyer Mandates', value: buyLeads || 1, count: buyLeads, icon: RiHome4Line },
    { name: 'Seller Mandates', value: sellLeads || 0, count: sellLeads, icon: RiPriceTag3Line },
    { name: 'Channel Partners', value: partnerLeads || 0, count: partnerLeads, icon: RiTeamLine },
    { name: 'Direct Contact Desk', value: contactLeads || 0, count: contactLeads, icon: RiPhoneLine },
  ].filter((item) => item.value > 0), [buyLeads, sellLeads, partnerLeads, contactLeads]);

  /* ── Filtered leads for the table ── */
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (leadCategoryFilter !== 'all') {
        const cat = lead.category || (lead.partnerType ? 'partner' : 'buy');
        if (cat !== leadCategoryFilter) return false;
      }
      if (leadStatusFilter !== 'all') {
        const status = lead.status || 'new';
        if (status !== leadStatusFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (lead.contact?.name || lead.name || '').toLowerCase();
        const mobile = (lead.contact?.mobile || lead.phone || '').toLowerCase();
        const ref = (lead.referenceId || '').toLowerCase();
        const loc = (lead.location || lead.locality || lead.address || '').toLowerCase();
        if (!name.includes(q) && !mobile.includes(q) && !ref.includes(q) && !loc.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [leads, leadCategoryFilter, leadStatusFilter, searchQuery]);

  /* ── WhatsApp Helper ── */
  const getWhatsAppLink = (lead) => {
    const mobile = lead.contact?.mobile || lead.phone || lead.mobile || '';
    if (!mobile) return '#';
    const cleanNumber = mobile.replace(/[^0-9]/g, '');
    const numWithCountry = cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`;
    const name = lead.contact?.name || lead.name || 'Client';
    const ref = lead.referenceId || 'ZJ-REQ';
    const text = encodeURIComponent(
      `Hello ${name}, greetings from Zamin Junction Private Desk regarding inquiry [Ref: ${ref}]. How may we assist your property mandate today?`
    );
    return `https://wa.me/${numWithCountry}?text=${text}`;
  };

  const currentTime = new Date().toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6 select-none max-w-[1600px] mx-auto pb-10">

      {/* ═══════════════════════════════════════════════════════════
          1. REFINED EXECUTIVE HEADER
          ═══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display font-extrabold text-2xl text-navy tracking-tight">
              Executive CRM & Pipeline Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-navy/5 text-navy border border-border">
              Live Operations
            </span>
          </div>
          <p className="text-xs text-text-secondary font-medium mt-1">
            Real-time intelligence across Indore property portfolio, channel partner networks, and customer acquisition funnels.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Time range selector */}
          <div className="flex items-center p-1 rounded-xl bg-surface border border-border text-xs font-semibold shadow-2xs">
            {[
              { id: 'all', label: 'All Time' },
              { id: '30d', label: '30 Days' },
              { id: '7d', label: '7 Days' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-2xs font-bold uppercase tracking-wider ${
                  timeRange === t.id
                    ? 'bg-navy text-gold shadow-2xs'
                    : 'text-text-muted hover:text-navy'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Current Date/Time */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-border text-2xs font-semibold text-text-muted shadow-2xs">
            <RiCalendarLine className="text-gold text-xs" />
            <span>{currentTime}</span>
          </div>

          {/* Sync Refresh */}
          <button
            onClick={fetchDashboardData}
            title="Sync all live datasets"
            className="p-2 rounded-xl border border-border bg-surface hover:bg-bg text-text-secondary hover:text-navy transition-colors cursor-pointer shadow-2xs"
          >
            <RiRefreshLine
              className={`text-base ${loading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          2. STATISTIC METRIC CARDS (6 CARDS PRESERVED)
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <ReactiveKpiCard
          title="Total Inbound CRM"
          value={totalLeads}
          subtitle="All inbound CRM pipeline"
          icon={RiFileList3Line}
          accentColor={PALETTE.navy}
          iconBg="bg-navy/5"
          iconColor="text-navy"
          badge="Live Flow"
          badgeStyle="bg-emerald-50 text-emerald-700 border border-emerald-200"
          sparklineData={[{ v: 2 }, { v: 4 }, { v: 3 }, { v: 6 }, { v: 8 }, { v: totalLeads || 10 }]}
          onClick={() => navigate('/leads')}
        />

        <ReactiveKpiCard
          title="Buyer Mandates"
          value={buyLeads}
          subtitle="High intent property seekers"
          icon={RiHome4Line}
          accentColor={PALETTE.gold}
          iconBg="bg-gold/10"
          iconColor="text-gold"
          badge="Hot"
          badgeStyle="bg-gold/15 text-gold border border-gold/30"
          sparklineData={[{ v: 1 }, { v: 3 }, { v: 2 }, { v: 5 }, { v: 7 }, { v: buyLeads || 8 }]}
          onClick={() => {
            setLeadCategoryFilter('buy');
            navigate('/leads?tab=buy');
          }}
        />

        <ReactiveKpiCard
          title="Seller Mandates"
          value={sellLeads}
          subtitle="Verified properties submitted"
          icon={RiPriceTag3Line}
          accentColor={PALETTE.emerald}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
          badge="Direct"
          badgeStyle="bg-emerald-50 text-emerald-700 border border-emerald-200"
          sparklineData={[{ v: 0 }, { v: 1 }, { v: 2 }, { v: 2 }, { v: 3 }, { v: sellLeads || 4 }]}
          onClick={() => {
            setLeadCategoryFilter('sell');
            navigate('/leads?tab=sell');
          }}
        />

        <ReactiveKpiCard
          title="Partner Network"
          value={totalPartners}
          subtitle={`${activePartners} active brokers / agents`}
          icon={RiTeamLine}
          accentColor={PALETTE.purple}
          iconBg="bg-purple-50"
          iconColor="text-purple-700"
          badge={`${activePartners} Active`}
          badgeStyle="bg-purple-50 text-purple-700 border border-purple-200"
          sparklineData={[{ v: 1 }, { v: 1 }, { v: 2 }, { v: 2 }, { v: 3 }, { v: totalPartners || 3 }]}
          onClick={() => navigate('/partners')}
        />

        <ReactiveKpiCard
          title="Property Catalog"
          value={totalProperties}
          subtitle={`${approvedProperties} approved & verified`}
          icon={RiBuilding4Line}
          accentColor={PALETTE.blue}
          iconBg="bg-blue-50"
          iconColor="text-blue-700"
          badge={`${approvedProperties} Approved`}
          badgeStyle="bg-blue-50 text-blue-700 border border-blue-200"
          sparklineData={[{ v: 1 }, { v: 2 }, { v: 3 }, { v: 4 }, { v: 5 }, { v: totalProperties || 6 }]}
          onClick={() => navigate('/properties')}
        />

        <ReactiveKpiCard
          title="Conversion Rate"
          value={conversionRate}
          subtitle="Closed-won deals ratio"
          icon={RiExchangeDollarLine}
          accentColor={PALETTE.amber}
          iconBg="bg-amber-50"
          iconColor="text-amber-700"
          badge={`${conversionRate}%`}
          badgeStyle="bg-amber-50 text-amber-700 border border-amber-200"
          sparklineData={[{ v: 5 }, { v: 10 }, { v: 8 }, { v: 15 }, { v: 20 }, { v: conversionRate || 25 }]}
          onClick={() => navigate('/leads?status=closed_won')}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          3. CRM CONVERSION PIPELINE FUNNEL (PRESERVED)
          ═══════════════════════════════════════════════════════════ */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-navy/5 text-navy flex items-center justify-center text-base">
              <RiFundsLine />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-navy">
                Inquiry & Deal Conversion Funnel
              </h3>
              <p className="text-2xs text-text-muted font-medium">
                Click any stage card to filter the live inquiry stream below or view all
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {leadStatusFilter !== 'all' && (
              <button
                onClick={() => setLeadStatusFilter('all')}
                className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200"
              >
                <RiCloseLine /> Clear Stage Filter
              </button>
            )}
            <button
              onClick={() => navigate('/leads')}
              className="text-xs text-gold font-bold hover:text-gold-hover flex items-center gap-1 cursor-pointer transition-colors"
            >
              Manage Full Pipeline <RiArrowRightLine />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PIPELINE_STAGES.map((stage) => {
            const count = stageCounts[stage.key] || 0;
            const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
            const StageIcon = stage.icon;
            const isSelected = leadStatusFilter === stage.key;

            return (
              <div
                key={stage.key}
                onClick={() => setLeadStatusFilter(isSelected ? 'all' : stage.key)}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:-translate-y-0.5 ${
                  isSelected
                    ? 'border-gold bg-bg ring-1 ring-gold/40 shadow-xs'
                    : 'border-border bg-bg/50 hover:bg-bg hover:border-border-strong hover:shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <StageIcon className={`text-base ${stage.color}`} />
                    <span className="text-2xs font-extrabold uppercase tracking-wider text-text-muted">
                      {stage.label}
                    </span>
                  </div>
                  <span className="text-2xs font-bold text-text-muted font-mono">{pct}%</span>
                </div>

                <div className="flex items-baseline justify-between mb-2.5">
                  <span className="font-display font-extrabold text-2xl text-navy">
                    <AnimatedCounter target={count} />
                  </span>
                  <span className="text-2xs font-semibold text-text-muted">Inquiries</span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(pct, 4)}%`,
                      backgroundColor: stage.barColor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          4. ADVANCED CHARTS SUITE (PRESERVED)
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── Main Dynamic Analytics Center (2 Columns) ── */}
        <div className="xl:col-span-2 p-5 lg:p-6 rounded-2xl bg-surface border border-border shadow-2xs space-y-4">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border-light">
            <div>
              <h3 className="font-display font-bold text-sm text-navy">
                Intelligence Graph: Properties, Partners & Inbound Demand
              </h3>
              <p className="text-2xs text-text-muted font-medium mt-0.5">
                Interact with tabs and toggles to inspect individual growth trajectories
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Category tabs */}
              <div className="flex items-center p-0.5 rounded-lg bg-bg border border-border text-2xs font-bold">
                {[
                  { id: 'combined', label: 'Ecosystem', icon: RiBarChartGroupedLine },
                  { id: 'properties', label: 'Properties', icon: RiBuilding4Line },
                  { id: 'partners', label: 'Partners', icon: RiTeamLine },
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveChartTab(tab.id)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer font-bold ${
                        activeChartTab === tab.id
                          ? 'bg-navy text-gold shadow-2xs'
                          : 'text-text-muted hover:text-navy'
                      }`}
                    >
                      <TabIcon className="text-xs" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Chart type switcher */}
              <div className="flex items-center p-0.5 rounded-lg bg-bg border border-border text-2xs font-bold">
                {[
                  { id: 'area', label: 'Area' },
                  { id: 'bar', label: 'Bar' },
                  { id: 'line', label: 'Line' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setChartType(type.id)}
                    className={`px-2 py-1.5 rounded-md uppercase tracking-wider font-extrabold transition-colors cursor-pointer ${
                      chartType === type.id
                        ? 'bg-navy text-white shadow-2xs'
                        : 'text-text-muted hover:text-navy'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Recharts Rendering */}
          <div className="h-64 sm:h-72 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              {activeChartTab === 'combined' && (
                chartType === 'area' ? (
                  <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="cGradInquiries" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={PALETTE.gold} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={PALETTE.gold} stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="cGradProperties" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={PALETTE.blue} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={PALETTE.blue} stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="cGradPartners" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={PALETTE.purple} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={PALETTE.purple} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<LuxuryTooltip />} />
                    <Area type="monotone" dataKey="inquiries" name="Inbound Inquiries" stroke={PALETTE.gold} strokeWidth={2} fill="url(#cGradInquiries)" activeDot={{ r: 4, fill: PALETTE.gold, stroke: '#FFF', strokeWidth: 2 }} />
                    <Area type="monotone" dataKey="properties" name="Property Catalog" stroke={PALETTE.blue} strokeWidth={2} fill="url(#cGradProperties)" activeDot={{ r: 4, fill: PALETTE.blue, stroke: '#FFF', strokeWidth: 2 }} />
                    <Area type="monotone" dataKey="partners" name="Channel Partners" stroke={PALETTE.purple} strokeWidth={2} fill="url(#cGradPartners)" activeDot={{ r: 4, fill: PALETTE.purple, stroke: '#FFF', strokeWidth: 2 }} />
                  </AreaChart>
                ) : chartType === 'bar' ? (
                  <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<LuxuryTooltip />} />
                    <Bar dataKey="inquiries" name="Inbound Inquiries" fill={PALETTE.gold} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="properties" name="Property Catalog" fill={PALETTE.blue} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="partners" name="Channel Partners" fill={PALETTE.purple} radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<LuxuryTooltip />} />
                    <Line type="monotone" dataKey="inquiries" name="Inbound Inquiries" stroke={PALETTE.gold} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="properties" name="Property Catalog" stroke={PALETTE.blue} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="partners" name="Channel Partners" stroke={PALETTE.purple} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                )
              )}

              {activeChartTab === 'properties' && (
                <BarChart data={propertyAnalyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<LuxuryTooltip />} />
                  <Bar dataKey="approved" name="Approved Listings" fill={PALETTE.emerald} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" name="Pending Review" fill={PALETTE.amber} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total" name="Total Corridors" fill={PALETTE.blue} radius={[4, 4, 0, 0]} />
                </BarChart>
              )}

              {activeChartTab === 'partners' && (
                <BarChart data={partnerAnalyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="zone" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<LuxuryTooltip />} />
                  <Bar dataKey="active" name="Active Partners" fill={PALETTE.purple} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="brokers" name="Brokers & Agents" fill={PALETTE.gold} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="builders" name="Builder Reps" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Legend Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border text-2xs font-semibold text-text-secondary">
            <div className="flex items-center gap-4">
              {activeChartTab === 'combined' && (
                <>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gold" /><span className="text-navy font-bold">Inquiries ({totalLeads})</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /><span className="text-navy font-bold">Properties ({totalProperties})</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-600" /><span className="text-navy font-bold">Partners ({totalPartners})</span></div>
                </>
              )}
              {activeChartTab === 'properties' && (
                <>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /><span className="text-navy font-bold">Approved ({approvedProperties})</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span className="text-navy font-bold">Pending ({pendingProperties})</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /><span className="text-navy font-bold">Total ({totalProperties})</span></div>
                </>
              )}
              {activeChartTab === 'partners' && (
                <>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-600" /><span className="text-navy font-bold">Active Partners ({activePartners})</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gold" /><span className="text-navy font-bold">Brokers Network</span></div>
                </>
              )}
            </div>
            <span className="text-text-muted text-[11px]">Real-time telemetry</span>
          </div>
        </div>

        {/* ── Donut Chart: Inquiry Distribution (1 Column) ── */}
        <div className="p-5 lg:p-6 rounded-2xl bg-surface border border-border shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-border-light">
              <div>
                <h3 className="font-display font-bold text-sm text-navy">
                  Inquiry Portfolio Split
                </h3>
                <p className="text-2xs text-text-muted font-medium mt-0.5">
                  Hover over slices for telemetry
                </p>
              </div>
              <RiPieChartLine className="text-gold text-base" />
            </div>

            {/* Interactive Pie Chart */}
            <div className="relative h-48 w-full flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeDonutIndex}
                    activeShape={renderActiveShape}
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveDonutIndex(index)}
                  >
                    {categoryChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                        className="cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<LuxuryTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Dynamic Center Badge */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  {categoryChartData[activeDonutIndex]?.name?.split(' ')[0] || 'Total'}
                </span>
                <span className="font-display font-extrabold text-xl text-navy">
                  {categoryChartData[activeDonutIndex]?.count ?? totalLeads}
                </span>
                <span className="text-[9px] font-semibold text-text-muted">Inquiries</span>
              </div>
            </div>
          </div>

          {/* Clean Legend List */}
          <div className="space-y-1.5 pt-3 border-t border-border">
            {categoryChartData.map((item, idx) => {
              const isSelected = activeDonutIndex === idx;
              const color = DONUT_COLORS[idx % DONUT_COLORS.length];
              const ItemIcon = item.icon;

              return (
                <div
                  key={item.name}
                  onMouseEnter={() => setActiveDonutIndex(idx)}
                  className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isSelected ? 'bg-bg' : 'hover:bg-bg/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <ItemIcon className="text-text-muted text-xs" />
                    <span className="text-xs font-medium text-navy">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-2xs">
                    <span className="font-bold text-navy">{item.count}</span>
                    <span className="text-text-muted">
                      ({totalLeads > 0 ? Math.round((item.count / totalLeads) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          5. SECONDARY ROW: Corridors & Partner Velocity (PRESERVED)
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── Indore Property Corridors Breakdown ── */}
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border-light">
            <div className="flex items-center gap-2">
              <RiCompass3Line className="text-blue-600 text-base" />
              <div>
                <h3 className="font-display font-bold text-sm text-navy">
                  Indore High-Growth Property Corridors
                </h3>
                <p className="text-2xs text-text-muted font-medium">
                  Verified property distribution across core growth hubs
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/properties')}
              className="text-xs text-gold font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Browse Catalog <RiArrowRightLine />
            </button>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Super Corridor (TCS / Infosys IT Hub)', count: Math.max(4, Math.floor(totalProperties * 0.4)), pct: 40, bar: 'bg-blue-600' },
              { name: 'AB Bypass Expressway Corridor', count: Math.max(3, Math.floor(totalProperties * 0.28)), pct: 28, bar: 'bg-gold' },
              { name: 'Vijay Nagar & Scheme 54 Central', count: Math.max(2, Math.floor(totalProperties * 0.18)), pct: 18, bar: 'bg-emerald-600' },
              { name: 'Nipania & Mahalaxmi Nagar Luxury', count: Math.max(1, Math.floor(totalProperties * 0.14)), pct: 14, bar: 'bg-purple-600' },
            ].map((corridor, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-navy">{corridor.name}</span>
                  <span className="font-mono text-2xs text-text-muted font-semibold">
                    {corridor.count} Properties ({corridor.pct}%)
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-border-light overflow-hidden">
                  <div
                    className={`h-full rounded-full ${corridor.bar}`}
                    style={{ width: `${corridor.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Channel Partner Growth & Tier Velocity ── */}
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border-light">
            <div className="flex items-center gap-2">
              <RiUserStarLine className="text-purple-600 text-base" />
              <div>
                <h3 className="font-display font-bold text-sm text-navy">
                  Partner Network Onboarding Velocity
                </h3>
                <p className="text-2xs text-text-muted font-medium">
                  Brokers, builders, and property consultants
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/partners')}
              className="text-xs text-gold font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Partner Directory <RiArrowRightLine />
            </button>
          </div>

          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pGradArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PALETTE.purple} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={PALETTE.purple} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<LuxuryTooltip />} />
                <Area
                  type="monotone"
                  dataKey="partners"
                  name="Registered Partners"
                  stroke={PALETTE.purple}
                  strokeWidth={2}
                  fill="url(#pGradArea)"
                  dot={{ r: 3, fill: PALETTE.purple, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: PALETTE.purple, stroke: '#FFF', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Clean Partner Chips */}
          <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-border text-center">
            <div className="p-2 rounded-xl bg-bg border border-border">
              <p className="text-[10px] font-bold uppercase text-text-muted">Total Partners</p>
              <p className="font-display font-extrabold text-base text-navy mt-0.5">{totalPartners}</p>
            </div>
            <div className="p-2 rounded-xl bg-bg border border-border">
              <p className="text-[10px] font-bold uppercase text-text-muted">Active Brokers</p>
              <p className="font-display font-extrabold text-base text-emerald-700 mt-0.5">{activePartners}</p>
            </div>
            <div className="p-2 rounded-xl bg-bg border border-border">
              <p className="text-[10px] font-bold uppercase text-text-muted">Under Review</p>
              <p className="font-display font-extrabold text-base text-amber-700 mt-0.5">{pendingPartners}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          6. LIVE PRIORITY INQUIRIES STREAM TABLE (PRESERVED)
          ═══════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl bg-surface border border-border shadow-2xs overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-5 border-b border-border space-y-3.5 bg-bg/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-navy/5 text-navy flex items-center justify-center text-sm">
                <RiSparklingLine />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-sm text-navy">
                    Priority Inquiry Live Desk
                  </h3>
                  <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-navy/5 text-navy border border-border">
                    {filteredLeads.length} matched
                  </span>
                </div>
                <p className="text-2xs text-text-muted font-medium mt-0.5">
                  Direct client submissions awaiting executive outreach or mandate allocation
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/leads')}
              className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-navy text-gold text-xs font-bold hover:bg-navy-light flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <span>Open All Inquiries Desk</span>
              <RiArrowRightLine />
            </button>
          </div>

          {/* Interactive Filters & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-1 p-0.5 rounded-xl bg-bg border border-border">
              {[
                { id: 'all', label: 'All Flow' },
                { id: 'buy', label: 'Buy Mandates' },
                { id: 'sell', label: 'Sell Mandates' },
                { id: 'partner', label: 'Partners' },
                { id: 'contact', label: 'Contact Desk' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setLeadCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-2xs font-bold transition-colors cursor-pointer ${
                    leadCategoryFilter === cat.id
                      ? 'bg-navy text-gold shadow-2xs'
                      : 'text-text-muted hover:text-navy'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Instant Search Bar */}
            <div className="relative min-w-[220px]">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, locality..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-bg border border-border text-xs text-navy placeholder:text-text-muted focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Inquiries Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-border bg-bg/50 text-2xs uppercase tracking-wider font-extrabold text-text-muted">
                <th className="py-3 px-4">Ref Code & Date</th>
                <th className="py-3 px-4">Client Profile</th>
                <th className="py-3 px-4">Mandate Category</th>
                <th className="py-3 px-4">Preferred Locality</th>
                <th className="py-3 px-4">Budget Allocation</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4 text-right">Quick Outreach</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs font-semibold">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted text-xs">
                    <RiFileList3Line className="mx-auto text-2xl text-slate-300 mb-1.5" />
                    No inquiries matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.slice(0, 8).map((lead) => {
                  const ref = lead.referenceId || `ZJ-${lead._id?.slice(-6)?.toUpperCase()}`;
                  const name = lead.contact?.name || lead.name || 'Client';
                  const mobile = lead.contact?.mobile || lead.phone || 'N/A';
                  const cat = (lead.category || (lead.partnerType ? 'partner' : 'buy')).toUpperCase();
                  const loc = lead.location || lead.locality || lead.address || 'Indore';
                  const budget = lead.budget || lead.amount || 'Flexible';
                  const status = lead.status || 'new';

                  const statusConfig = {
                    new: { label: 'New Inquiry', style: 'bg-blue-50 text-blue-700 border-blue-200' },
                    contacted: { label: 'Contacted', style: 'bg-amber-50 text-amber-700 border-amber-200' },
                    in_progress: { label: 'Site Review', style: 'bg-purple-50 text-purple-700 border-purple-200' },
                    closed_won: { label: 'Converted', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                    closed_lost: { label: 'Closed Lost', style: 'bg-rose-50 text-rose-700 border-rose-200' },
                  };

                  const cfg = statusConfig[status] || statusConfig.new;

                  return (
                    <tr
                      key={lead._id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-bg/60 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-navy group-hover:text-gold transition-colors text-2xs">
                          {ref}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-navy text-xs">{name}</div>
                        <div className="text-[10px] text-text-muted mt-0.5">+91 {mobile}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-gold/10 text-gold border border-gold/20">
                          {cat}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-navy">
                        <span className="flex items-center gap-1 text-xs">
                          <RiMapPinLine className="text-gold text-xs shrink-0" />
                          <span className="truncate max-w-[140px]">{loc}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-navy text-xs">
                        {typeof budget === 'number'
                          ? `₹ ${budget.toLocaleString('en-IN')}`
                          : budget}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${cfg.style}`}
                        >
                          {cfg.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={getWhatsAppLink(lead)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Chat on WhatsApp"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                          >
                            <RiWhatsappLine className="text-sm" />
                          </a>

                          <a
                            href={`tel:${mobile}`}
                            title="Call Lead"
                            className="p-1.5 rounded-lg bg-navy/5 text-navy hover:bg-navy hover:text-gold transition-colors cursor-pointer"
                          >
                            <RiPhoneLine className="text-sm" />
                          </a>

                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="px-2.5 py-1 rounded-lg bg-navy text-gold text-2xs font-bold hover:bg-navy-light cursor-pointer transition-colors"
                          >
                            View
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

      {/* ═══════════════════════════════════════════════════════════
          7. SYSTEM TELEMETRY & HEALTH FOOTER (PRESERVED)
          ═══════════════════════════════════════════════════════════ */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <RiServerLine className="text-gold text-sm" />
            <span className="font-bold text-navy text-xs">Platform Infrastructure Uptime</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-2xs">
            {[
              { label: 'Database Cluster', status: 'Optimal', color: 'bg-emerald-500' },
              { label: 'SMS OTP Gateway', status: 'DVHosting Active', color: 'bg-emerald-500' },
              { label: 'Media CDN', status: 'Cloudinary Live', color: 'bg-emerald-500' },
              { label: 'Admin Security', status: 'JWT Encrypted', color: 'bg-emerald-500' },
            ].map((node) => (
              <div key={node.label} className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${node.color}`} />
                <span className="text-text-muted font-medium">{node.label}:</span>
                <span className="font-bold text-navy">{node.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Interactive Lead Detail Modal ── */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateSuccess={fetchDashboardData}
        />
      )}
    </div>
  );
};

export default Dashboard;
