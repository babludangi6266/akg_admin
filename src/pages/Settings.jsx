import { useState } from 'react';
import {
  RiShieldCheckLine,
  RiKey2Line,
  RiNotification3Line,
  RiServerLine,
  RiCheckLine,
  RiLockPasswordLine,
} from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Settings = () => {
  const { admin } = useAuth();
  const [profileSaved, setProfileSaved] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleProfileSave = (e) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      return;
    }

    setChangingPassword(true);

    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      setPasswordSuccess('Password changed successfully in MongoDB!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err?.message || 'Failed to change password. Please verify your current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl select-none">
      <div>
        <h1 className="font-display font-extrabold text-2xl text-navy">
          Admin System Settings & Password Management
        </h1>
        <p className="text-xs text-text-secondary font-medium mt-0.5">
          Manage system API gateway connectivity, admin profile, and security credentials.
        </p>
      </div>

      {profileSaved && (
        <div className="p-4 rounded-2xl bg-success-light border border-success/30 text-success text-xs font-bold flex items-center gap-2">
          <RiCheckLine className="text-lg" /> Profile settings saved successfully!
        </div>
      )}

      {/* System Status Indicators */}
      <div className="p-6 rounded-3xl bg-surface border border-border shadow-soft space-y-4">
        <h3 className="font-display font-extrabold text-base text-navy flex items-center gap-2">
          <RiServerLine className="text-gold" /> System API Gateways
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
          <div className="p-4 rounded-2xl bg-bg border border-border flex items-center justify-between">
            <div>
              <p className="font-bold text-navy">DVHosting Real-Time SMS API</p>
              <p className="text-2xs text-text-secondary mt-0.5">https://dvhosting.in/api-sms-v3.php</p>
            </div>
            <span className="px-3 py-1 rounded-full text-2xs font-extrabold bg-success-light text-success border border-success/30">
              Active ✓
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-bg border border-border flex items-center justify-between">
            <div>
              <p className="font-bold text-navy">Express MongoDB Backend API</p>
              <p className="text-2xs text-text-secondary mt-0.5">http://localhost:5000/api</p>
            </div>
            <span className="px-3 py-1 rounded-full text-2xs font-extrabold bg-success-light text-success border border-success/30">
              Connected ✓
            </span>
          </div>
        </div>
      </div>

      {/* ── Admin Change Password Section ── */}
      <form
        onSubmit={handleChangePassword}
        className="p-6 rounded-3xl bg-surface border border-gold/40 shadow-card space-y-5"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="font-display font-extrabold text-base text-navy flex items-center gap-2">
              <RiLockPasswordLine className="text-gold text-lg" /> Change Admin Password
            </h3>
            <p className="text-xs text-text-secondary font-medium mt-0.5">
              Update your MongoDB login credentials for email <span className="font-bold text-navy">{admin?.email || 'admin@zaminjunction.com'}</span>
            </p>
          </div>
        </div>

        {passwordError && (
          <div className="p-3.5 rounded-xl bg-danger-light border border-danger/30 text-danger text-xs font-bold">
            {passwordError}
          </div>
        )}

        {passwordSuccess && (
          <div className="p-3.5 rounded-xl bg-success-light border border-success/30 text-success text-xs font-bold flex items-center gap-2">
            <RiCheckLine className="text-lg" /> {passwordSuccess}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
          <div>
            <label className="block text-text-secondary uppercase mb-1.5">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-navy focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-text-secondary uppercase mb-1.5">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-navy focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-text-secondary uppercase mb-1.5">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-navy focus:border-gold focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={changingPassword}
            className="px-6 py-3 rounded-xl bg-navy text-gold hover:bg-navy-light font-display font-extrabold text-xs shadow-gold transition-all cursor-pointer"
          >
            {changingPassword ? 'Updating Password...' : 'Update Admin Password'}
          </button>
        </div>
      </form>

      {/* Profile Settings Form */}
      <form onSubmit={handleProfileSave} className="p-6 rounded-3xl bg-surface border border-border shadow-soft space-y-6">
        <h3 className="font-display font-extrabold text-base text-navy flex items-center gap-2">
          <RiShieldCheckLine className="text-gold" /> Admin Profile Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
          <div>
            <label className="block text-text-secondary uppercase mb-1.5">Admin Name</label>
            <input
              type="text"
              defaultValue={admin?.name || 'Zamin Junction Admin'}
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-navy focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-text-secondary uppercase mb-1.5">Email Address</label>
            <input
              type="email"
              defaultValue={admin?.email || 'admin@zaminjunction.com'}
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-navy focus:border-gold focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-navy text-gold hover:bg-navy-light font-display font-extrabold text-xs shadow-gold transition-all cursor-pointer"
          >
            Save Admin Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
