// src/components/public/PublicPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { CatTag, StatusBadge, Spinner } from '../shared';
import { fetchShops } from '../../api/client';
import { CAT_META, SUBCATS, CATEGORIES } from '../../lib/constants';
import type { Shop, Category, StatusFilter, ShopFilters } from '../../types';

// ─── SHOP CARD ────────────────────────────────────────────────────────────────
const ShopCard: React.FC<{ shop: Shop; index: number; onClick: (s: Shop) => void }> = ({ shop, index, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => onClick(shop)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 14,
        overflow: 'hidden', cursor: 'pointer',
        transition: 'transform .22s, box-shadow .22s, border-color .22s',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: hovered ? '0 18px 44px rgba(0,0,0,.1)' : 'none',
        borderColor: hovered ? '#c8c4bc' : 'var(--border)',
        animation: `fadeUp .35s ease ${index * 0.05}s both`,
      }}
    >
      <div style={{ padding: '1.2rem 1.2rem .7rem', display: 'flex', alignItems: 'flex-start', gap: 11 }}>
        <div style={{ width: 56, height: 56, borderRadius: 10, flexShrink: 0, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem', overflow: 'hidden' }}>
          {shop.photo_url
            ? <img src={shop.photo_url} alt={shop.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            : shop.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 4 }}><CatTag cat={shop.category} subcat={shop.subcat} /></div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '.98rem', fontWeight: 700, color: 'var(--dark)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shop.name}</div>
        </div>
        <StatusBadge open={shop.is_open} />
      </div>
      <div style={{ borderTop: '1px solid var(--border)', margin: '0 1.2rem' }} />
      <div style={{ padding: '.8rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '.78rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5, flex: 1, minWidth: 0 }}>
          📍 <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shop.address}</span>
        </div>
        <div style={{ fontSize: '.73rem', background: 'var(--bg2)', color: 'var(--dark)', padding: '4px 10px', borderRadius: 5, fontWeight: 500, flexShrink: 0, marginLeft: '.5rem' }}>{shop.hours}</div>
      </div>
    </div>
  );
};

