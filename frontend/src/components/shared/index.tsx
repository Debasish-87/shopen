// src/components/shared/index.tsx
import React, { useEffect, useRef } from 'react';
import type { Category } from '../../types';
import { CAT_META } from '../../lib/constants';

// ─── CAT TAG ─────────────────────────────────────────────────────────────────
interface CatTagProps { cat: Category; subcat?: string; size?: 'sm' | 'md'; }

export const CatTag: React.FC<CatTagProps> = ({ cat, subcat, size = 'sm' }) => {
  const m = CAT_META[cat];
  return (
    <span style={{
      display: 'inline-block',
      fontSize: size === 'sm' ? '.62rem' : '.7rem',
      fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
      padding: size === 'sm' ? '3px 8px' : '4px 11px', borderRadius: 4,
      background: m.bg, color: m.color,
    }}>
      {cat}{subcat ? ` · ${subcat}` : ''}
    </span>
  );
};

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
interface StatusBadgeProps { open: boolean; size?: 'sm' | 'md'; }

export const StatusBadge: React.FC<StatusBadgeProps> = ({ open, size = 'sm' }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: size === 'sm' ? '5px 12px' : '7px 16px',
    borderRadius: 20, fontSize: size === 'sm' ? '.66rem' : '.75rem',
    fontWeight: 700, fontFamily: "'Syne', sans-serif",
    letterSpacing: '.06em', textTransform: 'uppercase', flexShrink: 0,
    background: open ? '#EDFAF3' : '#FEF0EF',
    color: open ? 'var(--green)' : 'var(--red)',
  }}>
    <span style={{
      width: size === 'sm' ? 7 : 9, height: size === 'sm' ? 7 : 9,
      borderRadius: '50%', flexShrink: 0, display: 'inline-block',
      background: open ? 'var(--glow)' : 'var(--red)',
      animation: open ? 'glowPulse 1.4s ease-in-out infinite' : 'none',
    }} />
    {open ? 'Open' : 'Closed'}
  </span>
);

// ─── SPINNER ─────────────────────────────────────────────────────────────────
export const Spinner: React.FC<{ size?: number; color?: string }> = ({
  size = 32, color = 'var(--amber)',
}) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    border: `3px solid ${color}22`,
    borderTop: `3px solid ${color}`,
    animation: 'spin .8s linear infinite',
    display: 'inline-block',
  }} />
);

// ─── TOAST ───────────────────────────────────────────────────────────────────
interface ToastProps { msg: string; type?: 'success' | 'error'; onDone: () => void; }

export const Toast: React.FC<ToastProps> = ({ msg, type = 'success', onDone }) => {
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    timer.current = setTimeout(onDone, 3000);
    return () => clearTimeout(timer.current);
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', bottom: '1.8rem', right: '1.8rem',
      background: 'var(--adm-surf)', border: '1px solid var(--adm-border)',
      borderLeft: `4px solid ${type === 'error' ? 'var(--adm-red)' : 'var(--adm-green)'}`,
      padding: '.9rem 1.4rem', borderRadius: 8, fontSize: '.85rem',
      boxShadow: '0 8px 30px rgba(0,0,0,.4)', zIndex: 999,
      color: 'var(--adm-text)', animation: 'slideIn .28s ease',
    }}>
      {msg}
    </div>
  );
};

// ─── ADMIN INPUT ─────────────────────────────────────────────────────────────
interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}
export const AdminInput: React.FC<AdminInputProps> = ({ label, ...props }) => (
  <div style={{ marginBottom: '1.1rem' }}>
    {label && (
      <label style={{ display: 'block', fontSize: '.62rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--adm-muted)', marginBottom: '.45rem' }}>
        {label}
      </label>
    )}
    <input
      {...props}
      style={{
        width: '100%', padding: '10px 13px',
        background: 'var(--adm-surf2)', border: '1.5px solid var(--adm-border)',
        borderRadius: 7, color: 'var(--adm-text)', fontSize: '.88rem', outline: 'none',
        transition: 'border-color .2s',
        ...props.style,
      }}
      onFocus={e => { e.target.style.borderColor = 'var(--adm-amber)'; props.onFocus?.(e); }}
      onBlur={e => { e.target.style.borderColor = 'var(--adm-border)'; props.onBlur?.(e); }}
    />
  </div>
);

// ─── ADMIN SELECT ────────────────────────────────────────────────────────────
interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}
export const AdminSelect: React.FC<AdminSelectProps> = ({ label, children, ...props }) => (
  <div style={{ marginBottom: '1.1rem' }}>
    {label && (
      <label style={{ display: 'block', fontSize: '.62rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--adm-muted)', marginBottom: '.45rem' }}>
        {label}
      </label>
    )}
    <select
      {...props}
      style={{
        width: '100%', padding: '10px 13px',
        background: 'var(--adm-surf2)', border: '1.5px solid var(--adm-border)',
        borderRadius: 7, color: 'var(--adm-text)', fontSize: '.88rem',
        outline: 'none', appearance: 'none',
      }}
      onFocus={e => { e.target.style.borderColor = 'var(--adm-amber)'; }}
      onBlur={e => { e.target.style.borderColor = 'var(--adm-border)'; }}
    >
      {children}
    </select>
  </div>
);
