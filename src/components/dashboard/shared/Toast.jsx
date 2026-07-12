import { useEffect, useState } from 'react'
import Icon from '../../landing/Icons.jsx'

// Lightweight global toast: call toast('Saved') from anywhere; <ToastHost/>
// (mounted once in DashboardShell) renders them.
let listeners = []
let idc = 0
export function toast(message, opts = {}) {
  const t = { id: ++idc, message, icon: opts.icon || 'check', accent: opts.accent || 'var(--c-green)' }
  listeners.forEach(l => l(t))
}

export function ToastHost() {
  const [items, setItems] = useState([])
  useEffect(() => {
    const l = (t) => {
      setItems(prev => [...prev, t])
      setTimeout(() => setItems(prev => prev.filter(x => x.id !== t.id)), 2800)
    }
    listeners.push(l)
    return () => { listeners = listeners.filter(x => x !== l) }
  }, [])
  return (
    <div className="ff-toast-wrap">
      {items.map(t => (
        <div key={t.id} className="ff-toast">
          <span style={{ color: t.accent, display: 'inline-flex' }}><Icon name={t.icon} size={18} /></span>
          {t.message}
        </div>
      ))}
    </div>
  )
}