// ─── SHOP MODAL ───────────────────────────────────────────────────────────────
const ShopModal: React.FC<{ shop: Shop; onClose: () => void }> = ({ shop, onClose }) => {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{
      position: 'fixed', inset: 0, background: 'rgba(10,10,8,.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 500, backdropFilter: 'blur(7px)', padding: '1rem', animation: 'fadeUp .2s ease',
    }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 550, maxHeight: '90vh', overflowY: 'auto', animation: 'slideIn .25s ease' }}>
        {/* Banner */}
        <div style={{ height: 190, position: 'relative', background: 'var(--bg2)', overflow: 'hidden' }}>
          {shop.photo_url
            ? <img src={shop.photo_url} alt={shop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#f0ebe2,#e0d9cc)', fontSize: '4.5rem' }}>{shop.icon}</div>
          }
          <button onClick={onClose} style={{ position: 'absolute', top: 13, right: 13, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,.45)', border: 'none', color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          <div style={{
            position: 'absolute', bottom: 14, left: 16, display: 'flex', alignItems: 'center', gap: 7,
            padding: '7px 16px', borderRadius: 30, fontFamily: "'Syne', sans-serif", fontSize: '.72rem', fontWeight: 700, letterSpacing: '.07em',
            backdropFilter: 'blur(8px)', background: shop.is_open ? 'rgba(26,158,92,.88)' : 'rgba(217,48,37,.88)', color: '#fff',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', display: 'inline-block', animation: shop.is_open ? 'blinkDot 1.3s infinite' : 'none' }} />
            {shop.is_open ? 'Open Now' : 'Closed'}
          </div>
        </div>
        {/* Body */}
        <div style={{ padding: '1.7rem' }}>
          <div style={{ marginBottom: '.65rem' }}><CatTag cat={shop.category} subcat={shop.subcat} size="md" /></div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.45rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '.3rem' }}>{shop.name}</div>
          <div style={{ fontSize: '.82rem', color: 'var(--muted)', marginBottom: '1rem' }}>📍 {shop.address}</div>
          {shop.description && <div style={{ fontSize: '.9rem', color: '#555', lineHeight: 1.76, borderLeft: '3px solid var(--amber)', paddingLeft: 13, marginBottom: '1.4rem' }}>{shop.description}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.7rem', marginBottom: '1.4rem' }}>
            {[['📞 Phone', shop.phone || '—'], ['🕐 Hours', shop.hours || '—'], ['🏷 Category', shop.category], ['🍴 Type', shop.subcat]].map(([lbl, val]) => (
              <div key={lbl} style={{ background: 'var(--bg)', borderRadius: 8, padding: '.8rem 1rem' }}>
                <div style={{ fontSize: '.62rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 3 }}>{lbl}</div>
                <div style={{ fontSize: '.86rem', fontWeight: 500, color: 'var(--dark)' }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1.5px solid var(--border)', height: 185 }}>
            {shop.map_query
              ? <iframe loading="lazy" title="map" src={`https://maps.google.com/maps?q=${shop.map_query}&output=embed`} style={{ width: '100%', height: '100%', border: 'none' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg2)', color: 'var(--muted)' }}>📍 Location not set</div>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PUBLIC PAGE ──────────────────────────────────────────────────────────────
const PublicPage: React.FC<{ onGoAdmin: () => void }> = ({ onGoAdmin }) => {
  const [shops,     setShops]     = useState<Shop[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [selected,  setSelected]  = useState<Shop | null>(null);
  const [filters,   setFilters]   = useState<ShopFilters>({ category: '', subcat: '', status: 'all', search: '' });

  const load = useCallback(async () => {
    try {
      const data = await fetchShops(filters);
      setShops(data);
      setError('');
    } catch {
      setError('Failed to load shops. Is the backend running?');
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const id = setInterval(load, 10000); return () => clearInterval(id); }, [load]);

  const openCount = shops.filter(s => s.is_open).length;
  const catBtn = (cat: Category | 'all') => {
    const isActive = filters.category === cat || (cat === 'all' && !filters.category);
    const color = cat === 'all' ? '#111108' : CAT_META[cat as Category].color;
    return {
      display: 'flex', alignItems: 'center', gap: 9, padding: '11px 22px', borderRadius: 50,
      fontFamily: "'Syne', sans-serif", fontSize: '.84rem', fontWeight: 700, cursor: 'pointer',
      transition: 'all .22s',
      border: `2px solid ${isActive ? color : 'var(--border)'}`,
      background: isActive ? color : '#fff',
      color: isActive ? '#fff' : 'var(--dark)',
    } as React.CSSProperties;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2.5rem', height: 66, borderBottom: '2.5px solid var(--amber)' }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.9rem', fontWeight: 800, color: '#fff', letterSpacing: -1 }}>Sh<span style={{ color: 'var(--amber)' }}>o</span>pen</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--glow)', display: 'inline-block', animation: 'blinkDot 1.4s infinite' }} />
            <span style={{ fontSize: '.65rem', letterSpacing: '.14em', textTransform: 'uppercase', color: '#aaa' }}>Live</span>
          </div>
          <button onClick={onGoAdmin} style={{ fontSize: '.75rem', padding: '7px 15px', border: '1.5px solid #2e2e2e', borderRadius: 5, color: '#aaa', background: 'transparent', fontFamily: "'Syne', sans-serif" }}>⚙ Admin</button>
        </div>
      </header>

      {/* Ticker */}
      <div style={{ background: 'var(--amber)', overflow: 'hidden', whiteSpace: 'nowrap', padding: '7px 0' }}>
        <span style={{ display: 'inline-block', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--dark)', animation: 'ticker 28s linear infinite' }}>
          {shops.filter(s => s.is_open).map(s => `✦ ${s.name} is OPEN`).join('   ') || '✦ Fetching live status…'}
        </span>
      </div>

      {/* Hero */}
      <section style={{ padding: '4rem 2.5rem 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '.62rem', letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '.75rem' }}>✦ Real-time Shop Status</p>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(2.6rem,5vw,4.8rem)', lineHeight: 1.06, marginBottom: '.9rem' }}>
          Find What's <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>Open</em><br />Right Now.
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '.97rem', maxWidth: 400, lineHeight: 1.72 }}>
          Search shops, browse by category, and check live status — all in one place.
        </p>
      </section>

      {/* Search */}
      <div style={{ maxWidth: 1100, margin: '1.5rem auto 0', padding: '0 2.5rem' }}>
        <div style={{ position: 'relative', maxWidth: 540 }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', pointerEvents: 'none' }}>🔍</span>
          <input
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value, subcat: '' }))}
            placeholder="Search shop name, type, location…"
            style={{ width: '100%', padding: '14px 18px 14px 50px', border: '2px solid var(--border)', borderRadius: 10, background: '#fff', fontSize: '.94rem', color: 'var(--dark)', outline: 'none' }}
          />
        </div>
      </div>

      {/* Category chips */}
      <div style={{ maxWidth: 1100, margin: '2rem auto 0', padding: '0 2.5rem' }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '.62rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.9rem' }}>Browse by Category</div>
        <div style={{ display: 'flex', gap: '.7rem', flexWrap: 'wrap' }}>
          <button style={catBtn('all')} onClick={() => setFilters(f => ({ ...f, category: '', subcat: '', status: 'all' }))}>
            <span>🏪</span> All Shops
          </button>
          {CATEGORIES.map(cat => (
            <button key={cat} style={catBtn(cat)} onClick={() => setFilters(f => ({ ...f, category: cat, subcat: '', status: 'all' }))}>
              <span>{CAT_META[cat].icon}</span> {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Status filter */}
      {filters.category && (
        <div style={{ maxWidth: 1100, margin: '1.1rem auto 0', padding: '0 2.5rem', animation: 'fadeUp .2s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.55rem', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)', marginRight: '.3rem' }}>Status:</span>
            {(['all', 'open', 'closed'] as StatusFilter[]).map(s => {
              const active = filters.status === s;
              const colors: Record<StatusFilter, string> = { all: 'var(--dark)', open: 'var(--green)', closed: 'var(--red)' };
              const labels = { all: 'All', open: '🟢 Open', closed: '🔴 Closed' };
              return (
                <button key={s} onClick={() => setFilters(f => ({ ...f, status: s }))} style={{
                  padding: '8px 19px', borderRadius: 50, fontFamily: "'Syne', sans-serif", fontSize: '.79rem', fontWeight: 700, cursor: 'pointer',
                  border: `2px solid ${active ? colors[s] : 'var(--border)'}`,
                  background: active ? colors[s] : '#fff',
                  color: active ? '#fff' : 'var(--muted)',
                }}>{labels[s]}</button>
              );
            })}
          </div>
        </div>
      )}

      {/* Subcategory pills */}
      {filters.category && SUBCATS[filters.category] && (
        <div style={{ maxWidth: 1100, margin: '.9rem auto 0', padding: '0 2.5rem', animation: 'fadeUp .25s ease' }}>
          <div style={{ display: 'flex', gap: '.45rem', flexWrap: 'wrap' }}>
            {SUBCATS[filters.category].map(sub => {
              const active = filters.subcat === sub;
              return (
                <button key={sub} onClick={() => setFilters(f => ({ ...f, subcat: active ? '' : sub }))} style={{
                  padding: '6px 15px', borderRadius: 50, fontSize: '.77rem', fontWeight: 500, cursor: 'pointer',
                  border: `1.5px solid ${active ? 'var(--dark)' : 'var(--border)'}`,
                  background: active ? 'var(--dark)' : 'transparent',
                  color: active ? '#fff' : 'var(--muted)',
                }}>{sub}</button>
              );
            })}
          </div>
        </div>
      )}

      {/* Results header */}
      <div style={{ maxWidth: 1100, margin: '1.75rem auto .65rem', padding: '0 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '.78rem', color: 'var(--muted)' }}>{shops.length} shop{shops.length !== 1 ? 's' : ''} found</span>
        <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}><span style={{ color: 'var(--green)', fontWeight: 600 }}>{openCount}</span> open now</span>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2.5rem 5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.2rem' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem', gap: '1rem' }}>
            <Spinner /><span style={{ color: 'var(--muted)' }}>Loading shops…</span>
          </div>
        ) : error ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', color: 'var(--red)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>⚠️</div>
            <p>{error}</p>
          </div>
        ) : shops.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', color: 'var(--muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '.75rem' }}>🔍</div>
            <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.5rem', color: 'var(--dark)', marginBottom: '.4rem' }}>No shops found</h3>
            <p>Try a different search or filter.</p>
          </div>
        ) : shops.map((shop, i) => (
          <ShopCard key={shop.id} shop={shop} index={i} onClick={setSelected} />
        ))}
      </div>

      {/* Footer */}
      <footer style={{ background: 'var(--dark)', color: '#555', textAlign: 'center', padding: '1.6rem', fontSize: '.78rem' }}>
        © 2025 <span style={{ color: 'var(--amber)', fontFamily: "'Syne', sans-serif" }}>Shopen</span> — Real-time Shop Directory
      </footer>

      {selected && <ShopModal shop={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default PublicPage;
