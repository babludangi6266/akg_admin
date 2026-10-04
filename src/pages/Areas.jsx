import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RiMapPinLine,
  RiAddLine,
  RiSearchLine,
  RiRefreshLine,
  RiDeleteBinLine,
  RiEditLine,
  RiCheckLine,
  RiCloseLine,
  RiAlertLine,
  RiBuilding2Line,
  RiShieldCheckLine,
  RiEyeLine,
  RiEyeOffLine,
} from 'react-icons/ri';
import { areaAPI } from '../services/api';

const Areas = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '',
    description: '',
    displayOrder: 0,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      const res = await areaAPI.getAllAdmin(params);
      const list = res?.data || [];
      setAreas(list);
    } catch (err) {
      console.error('Failed to load areas', err);
      showNotification('error', err?.message || 'Failed to fetch operating areas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
  };

  const handleOpenAddModal = () => {
    setEditingArea(null);
    setFormData({
      name: '',
      city: 'Indore',
      state: 'Madhya Pradesh',
      pincode: '',
      description: '',
      displayOrder: areas.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (area) => {
    setEditingArea(area);
    setFormData({
      name: area.name,
      city: area.city || 'Indore',
      state: area.state || 'Madhya Pradesh',
      pincode: area.pincode || '',
      description: area.description || '',
      displayOrder: area.displayOrder || 0,
      isActive: area.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showNotification('error', 'Area / Locality name is required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingArea) {
        await areaAPI.updateArea(editingArea._id, formData);
        showNotification('success', `Area "${formData.name}" updated successfully!`);
      } else {
        await areaAPI.createArea(formData);
        showNotification('success', `New Area "${formData.name}" added to the platform!`);
      }
      setIsModalOpen(false);
      fetchAreas();
    } catch (err) {
      showNotification('error', err?.message || 'Failed to save area details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (area) => {
    try {
      const updatedStatus = !area.isActive;
      await areaAPI.updateArea(area._id, { isActive: updatedStatus });
      setAreas((prev) =>
        prev.map((item) => (item._id === area._id ? { ...item, isActive: updatedStatus } : item))
      );
      showNotification(
        'success',
        `Area "${area.name}" is now ${updatedStatus ? 'ACTIVE (visible on website)' : 'INACTIVE (hidden from forms)'}`
      );
    } catch (err) {
      showNotification('error', 'Failed to update area status: ' + (err?.message || 'Server error'));
    }
  };

  const handleDeleteArea = async (id, name) => {
    try {
      setDeleting(true);
      await areaAPI.deleteArea(id);
      setDeleteConfirmId(null);
      showNotification('success', `Area "${name}" removed from platform successfully.`);
      fetchAreas();
    } catch (err) {
      showNotification('error', 'Failed to delete area: ' + (err?.message || 'Server error'));
    } finally {
      setDeleting(false);
    }
  };

  const filteredAreas = areas.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.city && a.city.toLowerCase().includes(search.toLowerCase()))
  );

  const activeCount = areas.filter((a) => a.isActive).length;

  return (
    <div className="space-y-6">
      {/* Top Notification Banner */}
      <AnimatePresence>
        {notification.message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md border ${
              notification.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'error' ? (
                <RiAlertLine className="text-base" />
              ) : (
                <RiCheckLine className="text-base text-emerald-600" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification({ type: '', message: '' })}
              className="text-slate-400 hover:text-slate-700"
            >
              <RiCloseLine className="text-base" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display font-extrabold text-2xl text-navy">
              Operating Areas & Corridors
            </h1>
            <span className="px-3 py-0.5 rounded-full text-2xs font-extrabold uppercase bg-gold/15 text-gold border border-gold/40">
              Website Form Control
            </span>
          </div>
          <p className="text-xs text-text-secondary font-medium mt-1">
            Administer primary operating localities, corridors, and areas shown in the Homepage Requirement Form, Partner Registration, and Enquiry Modals.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAreas}
            disabled={loading}
            className="p-2.5 rounded-xl border border-border bg-surface hover:bg-bg text-navy hover:text-gold transition-colors shadow-2xs cursor-pointer flex items-center justify-center"
            title="Refresh Areas"
          >
            <RiRefreshLine className={`text-base ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-navy hover:bg-navy-light text-gold font-bold text-xs shadow-soft flex items-center gap-1.5 transition-all cursor-pointer border border-gold/40"
          >
            <RiAddLine className="text-base" />
            <span>Add New Area</span>
          </button>
        </div>
      </div>

      {/* Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-2xl p-4 border border-border shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-2xs font-extrabold uppercase tracking-wider text-text-muted">Total Configured Areas</p>
            <h3 className="font-display font-black text-2xl text-navy mt-1">{areas.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center text-xl">
            <RiMapPinLine />
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-4 border border-border shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-2xs font-extrabold uppercase tracking-wider text-text-muted">Live on Website Forms</p>
            <h3 className="font-display font-black text-2xl text-emerald-600 mt-1">{activeCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            <RiEyeLine />
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-4 border border-border shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-2xs font-extrabold uppercase tracking-wider text-text-muted">Hidden / Inactive</p>
            <h3 className="font-display font-black text-2xl text-slate-400 mt-1">{areas.length - activeCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-xl">
            <RiEyeOffLine />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-surface p-3 rounded-2xl border border-border shadow-2xs flex items-center gap-3">
        <RiSearchLine className="text-slate-400 text-lg ml-2" />
        <input
          type="text"
          placeholder="Search by area name (e.g. Vijay Nagar, Super Corridor, Nipania)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-xs font-semibold text-navy placeholder:text-slate-400 focus:outline-hidden"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-slate-400 hover:text-slate-600 p-1 text-xs font-bold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Areas Table */}
      <div className="bg-surface rounded-3xl border border-border shadow-soft overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-bg/30">
          <div className="flex items-center gap-2">
            <RiBuilding2Line className="text-gold text-lg" />
            <h2 className="font-display font-bold text-sm text-navy">
              Configured Localities & Areas ({filteredAreas.length})
            </h2>
          </div>
          <span className="text-2xs font-semibold text-text-secondary">
            Only active areas are presented to website users in forms
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-text-secondary text-xs font-bold animate-pulse">
            Loading operating areas from MongoDB...
          </div>
        ) : filteredAreas.length === 0 ? (
          <div className="p-12 text-center text-text-secondary space-y-2">
            <RiMapPinLine className="mx-auto text-3xl text-slate-300" />
            <p className="text-sm font-bold text-navy">No areas found</p>
            <p className="text-xs text-text-muted">
              {search ? 'Try adjusting your search criteria' : 'Click "Add New Area" above to create your first locality'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg/50 text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4">Area / Locality Name</th>
                  <th className="py-3.5 px-4">City / Region</th>
                  <th className="py-3.5 px-4">Website Visibility</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {filteredAreas.map((area, idx) => (
                  <tr key={area._id} className="hover:bg-bg/40 transition-colors">
                    <td className="py-3.5 px-4 text-text-muted font-bold">
                      {area.displayOrder ?? idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gold"></span>
                        <span className="font-bold text-navy text-sm">{area.name}</span>
                      </div>
                      {area.description && (
                        <p className="text-2xs text-text-muted mt-0.5 truncate max-w-xs">
                          {area.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary font-medium">
                      {area.city || 'Indore'}, {area.state || 'Madhya Pradesh'}
                      {area.pincode && <span className="text-text-muted ml-1">({area.pincode})</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(area)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-extrabold transition-all cursor-pointer border ${
                          area.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                        }`}
                        title="Click to toggle visibility on website"
                      >
                        {area.isActive ? (
                          <>
                            <RiCheckLine className="text-xs" /> Active (Shown in Forms)
                          </>
                        ) : (
                          <>
                            <RiEyeOffLine className="text-xs" /> Inactive (Hidden)
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(area)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-navy hover:bg-bg transition-colors"
                          title="Edit Area"
                        >
                          <RiEditLine className="text-base" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(area._id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Area"
                        >
                          <RiDeleteBinLine className="text-base" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gold/40 shadow-soft space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-navy text-gold flex items-center justify-center font-bold">
                    <RiMapPinLine />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-base text-navy">
                      {editingArea ? 'Edit Operating Area' : 'Add Operating Area'}
                    </h3>
                    <p className="text-2xs text-text-secondary">
                      Controls user dropdown options across the site
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-text-secondary hover:text-navy hover:bg-bg"
                >
                  <RiCloseLine className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-2xs font-extrabold uppercase text-navy mb-1">
                    Area / Locality Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vijay Nagar, Super Corridor, Nipania"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs font-semibold text-navy focus:outline-hidden focus:border-gold focus:bg-surface"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-2xs font-extrabold uppercase text-navy mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs font-semibold text-navy focus:outline-hidden focus:border-gold focus:bg-surface"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-extrabold uppercase text-navy mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 452010"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs font-semibold text-navy focus:outline-hidden focus:border-gold focus:bg-surface"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-extrabold uppercase text-navy mb-1">
                    Display Order Priority
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs font-semibold text-navy focus:outline-hidden focus:border-gold focus:bg-surface"
                  />
                  <span className="text-[10px] text-text-muted mt-0.5 block">
                    Lower number shows first in website dropdowns.
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveArea"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-gold focus:ring-gold border-border cursor-pointer"
                  />
                  <label htmlFor="isActiveArea" className="text-xs font-bold text-navy cursor-pointer">
                    Active (Show in website inquiry & registration forms)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:text-navy hover:bg-bg cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-navy hover:bg-navy-light text-gold font-bold text-xs shadow-md border border-gold/40 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : editingArea ? 'Update Area' : 'Save Area'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRM MODAL ── */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface rounded-3xl p-6 max-w-sm w-full border border-rose-200 shadow-xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-xl">
                  <RiAlertLine />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm text-navy">
                    Confirm Area Deletion
                  </h3>
                  <p className="text-2xs text-text-secondary">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-text-secondary">
                Are you sure you want to permanently delete this operating area from the database? It will no longer appear in future forms.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-bg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => {
                    const target = areas.find((a) => a._id === deleteConfirmId);
                    if (target) handleDeleteArea(deleteConfirmId, target.name);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-all disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete Area'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Areas;
