// src/components/admin/ShopFormModal.tsx
import React, { useState, useEffect } from 'react';
import type { Shop, Category, CreateShopPayload } from '../../types';
import { AdminInput, AdminSelect } from '../shared';
import { CAT_META, SUBCATS, CATEGORIES } from '../../lib/constants';

interface Props {
  shop: Shop | null;   // null = create new
  onSave: (data: CreateShopPayload) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}

const initialForm = (): CreateShopPayload => ({
  name: '', category: 'Food', subcat: 'Restaurant', icon: '🏪',
  address: '', phone: '', hours: '', is_open: true,
  description: '', photo_url: '', map_query: '',
});

const ShopFormModal: React.FC<Props> = ({ shop, onSave, onClose, saving }) => {
  const [form, setForm] = useState<CreateShopPayload>(() =>
    shop ? {
      name: shop.name, category: shop.category, subcat: shop.subcat, icon: shop.icon,
      address: shop.address, phone: shop.phone, hours: shop.hours, is_open: shop.is_open,
      description: shop.description, photo_url: shop.photo_url, map_query: shop.map_query,
    } : initialForm()
  );

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  // Reset subcat when category changes
  useEffect(() => {
    const subs = SUBCATS[form.category];
    if (!subs.includes(form.subcat)) setForm(f => ({ ...f, subcat: subs[0] }));
  }, [form.category]);

  const set = <K extends keyof CreateShopPayload>(k: K, v: CreateShopPayload[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.name.trim()) return alert('Shop name is required.');
    onSave(form);
  };

  const m = CAT_META[form.category];
  const sectionTitle = (txt: string) => (
    <div style={{ fontSize: '.62rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--adm-amber)', margin: '1.3rem 0 .8rem', paddingBottom: '.5rem', borderBottom: '1px solid var(--adm-border)' }}>{txt}</div>
  );

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.72)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 300, backdropFilter: 'blur(5px)', padding: '1rem', animation: 'fadeUp .2s ease',
    }}>
      <div style={{
        background: 'var(--adm-surf)', border: '1px solid var(--adm-border)',
        borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto',
        animation: 'slideIn .22s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.6rem 1.8rem 0' }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: 'var(--adm-text)' }}>
            {shop ? 'Edit Shop Profile' : 'Add New Shop'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--adm-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ padding: '1.4rem 1.8rem 1.8rem' }}>
          {/* Live preview */}
          <div style={{ background: 'var(--adm-surf2)', border: '1.5px solid var(--adm-border)', borderRadius: 10, padding: '1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 60, height: 60, borderRadius: 10, overflow: 'hidden', background: 'var(--adm-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0 }}>
              {form.photo_url ? <img src={form.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : (form.icon || '🏪')}
            </div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, color: 'var(--adm-text)' }}>{form.name || 'New Shop'}</div>
              <div style={{ fontSize: '.73rem', color: 'var(--adm-muted)', marginTop: 3 }}>{form.category} · {form.subcat}</div>
              <div style={{ marginTop: 5 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: form.is_open ? 'rgba(52,211,153,.12)' : 'rgba(248,113,113,.12)', color: form.is_open ? 'var(--adm-green)' : 'var(--adm-red)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: form.is_open ? 'var(--adm-green)' : 'var(--adm-red)', display: 'inline-block', animation: form.is_open ? 'adminPulse 1.4s infinite' : 'none' }} />
                  {form.is_open ? 'Open' : 'Closed'}
                </span>
              </div>
            </div>
          </div>

          {sectionTitle('Basic Info')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.9rem' }}>
            <AdminInput label="Shop Name *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Golden Bakery" />
            <AdminInput label="Icon (emoji)" value={form.icon} onChange={e => set('icon', e.target.value)} placeholder="🏪" maxLength={4} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.9rem' }}>
            <AdminSelect label="Category *" value={form.category} onChange={e => set('category', e.target.value as Category)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_META[c].icon} {c}</option>)}
            </AdminSelect>
            <AdminSelect label="Sub-type *" value={form.subcat} onChange={e => set('subcat', e.target.value)}>
              {SUBCATS[form.category].map(s => <option key={s} value={s}>{s}</option>)}
            </AdminSelect>
          </div>

          {sectionTitle('Contact & Hours')}
          <AdminInput label="Address" value={form.address} onChange={e => set('address', e.target.value)} placeholder="e.g. 12 MG Road, Bhubaneswar" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.9rem' }}>
            <AdminInput label="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
            <AdminInput label="Business Hours" value={form.hours} onChange={e => set('hours', e.target.value)} placeholder="9 AM – 9 PM" />
          </div>

          {sectionTitle('Shop Profile')}
          <AdminInput label="Photo URL" value={form.photo_url} onChange={e => set('photo_url', e.target.value)} placeholder="https://example.com/shop.jpg" />
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '.62rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--adm-muted)', marginBottom: '.45rem' }}>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Tell customers about your shop…" rows={3}
              style={{ width: '100%', padding: '10px 13px', background: 'var(--adm-surf2)', border: '1.5px solid var(--adm-border)', borderRadius: 7, color: 'var(--adm-text)', fontSize: '.88rem', outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
              onFocus={e => e.target.style.borderColor = 'var(--adm-amber)'}
              onBlur={e => e.target.style.borderColor = 'var(--adm-border)'}
            />
          </div>
          <AdminInput label="Google Maps Query" value={form.map_query} onChange={e => set('map_query', e.target.value)} placeholder="e.g. Spice+Garden+MG+Road+Bhubaneswar" />

          {sectionTitle('Status')}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--adm-surf2)', border: '1.5px solid var(--adm-border)', borderRadius: 7, padding: '10px 13px', marginBottom: '1.4rem' }}>
            <span style={{ fontSize: '.88rem', color: 'var(--adm-text)', fontWeight: 500 }}>{form.is_open ? '🟢 Open' : '🔴 Closed'}</span>
            <div onClick={() => set('is_open', !form.is_open)} style={{ width: 44, height: 24, borderRadius: 24, cursor: 'pointer', background: form.is_open ? 'var(--adm-green)' : 'var(--adm-border)', position: 'relative', transition: 'background .3s' }}>
              <div style={{ position: 'absolute', width: 18, height: 18, borderRadius: '50%', background: '#fff', top: 3, left: form.is_open ? 23 : 3, transition: 'left .3s' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.7rem' }}>
            <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 7, border: '1.5px solid var(--adm-border)', background: 'transparent', color: 'var(--adm-muted)', fontFamily: "'Syne', sans-serif", fontSize: '.82rem', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSubmit} disabled={saving} style={{ padding: '9px 18px', borderRadius: 7, border: 'none', background: saving ? '#888' : 'var(--adm-amber)', color: '#1A1208', fontFamily: "'Syne', sans-serif", fontSize: '.82rem', fontWeight: 700, cursor: saving ? 'wait' : 'pointer' }}>
              {saving ? 'Saving…' : 'Save Shop'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopFormModal;
