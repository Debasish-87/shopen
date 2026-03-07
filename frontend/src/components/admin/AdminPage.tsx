// src/components/admin/AdminPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../hooks/useAuthStore';
import { Spinner, Toast } from '../shared';
import ShopFormModal from './ShopFormModal';
import { login, fetchAdminShops, fetchStats, toggleShopStatus, deleteShop, createShop, updateShop } from '../../api/client';
import { CAT_META } from '../../lib/constants';
import type { Shop, StatsResponse, CreateShopPayload } from '../../types';

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
const LoginScreen: React.FC = () => {
  const { setAuth } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!username || !password) { setError('Both fields are required.'); return; }
    setLoading(true); setError('');
    try {
      const res = await login({ username, password });
      setAuth(res.token, res.username);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Login failed. Check credentials.');
    } finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    background: 'var(--adm-surf2)', border: '1.5px solid var(--adm-border)',
    borderRadius: 7, color: 'var(--adm-text)',
    fontFamily: "'JetBrains Mono', monospace", fontSize: '.88rem',
    outline: 'none', marginBottom: '.9rem', display: 'block',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--adm-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--adm-surf)', border: '1px solid var(--adm-border)', borderRadius: 16, padding: '2.8rem', width: 370, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 800, color: 'var(--adm-text)', marginBottom: '.2rem' }}>
          Sh<span style={{ color: 'var(--adm-amber)' }}>o</span>pen
        </div>
        <div style={{ color: 'var(--adm-muted)', fontSize: '.7rem', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: '2rem' }}>Admin Access</div>
        <input style={inputStyle} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
          onFocus={e => e.target.style.borderColor = 'var(--adm-amber)'} onBlur={e => e.target.style.borderColor = 'var(--adm-border)'}
          onKeyDown={e => e.key === 'Enter' && document.getElementById('pw-input')?.focus()} />
        <input id="pw-input" style={inputStyle} placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
          onFocus={e => e.target.style.borderColor = 'var(--adm-amber)'} onBlur={e => e.target.style.borderColor = 'var(--adm-border)'}
          onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: 12, background: loading ? '#888' : 'var(--adm-amber)', color: '#1A1208', border: 'none', borderRadius: 7, fontFamily: "'Syne', sans-serif", fontSize: '.88rem', fontWeight: 700, cursor: loading ? 'wait' : 'pointer' }}>
          {loading ? 'Signing in…' : 'Sign In →'}
        </button>
        {error && <div style={{ color: 'var(--adm-red)', fontSize: '.78rem', marginTop: '.6rem' }}>{error}</div>}
        <div style={{ marginTop: '1.4rem', fontSize: '.7rem', color: 'var(--adm-muted)', fontFamily: "'JetBrains Mono', monospace" }}>Default: admin / admin123</div>
      </div>
    </div>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
interface Toast { msg: string; type: 'success' | 'error'; }

