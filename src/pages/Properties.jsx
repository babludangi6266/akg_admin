import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RiBuilding4Line,
  RiAddLine,
  RiSearchLine,
  RiMapPinLine,
  RiCheckLine,
  RiCloseLine,
  RiPriceTag3Line,
  RiHome4Line,
  RiEditLine,
  RiDeleteBin6Line,
  RiEyeLine,
  RiStarFill,
  RiStarLine,
  RiRefreshLine,
  RiCompass3Line,
  RiImageAddLine,
  RiTimeLine,
  RiUserStarLine,
  RiShieldCheckLine,
} from 'react-icons/ri';
import { propertyAPI } from '../services/api';

const INDORE_LOCALITIES = [
  'Vijay Nagar',
  'Super Corridor',
  'Nipania',
  'Bypass Road',
  'AB Road',
  'Mahalaxmi Nagar',
  'Bicholi Mardana',
  'Rau',
  'Palasia',
  'Silicon City',
  'Kanadia Road',
  'Ujjain Road',
];

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment / Flat' },
  { value: 'villa', label: 'Luxury Villa' },
  { value: 'plot', label: 'Gated Plot / Land' },
  { value: 'commercial', label: 'Commercial Space / Office' },
  { value: 'independent_house', label: 'Independent House / Kothi' },
];

const PREDEFINED_AMENITIES = [
  'Rooftop Infinity Pool',
  'Modern Gymnasium',
  'Clubhouse & Banquet Hall',
  'Reserved Covered Parking',
  '24/7 Multi-tier Security & CCTV',
  'High-speed Elevators',
  '100% Power Backup',
  'Landscaped Podium Garden',
  'Children Play Area',
  'EV Charging Station',
  'Fire Fighting System',
  'Gated Community',
];

