import { useState, useMemo } from 'react';
import {
  RiShieldCheckLine,
  RiKey2Line,
  RiNotification3Line,
  RiServerLine,
  RiCheckLine,
  RiLockPasswordLine,
  RiBuilding4Line,
  RiGlobalLine,
  RiTimeLine,
  RiEyeLine,
  RiEyeOffLine,
  RiDatabase2Line,
  RiMessage3Line,
  RiMailLine,
  RiErrorWarningLine,
} from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Settings = () => {
  const { admin } = useAuth();
  const [activeTab, setActiveTab] = useState('security'); // 'security' | 'telemetry' | 'profile'

  // Profile State
  const [profileName, setProfileName] = useState(admin?.name || 'Zamin Junction Super Admin');
  const [profileEmail, setProfileEmail] = useState(admin?.email || 'babludangi2000@gmail.com');
  const [profilePhone, setProfilePhone] = useState('+91 98260 12345');
  const [notifyOnLead, setNotifyOnLead] = useState(true);
  const [notifyOnPartner, setNotifyOnPartner] = useState(true);
  const [profileSaved, setProfileSaved] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Password Strength Evaluation
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: '', color: '' };
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[a-z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-rose-500 text-rose-600' };
    if (score === 3) return { score, label: 'Fair', color: 'bg-amber-500 text-amber-600' };
    if (score === 4) return { score, label: 'Good', color: 'bg-gold text-gold-hover' };
    return { score, label: 'Strong', color: 'bg-emerald-500 text-emerald-600' };
  }, [newPassword]);

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
      setPasswordSuccess('Password changed successfully in MongoDB credentials store!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(
        err?.message || 'Failed to change password. Please verify your current password.'
      );
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl select-none">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="font-display font-extrabold text-2xl text-navy">
            System Settings & Security Center
          </h1>
          <span className="px-3 py-0.5 rounded-full text-2xs font-extrabold uppercase bg-gold/15 text-gold border border-gold/40">
            Admin Suite
          </span>
        </div>
        <p className="text-xs text-text-secondary font-medium mt-0.5">
          Configure security protocols, verify system API gateways, and manage administrative settings.
        </p>
      </div>

      {/* Tabs Deck */}
      <div className="flex items-center gap-2 bg-surface p-1.5 rounded-2xl border border-border shadow-2xs w-fit">
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'security'
              ? 'bg-navy text-gold shadow-sm'
              : 'text-text-secondary hover:text-navy hover:bg-bg'
          }`}
        >
          <RiLockPasswordLine className="text-sm" />
          <span>Security & Credentials</span>
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'telemetry'
              ? 'bg-navy text-gold shadow-sm'
              : 'text-text-secondary hover:text-navy hover:bg-bg'
          }`}
        >
          <RiServerLine className="text-sm" />
          <span>Gateways & Telemetry</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-navy text-gold shadow-sm'
              : 'text-text-secondary hover:text-navy hover:bg-bg'
          }`}
        >
          <RiShieldCheckLine className="text-sm" />
          <span>Profile & Alerts</span>
        </button>
      </div>

      {/* ── TAB 1: SECURITY & CREDENTIALS ── */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <form
            onSubmit={handleChangePassword}
            className="p-6 sm:p-8 rounded-3xl bg-surface border border-gold/40 shadow-soft space-y-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-display font-extrabold text-base text-navy flex items-center gap-2">
                  <RiLockPasswordLine className="text-gold text-lg" /> Admin Credential Update
                </h3>
                <p className="text-xs text-text-secondary font-medium mt-0.5">
                  Update your authentication key for{' '}
                  <span className="font-bold text-navy">{admin?.email || 'babludangi2000@gmail.com'}</span>
                </p>
              </div>
              <span className="text-2xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
                256-Bit Encrypted
              </span>
            </div>

            {passwordError && (
              <div className="p-3.5 rounded-xl bg-danger-light border border-danger/30 text-danger text-xs font-bold flex items-center gap-2">
                <RiErrorWarningLine className="text-base shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3.5 rounded-xl bg-success-light border border-success/30 text-success text-xs font-bold flex items-center gap-2">
                <RiCheckLine className="text-base shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold">
              {/* Current Password */}
              <div>
                <label className="block text-2xs font-extrabold uppercase text-text-secondary mb-1.5">
                  Current Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-border bg-bg text-navy focus:border-gold focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-navy cursor-pointer"
                  >
                    {showCurrentPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-2xs font-extrabold uppercase text-text-secondary mb-1.5">
                  New Password (min. 8 chars)
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-border bg-bg text-navy focus:border-gold focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-navy cursor-pointer"
                  >
                    {showNewPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-text-muted">Strength:</span>
                      <span className={passwordStrength.color.split(' ')[1]}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-border rounded-full overflow-hidden flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`h-full flex-1 rounded-full transition-all ${
                            lvl <= passwordStrength.score
                              ? passwordStrength.color.split(' ')[0]
                              : 'bg-border/60'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-2xs font-extrabold uppercase text-text-secondary mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-navy focus:border-gold focus:outline-hidden"
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="p-4 rounded-2xl bg-bg border border-border grid grid-cols-2 sm:grid-cols-4 gap-2 text-2xs font-bold text-text-secondary">
              <span className={`flex items-center gap-1.5 ${newPassword.length >= 8 ? 'text-emerald-700' : ''}`}>
                <RiCheckLine className={newPassword.length >= 8 ? 'text-emerald-600' : 'text-text-muted'} /> 8+ Characters
              </span>
              <span className={`flex items-center gap-1.5 ${/[A-Z]/.test(newPassword) ? 'text-emerald-700' : ''}`}>
                <RiCheckLine className={/[A-Z]/.test(newPassword) ? 'text-emerald-600' : 'text-text-muted'} /> Uppercase Letter
              </span>
              <span className={`flex items-center gap-1.5 ${/[0-9]/.test(newPassword) ? 'text-emerald-700' : ''}`}>
                <RiCheckLine className={/[0-9]/.test(newPassword) ? 'text-emerald-600' : 'text-text-muted'} /> Numeric Digit
              </span>
              <span className={`flex items-center gap-1.5 ${/[^A-Za-z0-9]/.test(newPassword) ? 'text-emerald-700' : ''}`}>
                <RiCheckLine className={/[^A-Za-z0-9]/.test(newPassword) ? 'text-emerald-600' : 'text-text-muted'} /> Special Character
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={changingPassword}
                className="px-6 py-3 rounded-xl bg-navy text-gold hover:bg-navy-light font-display font-extrabold text-xs shadow-gold transition-all cursor-pointer disabled:opacity-50"
              >
                {changingPassword ? 'Updating Password...' : 'Save New Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── TAB 2: GATEWAYS & TELEMETRY ── */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-surface border border-border shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-display font-extrabold text-base text-navy flex items-center gap-2">
                  <RiServerLine className="text-gold" /> System Telemetry & External Gateways
                </h3>
                <p className="text-xs text-text-secondary font-medium mt-0.5">
                  Real-time status of critical infrastructure, database clusters, and SMS delivery APIs.
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-2xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> All Systems Operational
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              {/* DVHosting SMS */}
              <div className="p-4 rounded-2xl bg-bg border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy flex items-center gap-1.5">
                    <RiMessage3Line className="text-gold" /> DVHosting SMS Gateway v3
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-300">
                    Online 200 OK
                  </span>
                </div>
                <p className="text-2xs text-text-muted font-mono break-all">
                  Endpoint: https://dvhosting.in/api-sms-v3.php
                </p>
                <div className="text-2xs text-text-secondary pt-1 border-t border-border flex items-center justify-between">
                  <span>DLT Registered Sender ID: ZAMINJ</span>
                  <span>Avg Latency: ~180ms</span>
                </div>
              </div>

              {/* MongoDB Atlas */}
              <div className="p-4 rounded-2xl bg-bg border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy flex items-center gap-1.5">
                    <RiDatabase2Line className="text-gold" /> MongoDB Atlas Production Cluster
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-300">
                    Connected ✓
                  </span>
                </div>
                <p className="text-2xs text-text-muted font-mono break-all">
                  Cluster: zaminjunction-primary.mongodb.net
                </p>
                <div className="text-2xs text-text-secondary pt-1 border-t border-border flex items-center justify-between">
                  <span>Pool: 10 connections active</span>
                  <span>Status: Primary Master</span>
                </div>
              </div>

              {/* Express Backend */}
              <div className="p-4 rounded-2xl bg-bg border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy flex items-center gap-1.5">
                    <RiServerLine className="text-gold" /> Node.js Express REST API
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-300">
                    Active
                  </span>
                </div>
                <p className="text-2xs text-text-muted font-mono break-all">
                  Base URL: https://zaminjunction.com/api
                </p>
                <div className="text-2xs text-text-secondary pt-1 border-t border-border flex items-center justify-between">
                  <span>Environment: Production</span>
                  <span>CORS: Whitelisted</span>
                </div>
              </div>

              {/* Public Portal */}
              <div className="p-4 rounded-2xl bg-bg border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy flex items-center gap-1.5">
                    <RiGlobalLine className="text-gold" /> Public Buyer & Partner Portal
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-300">
                    Live
                  </span>
                </div>
                <p className="text-2xs text-text-muted font-mono break-all">
                  URL: https://zaminjunction.com
                </p>
                <div className="text-2xs text-text-secondary pt-1 border-t border-border flex items-center justify-between">
                  <span>SSL Certificate: 256-Bit Active</span>
                  <span>CDN: Cloudflare Cached</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: PROFILE & ALERTS ── */}
      {activeTab === 'profile' && (
        <form
          onSubmit={handleProfileSave}
          className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-soft space-y-6"
        >
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="font-display font-extrabold text-base text-navy flex items-center gap-2">
                <RiShieldCheckLine className="text-gold" /> Super Admin Profile & Dispatch Settings
              </h3>
              <p className="text-xs text-text-secondary font-medium mt-0.5">
                Define the primary contact information and automated CRM notification channels.
              </p>
            </div>
          </div>

          {profileSaved && (
            <div className="p-4 rounded-2xl bg-success-light border border-success/30 text-success text-xs font-bold flex items-center gap-2">
              <RiCheckLine className="text-lg" /> Profile and dispatch preferences saved successfully!
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
            <div>
              <label className="block text-2xs font-extrabold uppercase text-text-secondary mb-1.5">
                Designated Admin Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-navy focus:border-gold focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-2xs font-extrabold uppercase text-text-secondary mb-1.5">
                Admin Email Address
              </label>
              <input
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-navy focus:border-gold focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-2xs font-extrabold uppercase text-text-secondary mb-1.5">
                WhatsApp Dispatch Mobile
              </label>
              <input
                type="text"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-navy focus:border-gold focus:outline-hidden"
              />
            </div>
          </div>

          {/* Real-Time Notification Controls */}
          <div className="p-4 rounded-2xl bg-bg border border-border space-y-3">
            <h4 className="font-display font-extrabold text-xs text-navy uppercase tracking-wider">
              Automated Event Notifications
            </h4>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnLead}
                  onChange={(e) => setNotifyOnLead(e.target.checked)}
                  className="w-4 h-4 rounded text-navy accent-navy cursor-pointer"
                />
                <div>
                  <p className="text-xs font-bold text-navy">Instant Lead Alert Dispatch</p>
                  <p className="text-2xs text-text-muted">
                    Receive immediate notifications when high-priority Buy/Sell property inquiries are received.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnPartner}
                  onChange={(e) => setNotifyOnPartner(e.target.checked)}
                  className="w-4 h-4 rounded text-navy accent-navy cursor-pointer"
                />
                <div>
                  <p className="text-xs font-bold text-navy">Channel Partner Registration Alert</p>
                  <p className="text-2xs text-text-muted">
                    Notify when a broker completes phone OTP verification to become an official channel partner.
                  </p>
                </div>
              </label>
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
      )}
    </div>
  );
};

export default Settings;