const Dashboard: React.FC<{ onGoPublic: () => void }> = ({ onGoPublic }) => {
  const { username, logout } = useAuthStore();
  const [shops,   setShops]   = useState<Shop[]>([]);
  const [stats,   setStats]   = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [editShop, setEditShop] = useState<Shop | null | undefined>(undefined); // undefined=closed, null=new, Shop=edit
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState<Toast | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => setToast({ msg, type });

  const loadAll = useCallback(async () => {
    try {
      const [s, st] = await Promise.all([fetchAdminShops({ search: searchQ }), fetchStats()]);
      setShops(s); setStats(st);
    } catch { showToast('Failed to fetch data.', 'error'); }
    finally { setLoading(false); }
  }, [searchQ]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleToggle = async (id: number) => {
    try {
      const updated = await toggleShopStatus(id);
      setShops(prev => prev.map(s => s.id === id ? updated : s));
      loadAll(); // refresh stats
      showToast(`${updated.name} is now ${updated.is_open ? '🟢 Open' : '🔴 Closed'}`);
    } catch { showToast('Failed to toggle status.', 'error'); }
  };

  const handleDelete = async (shop: Shop) => {
    if (!window.confirm(`Delete "${shop.name}"?`)) return;
    try {
      await deleteShop(shop.id);
      setShops(prev => prev.filter(s => s.id !== shop.id));
      loadAll();
      showToast(`${shop.name} deleted.`, 'error');
    } catch { showToast('Failed to delete shop.', 'error'); }
  };

  const handleSave = async (data: CreateShopPayload) => {
    setSaving(true);
    try {
      if (editShop && 'id' in editShop) {
        const updated = await updateShop(editShop.id, data);
        setShops(prev => prev.map(s => s.id === editShop.id ? updated : s));
        showToast(`${updated.name} updated!`);
      } else {
        const created = await createShop(data);
        setShops(prev => [created, ...prev]);
        showToast(`${created.name} added!`);
      }
      loadAll();
      setEditShop(undefined);
    } catch { showToast('Failed to save shop.', 'error'); }
    finally { setSaving(false); }
  };

  const statCards = stats ? [
    { label: 'Total', value: stats.total,    color: 'var(--adm-amber)' },
    { label: 'Open',  value: stats.open,     color: 'var(--adm-green)' },
    { label: 'Closed',value: stats.closed,   color: 'var(--adm-red)'   },
    { label: 'Rate',  value: `${stats.open_rate}%`, color: 'var(--adm-amber)' },
  ] : [];

  const filtered = shops.filter(s => {
    const q = searchQ.toLowerCase();
    return !q || [s.name, s.category, s.subcat, s.address].some(x => x.toLowerCase().includes(q));
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--adm-bg)', color: 'var(--adm-text)' }}>
      {/* Topbar */}
      <div style={{ background: 'var(--adm-surf)', borderBottom: '1px solid var(--adm-border)', padding: '0 2rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem' }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: 800 }}>Sh<span style={{ color: 'var(--adm-amber)' }}>o</span>pen</div>
          <span style={{ background: 'var(--adm-amber)', color: '#1A1208', fontSize: '.58rem', fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', padding: '4px 9px', borderRadius: 4 }}>Admin</span>
          {username && <span style={{ fontSize: '.75rem', color: 'var(--adm-muted)' }}>👤 {username}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <button onClick={onGoPublic} style={{ padding: '8px 17px', borderRadius: 7, border: '1.5px solid var(--adm-border)', background: 'transparent', color: 'var(--adm-muted)', fontFamily: "'Syne', sans-serif", fontSize: '.78rem', fontWeight: 700, cursor: 'pointer' }}>← Public Site</button>
          <button onClick={() => setEditShop(null)} style={{ padding: '8px 17px', borderRadius: 7, border: 'none', background: 'var(--adm-amber)', color: '#1A1208', fontFamily: "'Syne', sans-serif", fontSize: '.78rem', fontWeight: 700, cursor: 'pointer' }}>＋ Add Shop</button>
          <button onClick={logout} style={{ padding: '8px 17px', borderRadius: 7, border: '1.5px solid rgba(248,113,113,.2)', background: 'rgba(248,113,113,.08)', color: 'var(--adm-red)', fontFamily: "'Syne', sans-serif", fontSize: '.78rem', fontWeight: 700, cursor: 'pointer' }}>Sign Out</button>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '2.2rem 2rem' }}>
        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '.9rem', marginBottom: '2.2rem' }}>
          {statCards.map(({ label, value, color }) => (
            <div key={label} style={{ background: 'var(--adm-surf)', border: '1px solid var(--adm-border)', borderRadius: 10, padding: '1.2rem 1.4rem' }}>
              <div style={{ fontSize: '.62rem', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--adm-muted)', marginBottom: '.4rem' }}>{label}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 800, color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.3rem', gap: '1rem', flexWrap: 'wrap' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.35rem', fontWeight: 800 }}>Shop Directory</h2>
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="🔍  Search shops…"
            style={{ padding: '9px 13px', background: 'var(--adm-surf2)', border: '1.5px solid var(--adm-border)', borderRadius: 7, color: 'var(--adm-text)', fontSize: '.83rem', outline: 'none', width: 220 }}
            onFocus={e => e.target.style.borderColor = 'var(--adm-amber)'} onBlur={e => e.target.style.borderColor = 'var(--adm-border)'} />
        </div>

        {/* Table */}
        <div style={{ background: 'var(--adm-surf)', border: '1px solid var(--adm-border)', borderRadius: 12, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' }}>
              <Spinner color="var(--adm-amber)" /><span style={{ color: 'var(--adm-muted)' }}>Loading…</span>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--adm-surf2)', borderBottom: '1px solid var(--adm-border)' }}>
                  {['Shop', 'Category', 'Hours', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '13px 18px', textAlign: 'left', fontSize: '.62rem', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--adm-muted)', fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--adm-muted)', fontStyle: 'italic' }}>No shops found.</td></tr>
                ) : filtered.map(s => {
                  const m = CAT_META[s.category];
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--adm-border)' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--adm-surf2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', overflow: 'hidden', flexShrink: 0 }}>
                            {s.photo_url ? <img src={s.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : s.icon}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '.87rem' }}>{s.name}</div>
                            <div style={{ fontSize: '.68rem', color: 'var(--adm-muted)', marginTop: 2 }}>{s.address}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ display: 'inline-block', fontSize: '.62rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 4, background: m.bg + '33', color: m.color }}>{s.category}</span>
                        <span style={{ fontSize: '.78rem', color: 'var(--adm-muted)', marginLeft: 6 }}>{s.subcat}</span>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '.82rem', color: 'var(--adm-muted)' }}>{s.hours}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <button onClick={() => handleToggle(s.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 13px', borderRadius: 20, fontSize: '.7rem', fontWeight: 700, fontFamily: "'Syne', sans-serif", border: 'none', cursor: 'pointer', background: s.is_open ? 'rgba(52,211,153,.1)' : 'rgba(248,113,113,.1)', color: s.is_open ? 'var(--adm-green)' : 'var(--adm-red)' }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', display: 'inline-block', background: s.is_open ? 'var(--adm-green)' : 'var(--adm-red)', animation: s.is_open ? 'adminPulse 1.4s infinite' : 'none' }} />
                          {s.is_open ? 'Open' : 'Closed'}
                        </button>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', gap: '.4rem' }}>
                          {[{ lbl: '✏ Edit', fn: () => setEditShop(s), hc: 'var(--adm-amber)' }, { lbl: '🗑 Delete', fn: () => handleDelete(s), hc: 'var(--adm-red)' }].map(({ lbl, fn, hc }) => (
                            <button key={lbl} onClick={fn} style={{ padding: '6px 11px', borderRadius: 6, border: '1.5px solid var(--adm-border)', background: 'transparent', color: 'var(--adm-muted)', fontSize: '.78rem', cursor: 'pointer' }}
                              onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = hc; (e.target as HTMLButtonElement).style.color = hc; }}
                              onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = 'var(--adm-border)'; (e.target as HTMLButtonElement).style.color = 'var(--adm-muted)'; }}
                            >{lbl}</button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {editShop !== undefined && (
        <ShopFormModal shop={editShop} onSave={handleSave} onClose={() => setEditShop(undefined)} saving={saving} />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
};

// ─── ADMIN PAGE (auth gate) ───────────────────────────────────────────────────
const AdminPage: React.FC<{ onGoPublic: () => void }> = ({ onGoPublic }) => {
  const { isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const h = () => logout();
    window.addEventListener('auth:logout', h);
    return () => window.removeEventListener('auth:logout', h);
  }, [logout]);

  if (!isAuthenticated) return <LoginScreen />;
  return <Dashboard onGoPublic={onGoPublic} />;
};

export default AdminPage;
