// ─────────────────────────────────────────────────────────────────────────────
// Admin UI primitives — small, dependency-free components styled with the
// portfolio's existing Tailwind tokens (bg-card / border-subtle / accent-indigo).
// Components only (Fast Refresh safe).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";

export function Panel({ title, desc, actions, children, className = "" }) {
  return (
    <section className={`rounded-2xl bg-bg-card border border-border-subtle p-5 md:p-6 ${className}`}>
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
          <div>
            {title && <h3 className="font-display font-semibold text-text-primary">{title}</h3>}
            {desc && <p className="font-mono text-[10px] text-text-muted mt-1 leading-relaxed">{desc}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">
        {label}
      </label>
      {children}
      {hint && <p className="font-mono text-[10px] text-text-muted mt-1.5">{hint}</p>}
    </div>
  );
}

export const inputCls =
  "w-full bg-bg-primary border border-border-mid rounded-xl px-4 py-2.5 font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-indigo/60 transition-colors";

export function TextInput({ label, hint, ...props }) {
  return (
    <Field label={label} hint={hint}>
      <input {...props} className={inputCls} />
    </Field>
  );
}

export function TextArea({ label, hint, rows = 3, ...props }) {
  return (
    <Field label={label} hint={hint}>
      <textarea {...props} rows={rows} className={`${inputCls} resize-y leading-relaxed`} />
    </Field>
  );
}

export function Btn({ variant = "primary", className = "", children, ...props }) {
  const base = "px-4 py-2.5 rounded-xl font-mono text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed";
  const styles = {
    primary: "btn-primary",
    ghost: "btn-ghost",
    danger: "font-mono text-xs px-4 py-2.5 rounded-xl border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-all",
  };
  return (
    <button type="button" {...props} className={`${base} ${styles[variant] || styles.primary} ${className}`}>
      {children}
    </button>
  );
}

export function Toggle({ checked, onChange, label, disabled }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${checked ? "bg-emerald-500" : "bg-border-mid"} ${disabled ? "opacity-50" : ""}`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${checked ? "left-5" : "left-0.5"}`}
        />
      </button>
      {label && <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">{label}</span>}
    </div>
  );
}

// Edits a string array as editable rows (roles, stack, screenshots, points…).
export function ListEditor({ value, onChange, placeholder, addLabel = "+ Add item", max = 40 }) {
  const items = Array.isArray(value) ? value : [];
  const update = (i, v) => onChange(items.map((x, j) => (j === i ? v : x)));
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={item}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholder}
            className={`${inputCls} flex-1 !py-2`}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            aria-label={`Remove item ${i + 1}`}
            className="px-2.5 rounded-lg border border-border-mid text-text-muted hover:text-red-400 hover:border-red-400/40 transition-colors font-mono text-xs"
          >
            ✕
          </button>
        </div>
      ))}
      {items.length < max && (
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="font-mono text-[10px] px-3 py-1.5 rounded-lg border border-border-mid text-text-muted hover:border-accent-indigo/40 hover:text-accent-indigo transition-all"
        >
          {addLabel}
        </button>
      )}
    </div>
  );
}

export function Badge({ children, tone = "indigo", className = "" }) {
  const tones = {
    indigo: "border-accent-indigo/30 bg-accent-indigo/10 text-accent-indigo",
    green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    red: "border-red-500/30 bg-red-500/10 text-red-400",
    muted: "border-border-mid bg-bg-primary text-text-muted",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] px-2.5 py-1 rounded-lg border ${tones[tone] || tones.indigo} ${className}`}>
      {children}
    </span>
  );
}

// Button that asks for confirmation on first click (Yes / No inline).
export function ConfirmBtn({ onConfirm, children, className = "", confirmLabel = "Confirm?" }) {
  return (
    <ConfirmBtnInner onConfirm={onConfirm} className={className} confirmLabel={confirmLabel}>
      {children}
    </ConfirmBtnInner>
  );
}

function ConfirmBtnInner({ onConfirm, className = "", confirmLabel, children }) {
  const [armed, setArmed] = useState(false);
  if (armed) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="font-mono text-[10px] text-red-400">{confirmLabel}</span>
        <button
          type="button"
          onClick={() => { setArmed(false); onConfirm(); }}
          className="font-mono text-[10px] text-red-400 border border-red-400/30 px-2 py-1 rounded-lg hover:bg-red-400/10"
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => setArmed(false)}
          className="font-mono text-[10px] text-text-muted px-2 py-1"
        >
          No
        </button>
      </span>
    );
  }
  return (
    <button type="button" onClick={() => setArmed(true)} className={className}>
      {children}
    </button>
  );
}

export function Spinner({ className = "" }) {
  return (
    <span
      className={`inline-block w-4 h-4 border-2 border-accent-indigo/30 border-t-accent-indigo rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function EmptyState({ icon = "○", title, desc }) {
  return (
    <div className="text-center py-12 border border-dashed border-border-subtle rounded-2xl">
      <div className="text-2xl text-text-muted mb-2" aria-hidden="true">{icon}</div>
      <p className="font-display text-sm text-text-secondary">{title}</p>
      {desc && <p className="font-mono text-[10px] text-text-muted mt-1.5">{desc}</p>}
    </div>
  );
}

export function Stat({ value, label, tone = "indigo", onClick }) {
  const tones = {
    indigo: "text-accent-indigo",
    cyan: "text-accent-cyan",
    green: "text-emerald-400",
    amber: "text-amber-400",
  };
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`text-left rounded-2xl bg-bg-card border border-border-subtle p-5 ${onClick ? "hover:border-accent-indigo/40 transition-colors w-full" : ""}`}
    >
      <div className={`font-display font-bold text-2xl ${tones[tone] || tones.indigo}`}>{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted mt-1">{label}</div>
    </Tag>
  );
}