const initialFormState = {
  title: '',
  category: 'buy',
  type: 'apartment',
  price: '',
  priceDisplay: '',
  dealBadge: 'Direct Developer Mandate',
  status: 'active',
  approvalStatus: 'approved',
  featured: false,
  locality: 'Vijay Nagar',
  address: '',
  city: 'Indore',
  state: 'Madhya Pradesh',
  pincode: '452010',
  bhk: '3',
  carpetArea: '',
  plotArea: '',
  furnishing: 'fully_furnished',
  facing: 'east',
  ageOfProperty: 'less_than_1_year',
  amenities: ['24/7 Multi-tier Security & CCTV', '100% Power Backup', 'Reserved Covered Parking'],
  highlights: ['Prime Indore Corridor', 'Verified Legal Title', 'RERA Approved'],
  images: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  ],
  description: '',
};

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [editingPropObj, setEditingPropObj] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectProp, setRejectProp] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Fetch properties from MongoDB via API
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (approvalFilter !== 'all') params.approvalStatus = approvalFilter;
      else params.approvalStatus = 'all'; // Admin can see all including pending partner submissions!
      if (searchQuery) params.search = searchQuery;

      const res = await propertyAPI.getProperties(params);
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.properties)
        ? res.data.properties
        : Array.isArray(res?.properties)
        ? res.properties
        : [];

      setProperties(list);
    } catch (err) {
      console.error('Failed to load properties from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [categoryFilter, typeFilter, statusFilter, approvalFilter]);

  // Handle Quick Approve
  const handleQuickApprove = async (prop, e) => {
    e?.stopPropagation();
    try {
      setLoading(true);
      await propertyAPI.approveProperty(prop._id);
      setSuccessMessage(`Listing "${prop.title}" approved and published live on website!`);
      fetchProperties();
    } catch (err) {
      console.error('Failed to approve property:', err);
      alert(err.message || 'Failed to approve property');
    } finally {
      setLoading(false);
    }
  };

  // Open Reject Modal
  const handleOpenReject = (prop, e) => {
    e?.stopPropagation();
    setRejectProp(prop);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  // Confirm Reject
  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectProp) return;
    try {
      setRejecting(true);
      await propertyAPI.rejectProperty(rejectProp._id, rejectReason);
      setRejectModalOpen(false);
      setSuccessMessage(`Property "${rejectProp.title}" marked as rejected.`);
      fetchProperties();
    } catch (err) {
      console.error('Failed to reject property:', err);
      alert(err.message || 'Failed to reject property');
    } finally {
      setRejecting(false);
    }
  };

  // Open modal for Add
  const handleOpenAdd = () => {
    setEditingPropertyId(null);
    setEditingPropObj(null);
    setFormData(initialFormState);
    setImageUrlInput('');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (prop) => {
    setEditingPropertyId(prop._id);
    setEditingPropObj(prop);
    const rawImages = Array.isArray(prop.images)
      ? prop.images.map((img) => (typeof img === 'string' ? img : img.url))
      : [];

    setFormData({
      title: prop.title || '',
      category: prop.category || 'buy',
      type: prop.type || 'apartment',
      price: prop.price || '',
      priceDisplay: prop.priceDisplay || '',
      dealBadge: prop.dealBadge || 'Direct Developer Mandate',
      status: prop.status || 'active',
      approvalStatus: prop.approvalStatus || 'approved',
      rejectionReason: prop.rejectionReason || '',
      featured: !!prop.featured,
      locality: prop.location?.locality || 'Vijay Nagar',
      address: prop.location?.address || '',
      city: prop.location?.city || 'Indore',
      state: prop.location?.state || 'Madhya Pradesh',
      pincode: prop.location?.pincode || '452010',
      bhk: prop.bhk || '3',
      carpetArea: prop.carpetArea || '',
      plotArea: prop.plotArea || '',
      furnishing: prop.furnishing || 'fully_furnished',
      facing: prop.facing || 'east',
      ageOfProperty: prop.ageOfProperty || 'less_than_1_year',
      amenities: Array.isArray(prop.amenities) ? prop.amenities : [],
      highlights: Array.isArray(prop.highlights) ? prop.highlights : [],
      images: rawImages.length > 0 ? rawImages : [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      ],
      description: prop.description || '',
    });
    setImageUrlInput('');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  // Handle Form Input Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Toggle Amenity
  const handleToggleAmenity = (amenity) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  // Add Image URL
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, imageUrlInput.trim()],
    }));
    setImageUrlInput('');
  };

  // Remove Image URL
  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Submit Save or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.title.trim()) {
      setErrorMessage('Property title is required.');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setErrorMessage('A valid numeric price in ₹ is required.');
      return;
    }

    setSaving(true);

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      type: formData.type,
      category: formData.category,
      price: Number(formData.price),
      priceDisplay: formData.priceDisplay.trim() || undefined,
      dealBadge: formData.dealBadge.trim() || undefined,
      status: formData.status,
      featured: formData.featured,
      bhk: formData.bhk,
      carpetArea: formData.carpetArea ? Number(formData.carpetArea) : undefined,
      plotArea: formData.plotArea ? Number(formData.plotArea) : undefined,
      furnishing: formData.furnishing,
      facing: formData.facing,
      ageOfProperty: formData.ageOfProperty,
      amenities: formData.amenities,
      highlights: formData.highlights,
      images: formData.images.map((url) => ({ url, caption: formData.title })),
      location: {
        locality: formData.locality,
        address: formData.address.trim(),
        city: formData.city.trim() || 'Indore',
        state: formData.state.trim() || 'Madhya Pradesh',
        pincode: formData.pincode.trim() || '452010',
      },
      approvalStatus: formData.approvalStatus || 'approved',
      rejectionReason: formData.rejectionReason || '',
    };

    try {
      if (editingPropertyId) {
        await propertyAPI.updateProperty(editingPropertyId, payload);
        setSuccessMessage('Property updated successfully!');
      } else {
        await propertyAPI.createProperty(payload);
        setSuccessMessage('New property added to catalog successfully!');
      }

      setTimeout(() => setSuccessMessage(''), 3000);
      setIsModalOpen(false);
      fetchProperties();
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to save property. Please check backend connection.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Property
  const handleDeleteProperty = async (prop, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to permanently delete "${prop.title}"?`)) return;

    try {
      await propertyAPI.deleteProperty(prop._id);
      setProperties((prev) => prev.filter((p) => p._id !== prop._id));
      setSuccessMessage('Property deleted successfully.');
      setTimeout(() => setSuccessMessage(''), 2500);
    } catch (err) {
      console.error('Failed to delete property:', err);
      alert(err?.message || 'Failed to delete property.');
    }
  };

  // Toggle Status directly (Active / Sold)
  const handleToggleStatus = async (prop, e) => {
    e.stopPropagation();
    const newStatus = prop.status === 'active' ? 'sold' : 'active';
    try {
      await propertyAPI.updateProperty(prop._id, { status: newStatus });
      setProperties((prev) =>
        prev.map((p) => (p._id === prop._id ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (prop, e) => {
    e.stopPropagation();
    const newFeatured = !prop.featured;
    try {
      await propertyAPI.updateProperty(prop._id, { featured: newFeatured });
      setProperties((prev) =>
        prev.map((p) => (p._id === prop._id ? { ...p, featured: newFeatured } : p))
      );
    } catch (err) {
      console.error('Failed to toggle featured:', err);
    }
  };

  // Filtered properties for instant client search
  const displayProperties = properties.filter((p) => {
    const q = searchQuery.toLowerCase();
    const title = p.title || '';
    const loc = p.location?.locality || p.location?.address || '';
    const type = p.type || '';
    return title.toLowerCase().includes(q) || loc.toLowerCase().includes(q) || type.toLowerCase().includes(q);
  });

  // Top Metrics
  const totalCount = properties.length;
  const pendingCount = properties.filter((p) => p.approvalStatus === 'pending').length;
  const approvedCount = properties.filter((p) => p.approvalStatus === 'approved').length;
  const rejectedCount = properties.filter((p) => p.approvalStatus === 'rejected').length;
  const activeCount = properties.filter((p) => p.status === 'active' && p.approvalStatus === 'approved').length;
  const soldCount = properties.filter((p) => p.status === 'sold').length;
  const featuredCount = properties.filter((p) => p.featured).length;

  return (
    <div className="space-y-6 select-none">
      {/* Toast Alert */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-success-light border border-success/40 text-success text-xs font-bold flex items-center justify-between shadow-soft">
          <span className="flex items-center gap-2">
            <RiCheckLine className="text-base" /> {successMessage}
          </span>
          <button onClick={() => setSuccessMessage('')} className="cursor-pointer text-sm">
            <RiCloseLine />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display font-extrabold text-2xl text-navy">
              Properties Catalog & Partner Verification
            </h1>
            <span className="px-3 py-0.5 rounded-full text-2xs font-extrabold uppercase bg-gold/15 text-gold border border-gold/40">
              Super Admin
            </span>
          </div>
          <p className="text-xs text-text-secondary font-medium mt-0.5">
            Review partner property submissions, verify legal titles, and publish live luxury inventory across Indore.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProperties}
            title="Refresh Catalog"
            className="p-3 rounded-xl border border-border bg-surface text-text-secondary hover:text-navy hover:bg-bg transition-colors cursor-pointer"
          >
            <RiRefreshLine className={`text-lg ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-3 rounded-xl bg-navy text-gold hover:bg-navy-light font-display font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-gold"
          >
            <RiAddLine className="text-lg" /> Add New Property
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-surface border border-border flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center text-xl font-bold">
            <RiBuilding4Line />
          </div>
          <div>
            <p className="text-2xs text-text-muted font-bold uppercase tracking-wider">Total Listings</p>
            <h4 className="font-display font-extrabold text-lg text-navy">{totalCount}</h4>
          </div>
        </div>

        {/* Pending Review Card */}
        <div
          onClick={() => setApprovalFilter('pending')}
          className={`p-4 rounded-2xl border flex items-center gap-3 shadow-2xs cursor-pointer transition-all ${
            approvalFilter === 'pending'
              ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30'
              : 'bg-surface border-amber-300 hover:border-amber-500'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center text-xl font-bold">
            <RiTimeLine className={pendingCount > 0 ? 'animate-pulse' : ''} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-2xs text-amber-700 font-extrabold uppercase tracking-wider">Pending Review</p>
              {pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
            <h4 className="font-display font-extrabold text-lg text-amber-700">{pendingCount}</h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-success-light text-success flex items-center justify-center text-xl font-bold">
            <RiCheckLine />
          </div>
          <div>
            <p className="text-2xs text-text-muted font-bold uppercase tracking-wider">Active & Live</p>
            <h4 className="font-display font-extrabold text-lg text-navy">{activeCount}</h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center text-xl font-bold">
            <RiStarFill />
          </div>
          <div>
            <p className="text-2xs text-text-muted font-bold uppercase tracking-wider">Featured Assets</p>
            <h4 className="font-display font-extrabold text-lg text-navy">{featuredCount}</h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border flex items-center gap-3 shadow-2xs col-span-2 md:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-navy/10 text-navy-light flex items-center justify-center text-xl font-bold">
            <RiShieldCheckLine />
          </div>
          <div>
            <p className="text-2xs text-text-muted font-bold uppercase tracking-wider">Transacted / Sold</p>
            <h4 className="font-display font-extrabold text-lg text-navy">{soldCount}</h4>
          </div>
        </div>
      </div>

      {/* Verification Queue & Approval Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-2.5 rounded-2xl border border-border shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setApprovalFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              approvalFilter === 'all'
                ? 'bg-navy text-gold shadow-sm'
                : 'text-text-secondary hover:text-navy hover:bg-bg'
            }`}
          >
            All Listings ({totalCount})
          </button>

          <button
            onClick={() => setApprovalFilter('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              approvalFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-700 bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200'
            }`}
          >
            <RiTimeLine className="text-sm" />
            <span>Pending Verification</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-2xs font-black bg-white text-amber-700 animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setApprovalFilter('approved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              approvalFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200'
            }`}
          >
            <RiCheckLine className="text-sm" />
            <span>Approved & Live ({approvedCount})</span>
          </button>

          <button
            onClick={() => setApprovalFilter('rejected')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              approvalFilter === 'rejected'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-rose-700 bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200'
            }`}
          >
            <RiCloseLine className="text-sm" />
            <span>Rejected ({rejectedCount})</span>
          </button>
        </div>

        <span className="text-2xs text-text-muted px-2 font-medium hidden lg:inline">
          Partners submit inventory directly • Review and accept to list live on website
        </span>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-lg" />
          <input
            type="text"
            placeholder="Search by title, corridor, locality, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy placeholder:text-text-muted focus:outline-hidden focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-bg border border-border text-xs font-semibold text-navy focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-bg border border-border text-xs font-semibold text-navy focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="plot">Plot / Land</option>
            <option value="commercial">Commercial</option>
            <option value="independent_house">Independent House</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-bg border border-border text-xs font-semibold text-navy focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Properties Table / Grid */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg/60 text-2xs font-extrabold uppercase tracking-wider text-text-secondary">
                <th className="py-3.5 px-4">Property</th>
                <th className="py-3.5 px-4">Corridor & City</th>
                <th className="py-3.5 px-4">Type & BHK</th>
                <th className="py-3.5 px-4">Pricing</th>
                <th className="py-3.5 px-4 text-center">Listing Status</th>
                <th className="py-3.5 px-4 text-center min-w-[220px]">Super Admin Decision (Accept / Reject)</th>
                <th className="py-3.5 px-4 text-center">Featured</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-text-secondary">
                    <RiRefreshLine className="animate-spin text-2xl mx-auto mb-2 text-gold" />
                    Loading properties from MongoDB...
                  </td>
                </tr>
              ) : displayProperties.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-text-secondary">
                    <RiBuilding4Line className="text-3xl mx-auto mb-2 text-text-muted opacity-50" />
                    <p className="font-semibold text-navy">No properties found in database</p>
                    <p className="text-2xs text-text-muted mt-1">
                      Click &quot;Add New Property&quot; to publish a listing or adjust search filters.
                    </p>
                  </td>
                </tr>
              ) : (
                displayProperties.map((prop) => {
                  const firstImg =
                    Array.isArray(prop.images) && prop.images[0]
                      ? typeof prop.images[0] === 'string'
                        ? prop.images[0]
                        : prop.images[0].url
                      : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';

                  const priceText =
                    prop.priceDisplay ||
                    (prop.price ? `₹ ${Number(prop.price).toLocaleString('en-IN')}` : 'Price on Request');

                  const isApproved = prop.approvalStatus === 'approved';
                  const isRejected = prop.approvalStatus === 'rejected';
                  const isPending = !isApproved && !isRejected;

                  return (
                    <tr
                      key={prop._id}
                      onClick={() => handleOpenEdit(prop)}
                      className="hover:bg-bg/40 transition-colors cursor-pointer group"
                    >
                      {/* Property Title & Image */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={firstImg}
                            alt={prop.title}
                            className="w-12 h-12 rounded-xl object-cover border border-border/80 shadow-2xs shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-display font-bold text-navy text-sm truncate max-w-xs group-hover:text-gold transition-colors">
                                {prop.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-2xs font-semibold px-2 py-0.2 rounded-md bg-gold/10 text-gold border border-gold/20 uppercase">
                                {prop.category || 'Buy'}
                              </span>
                              {prop.dealBadge && (
                                <span className="text-2xs text-text-muted truncate max-w-[150px]">
                                  • {prop.dealBadge}
                                </span>
                              )}
                            </div>

                            {/* Partner Attribution Tag */}
                            {(prop.submittedByPartner || prop.submittedByName) && (
                              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
                                  <RiUserStarLine className="text-xs" />
                                  Partner: {prop.submittedByName || prop.submittedByPartner?.name} ({prop.submittedByMobile || prop.submittedByPartner?.mobile || 'Broker'})
                                </span>
                                {prop.submittedByPartner?.isMobileVerified && (
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-0.5">
                                    <RiShieldCheckLine className="text-2xs" /> OTP Verified
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Locality & Address */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-navy font-semibold">
                          <RiMapPinLine className="text-gold shrink-0 text-sm" />
                          <span>{prop.location?.locality || 'Indore'}</span>
                        </div>
                        <p className="text-2xs text-text-muted truncate max-w-xs mt-0.5">
                          {prop.location?.address || `${prop.location?.city || 'Indore'}, MP`}
                        </p>
                      </td>

                      {/* Type & Specs */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-navy capitalize">
                          {prop.type ? prop.type.replace(/_/g, ' ') : 'Apartment'}
                        </span>
                        <p className="text-2xs text-text-muted mt-0.5">
                          {prop.bhk && prop.bhk !== 'N/A' ? `${prop.bhk} BHK` : ''}{' '}
                          {prop.carpetArea ? `• ${prop.carpetArea} Sq.Ft` : ''}
                        </p>
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-4">
                        <span className="font-display font-extrabold text-navy text-sm">
                          {priceText}
                        </span>
                        {prop.carpetArea && prop.price && (
                          <p className="text-2xs text-text-muted mt-0.5">
                            ₹ {Math.round(prop.price / prop.carpetArea).toLocaleString('en-IN')}/sq.ft
                          </p>
                        )}
                      </td>

                      {/* Listing Status */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleToggleStatus(prop, e)}
                          title="Click to toggle listing status (active/sold)"
                          className={`px-3 py-1 rounded-lg text-2xs font-extrabold uppercase border transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs ${
                            prop.status === 'active'
                              ? 'bg-success-light text-success border-success/30 hover:bg-success/20'
                              : 'bg-bg text-text-muted border-border hover:bg-border/40'
                          }`}
                        >
                          {prop.status === 'active' ? '● Active' : '○ ' + (prop.status || 'Inactive')}
                        </button>
                      </td>

                      {/* Dedicated Super Admin Decision (Accept / Reject) Column */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center gap-1.5 min-w-[210px]">
                          {/* Current Status Pill */}
                          {isPending ? (
                            <span className="px-3 py-0.5 rounded-full text-2xs font-black uppercase bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1 shadow-2xs">
                              <RiTimeLine className="text-xs" /> Pending Review
                            </span>
                          ) : isRejected ? (
                            <span
                              className="px-3 py-0.5 rounded-full text-2xs font-black uppercase bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1 shadow-2xs cursor-help"
                              title={prop.rejectionReason ? `Reason: ${prop.rejectionReason}` : 'Rejected submission'}
                            >
                              <RiCloseLine className="text-xs" /> Rejected
                            </span>
                          ) : (
                            <span className="px-3 py-0.5 rounded-full text-2xs font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1 shadow-2xs">
                              <RiCheckLine className="text-xs" /> Accepted & Live
                            </span>
                          )}

                          {/* Instant Decision Action Buttons */}
                          <div className="flex items-center justify-center gap-1.5 mt-0.5">
                            {/* Accept Button */}
                            <button
                              onClick={(e) => handleQuickApprove(prop, e)}
                              title="Accept property & publish live on website"
                              className={`px-3 py-1.5 rounded-lg text-2xs font-black uppercase flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer ${
                                isApproved
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-1 ring-emerald-500'
                              }`}
                            >
                              <RiCheckLine className="text-sm" />
                              {isApproved ? 'Accepted ✓' : 'Accept & List'}
                            </button>

                            {/* Reject Button */}
                            <button
                              onClick={(e) => handleOpenReject(prop, e)}
                              title="Reject property submission with reason"
                              className={`px-3 py-1.5 rounded-lg text-2xs font-black uppercase flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer ${
                                isRejected
                                  ? 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
                                  : 'bg-rose-600 hover:bg-rose-700 text-white ring-1 ring-rose-500'
                              }`}
                            >
                              <RiCloseLine className="text-sm" />
                              {isRejected ? 'Edit Rejection' : 'Reject'}
                            </button>
                          </div>

                          {/* Rejection reason note */}
                          {isRejected && prop.rejectionReason && (
                            <p className="text-[10px] text-rose-600 max-w-[200px] truncate italic" title={prop.rejectionReason}>
                              Note: {prop.rejectionReason}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Featured */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleToggleFeatured(prop, e)}
                          title="Toggle featured status"
                          className="text-lg transition-transform active:scale-90 cursor-pointer"
                        >
                          {prop.featured ? (
                            <RiStarFill className="text-gold mx-auto" />
                          ) : (
                            <RiStarLine className="text-text-muted hover:text-gold mx-auto" />
                          )}
                        </button>
                      </td>

                      {/* Actions (Edit / Delete) */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(prop)}
                            title="Edit Listing Details"
                            className="p-1.5 rounded-lg text-text-secondary hover:text-navy hover:bg-bg transition-colors cursor-pointer"
                          >
                            <RiEditLine className="text-base" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteProperty(prop, e)}
                            title="Delete Listing Permanently"
                            className="p-1.5 rounded-lg text-danger hover:bg-danger-light transition-colors cursor-pointer"
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

      {/* Add / Edit Property Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 max-sm:p-2 bg-navy/60 backdrop-blur-xs select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-surface rounded-3xl border border-border shadow-elevated w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between bg-bg/50">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gold/10 text-gold flex items-center justify-center font-display font-extrabold text-xl shadow-xs border border-gold/30">
                    <RiBuilding4Line />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-xl text-navy">
                      {editingPropertyId ? 'Edit Property Listing' : 'Add New Property Listing'}
                    </h3>
                    <p className="text-2xs text-text-secondary font-medium">
                      {editingPropertyId
                        ? 'Update listing specifications, pricing, amenities and photos.'
                        : 'Create a new verified real estate asset on Zamin Junction.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-text-secondary hover:text-navy hover:bg-bg transition-colors cursor-pointer"
                >
                  <RiCloseLine className="text-2xl" />
                </button>
              </div>

              {/* Modal Form Scrollable */}
              <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-danger-light border border-danger/30 text-danger text-xs font-bold">
                    {errorMessage}
                  </div>
                )}

                {/* Super Admin Verification & Decision Banner */}
                {editingPropertyId && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-gold/10 to-emerald-500/10 border border-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xs font-extrabold uppercase tracking-wider text-text-muted">
                          Source:
                        </span>
                        {editingPropObj?.submittedByPartner || editingPropObj?.submittedByName ? (
                          <div className="inline-flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-md border border-purple-200 inline-flex items-center gap-1">
                              <RiUserStarLine className="text-xs" /> Partner: {editingPropObj.submittedByName || editingPropObj.submittedByPartner?.name} ({editingPropObj.submittedByMobile || editingPropObj.submittedByPartner?.mobile || 'Broker'})
                            </span>
                            {editingPropObj.submittedByPartner?.isMobileVerified && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                                <RiShieldCheckLine /> OTP Verified
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-navy bg-navy/10 px-2 py-0.5 rounded-md">
                            Direct Super Admin Listing
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-2xs font-extrabold uppercase tracking-wider text-text-muted">
                          Decision Status:
                        </span>
                        <span
                          className={`text-xs font-black px-2.5 py-0.5 rounded-md uppercase border ${
                            formData.approvalStatus === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : formData.approvalStatus === 'rejected'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          {formData.approvalStatus === 'approved'
                            ? '✓ Accepted & Live on Website'
                            : formData.approvalStatus === 'rejected'
                            ? '✕ Rejected'
                            : '⏳ Pending Super Admin Verification'}
                        </span>
                      </div>
                    </div>

                    {/* Quick Toggle Buttons in Banner */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            approvalStatus: 'approved',
                            status: 'active',
                            rejectionReason: '',
                          }));
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                          formData.approvalStatus === 'approved'
                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                            : 'bg-emerald-500/15 text-emerald-700 border border-emerald-300 hover:bg-emerald-600 hover:text-white'
                        }`}
                      >
                        <RiCheckLine className="text-base" /> Accept & Publish
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            approvalStatus: 'rejected',
                            status: 'inactive',
                          }));
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                          formData.approvalStatus === 'rejected'
                            ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                            : 'bg-rose-500/15 text-rose-700 border border-rose-300 hover:bg-rose-600 hover:text-white'
                        }`}
                      >
                        <RiCloseLine className="text-base" /> Reject Listing
                      </button>
                    </div>
                  </div>
                )}

                {/* Section 1: Basic Identifiers */}
                <div className="space-y-3">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-navy">
                    1. Basic Property Information
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="sm:col-span-2">
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        Listing Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        required
                        placeholder="e.g. Zamin Junction Emerald Heights - Luxury 3 BHK"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-hidden focus:border-gold"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-hidden focus:border-gold"
                      >
                        <option value="buy">Buy (Sale)</option>
                        <option value="rent">Rent (Lease)</option>
                      </select>
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        Property Type *
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-hidden focus:border-gold capitalize"
                      >
                        {PROPERTY_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Deal Badge */}
                    <div className="sm:col-span-2">
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        Deal Badge / Verification Tag
                      </label>
                      <input
                        type="text"
                        name="dealBadge"
                        placeholder="e.g. Direct Developer Mandate, Verified Title Search, High ROI Asset"
                        value={formData.dealBadge}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-hidden focus:border-gold"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Pricing & Super Admin Approval Decision */}
                <div className="space-y-3 pt-3 border-t border-border">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-navy">
                    2. Pricing & Super Admin Approval Decision
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Numeric Price */}
                    <div>
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        Price (Numeric in ₹) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        required
                        placeholder="e.g. 8500000"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-hidden focus:border-gold"
                      />
                    </div>

                    {/* Price Display */}
                    <div>
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        Price Display Label (Optional)
                      </label>
                      <input
                        type="text"
                        name="priceDisplay"
                        placeholder="e.g. ₹ 85 Lakhs or ₹ 1.45 Cr"
                        value={formData.priceDisplay}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-hidden focus:border-gold"
                      />
                    </div>

                    {/* Listing Status */}
                    <div>
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        Listing Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-hidden focus:border-gold"
                      >
                        <option value="active">Active Listing</option>
                        <option value="sold">Sold / Transacted</option>
                        <option value="rented">Rented Out</option>
                        <option value="inactive">Inactive / Draft</option>
                      </select>
                    </div>

                    {/* Super Admin Approval Decision */}
                    <div>
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        Super Admin Approval Decision *
                      </label>
                      <select
                        name="approvalStatus"
                        value={formData.approvalStatus}
                        onChange={handleChange}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-hidden ${
                          formData.approvalStatus === 'approved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : formData.approvalStatus === 'rejected'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="approved">✅ Approved (Live on Website)</option>
                        <option value="pending">⏳ Pending Verification</option>
                        <option value="rejected">❌ Rejected (Hidden from Web)</option>
                      </select>
                    </div>

                    {/* Rejection Feedback Note (if rejected) */}
                    {formData.approvalStatus === 'rejected' && (
                      <div className="sm:col-span-2 lg:col-span-4">
                        <label className="block text-2xs font-bold uppercase text-rose-600 mb-1">
                          Rejection Feedback / Reason for Channel Partner *
                        </label>
                        <input
                          type="text"
                          name="rejectionReason"
                          placeholder="e.g. Missing clear title documents / Incorrect pricing / Duplicate submission"
                          value={formData.rejectionReason}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-rose-50/50 border border-rose-200 text-xs text-navy font-semibold focus:outline-hidden focus:border-rose-400"
                        />
                      </div>
                    )}

                    {/* Featured Checkbox */}
                    <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-2.5 p-3 rounded-xl bg-gold/5 border border-gold/30">
                      <input
                        type="checkbox"
                        id="featured"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleChange}
                        className="w-4 h-4 text-gold rounded border-border focus:ring-gold cursor-pointer"
                      />
                      <label htmlFor="featured" className="text-xs font-bold text-navy cursor-pointer">
                        Mark as Featured Asset (Showcases on homepage top hero and featured deals)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section 3: Location (Indore Focus) */}
                <div className="space-y-3 pt-3 border-t border-border">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-navy">
                    3. Location & Corridor (Indore)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Locality */}
                    <div>
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        Indore Locality / Corridor *
                      </label>
                      <select
                        name="locality"
                        value={formData.locality}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-hidden focus:border-gold"
                      >
                        {INDORE_LOCALITIES.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Pincode */}
                    <div>
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        placeholder="e.g. 452010"
                        value={formData.pincode}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-hidden focus:border-gold"
                      />
                    </div>

                    {/* Full Address */}
                    <div className="sm:col-span-2">
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        Address / Landmark
                      </label>
                      <input
                        type="text"
                        name="address"
                        placeholder="e.g. Near Brilliant Convention Centre, Scheme 78, Vijay Nagar"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-hidden focus:border-gold"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Specifications */}
                <div className="space-y-3 pt-3 border-t border-border">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-navy">
                    4. Property Specifications
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* BHK */}
                    <div>
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        BHK Config
                      </label>
                      <select
                        name="bhk"
                        value={formData.bhk}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-hidden focus:border-gold"
                      >
                        <option value="1">1 BHK</option>
                        <option value="2">2 BHK</option>
                        <option value="3">3 BHK</option>
                        <option value="4+">4+ BHK / Villa</option>
                        <option value="N/A">N/A (Plot/Commercial)</option>
                      </select>
                    </div>

                    {/* Carpet Area */}
                    <div>
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        Carpet Area (Sq.Ft)
                      </label>
                      <input
                        type="number"
                        name="carpetArea"
                        placeholder="e.g. 1650"
                        value={formData.carpetArea}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-hidden focus:border-gold"
                      />
                    </div>

                    {/* Furnishing */}
                    <div>
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        Furnishing
                      </label>
                      <select
                        name="furnishing"
                        value={formData.furnishing}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-hidden focus:border-gold"
                      >
                        <option value="fully_furnished">Fully Furnished</option>
                        <option value="semi_furnished">Semi Furnished</option>
                        <option value="unfurnished">Unfurnished</option>
                      </select>
                    </div>

                    {/* Facing */}
                    <div>
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        Facing
                      </label>
                      <select
                        name="facing"
                        value={formData.facing}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-hidden focus:border-gold capitalize"
                      >
                        <option value="east">East</option>
                        <option value="north">North</option>
                        <option value="north_east">North-East</option>
                        <option value="west">West</option>
                        <option value="south">South</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 5: Image URLs */}
                <div className="space-y-3 pt-3 border-t border-border">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-navy flex items-center gap-1.5">
                    <RiImageAddLine className="text-gold text-base" /> 5. Property Photos & Media URLs
                  </h4>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste high-res photo URL (Unsplash, Cloudinary, AWS S3)..."
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-medium focus:outline-hidden focus:border-gold"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-4 py-2.5 rounded-xl bg-navy text-gold hover:bg-navy-light text-xs font-bold cursor-pointer transition-colors"
                    >
                      Add Photo
                    </button>
                  </div>

                  {/* Image Previews */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-1">
                    {formData.images.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden border border-border aspect-video bg-bg"
                      >
                        <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 rounded-md bg-danger text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                          title="Remove Photo"
                        >
                          <RiCloseLine />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 6: Amenities Checklist */}
                <div className="space-y-3 pt-3 border-t border-border">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-navy">
                    6. Key Amenities
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PREDEFINED_AMENITIES.map((amenity) => {
                      const isChecked = formData.amenities.includes(amenity);
                      return (
                        <button
                          type="button"
                          key={amenity}
                          onClick={() => handleToggleAmenity(amenity)}
                          className={`px-3 py-2 rounded-xl text-2xs font-bold text-left border transition-all cursor-pointer flex items-center justify-between ${
                            isChecked
                              ? 'bg-navy text-gold border-gold/40 shadow-xs'
                              : 'bg-bg text-text-secondary border-border hover:border-gold/30'
                          }`}
                        >
                          <span>{amenity}</span>
                          {isChecked && <RiCheckLine className="text-sm shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 7: Description */}
                <div className="space-y-3 pt-3 border-t border-border">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-navy">
                    7. Detailed Description
                  </h4>

                  <textarea
                    rows={4}
                    name="description"
                    placeholder="Provide detailed information regarding architectural design, construction quality, floor plans, legal approvals, and possession dates..."
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-3.5 rounded-xl bg-bg border border-border text-xs text-navy font-medium focus:outline-hidden focus:border-gold resize-none"
                  />
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:text-navy hover:bg-bg transition-colors cursor-pointer w-full sm:w-auto text-center"
                  >
                    Cancel
                  </button>

                  <div className="flex flex-wrap items-center justify-end gap-2.5 w-full sm:w-auto">
                    {editingPropertyId && (
                      <>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              setSaving(true);
                              await propertyAPI.approveProperty(editingPropertyId);
                              setSuccessMessage(`Listing "${formData.title}" accepted and published live on website!`);
                              setIsModalOpen(false);
                              fetchProperties();
                            } catch (err) {
                              setErrorMessage(err.message || 'Failed to approve');
                            } finally {
                              setSaving(false);
                            }
                          }}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <RiCheckLine className="text-base" /> Accept & Publish Live
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsModalOpen(false);
                            handleOpenReject(editingPropObj);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <RiCloseLine className="text-base" /> Reject Listing
                        </button>
                      </>
                    )}

                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 rounded-xl bg-navy text-gold hover:bg-navy-light font-display font-bold text-xs shadow-gold flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <RiCheckLine className="text-base" />
                      {saving
                        ? 'Saving to MongoDB...'
                        : editingPropertyId
                        ? 'Save All Changes'
                        : 'Publish Property'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── REJECT PROPERTY FEEDBACK MODAL ── */}
      <AnimatePresence>
        {rejectModalOpen && rejectProp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface rounded-3xl border border-border p-6 sm:p-7 max-w-md w-full shadow-elevated"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                <div className="flex items-center gap-2 text-danger">
                  <RiCloseLine className="text-2xl" />
                  <h3 className="font-display font-bold text-base text-navy">Reject Property Submission</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-navy hover:bg-bg transition-colors cursor-pointer"
                >
                  <RiCloseLine className="text-xl" />
                </button>
              </div>

              <p className="text-xs text-text-secondary mb-3 leading-relaxed">
                Rejecting listing: <strong className="text-navy">{rejectProp.title}</strong>
              </p>

              <form onSubmit={handleConfirmReject} className="space-y-4">
                <div>
                  <label className="block text-2xs font-bold uppercase text-text-muted mb-1.5">
                    Rejection Feedback / Reason for Partner
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Specify why this listing cannot be approved (e.g. Invalid document title, duplicate listing, inaccurate price, blurry photos)..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full p-3 rounded-xl bg-bg border border-border text-xs text-navy font-medium focus:outline-hidden focus:border-danger resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-text-secondary hover:text-navy hover:bg-bg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={rejecting}
                    className="px-5 py-2 rounded-xl bg-danger hover:bg-danger/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Properties;
