import { useState } from 'react'
import { BRICOLAGE, HANKEN } from '../../ui.js'
import { C } from '../../../data.js'

// Incident Reporting — voice-to-report with mic button, editable text, submit
export default function StaffIncident({ nav, zones, onFileIncident }) {
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [category, setCategory] = useState('')
  const [severity, setSeverity] = useState('')
  const [zone, setZone] = useState('C')
  const [submitted, setSubmitted] = useState(false)

  const categories = ['medical', 'crowd', 'facilities', 'accessibility', 'security', 'other']
  const severities = ['low', 'medium', 'high']

  const handleRecord = () => {
    if (recording) {
      setRecording(false)
      // Simulate transcription
      if (!transcript) {
        setTranscript('There is a situation near the south concourse that needs attention. A vendor cart is blocking the wheelchair access ramp near Gate E.')
        setCategory('accessibility')
        setSeverity('medium')
        setZone('A')
      }
    } else {
      setRecording(true)
    }
  }

  const handleSubmit = () => {
    if (!transcript || !category || !severity) return
    const newIncident = {
      id: `INC-${String(Date.now()).slice(-3)}`,
      severity,
      category,
      title: transcript.slice(0, 60) + (transcript.length > 60 ? '...' : ''),
      description: transcript,
      location: `Zone ${zone}`,
      zone,
      status: 'new',
      assignedTo: null,
      reportedBy: 'Aiden Park',
      reportedAt: new Date().toISOString(),
    }
    onFileIncident(newIncident)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <button className="ff-breadcrumb" onClick={() => nav('staff-dashboard')}>
          ← Dashboard
        </button>
        <div className="ff-dash-card" style={{ padding: 40, textAlign: 'center' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>✅</span>
          <h2 style={{ fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 24, color: '#f4f4f4', marginBottom: 8 }}>
            Incident reported
          </h2>
          <p style={{ fontSize: 15, color: '#9a9a9a', marginBottom: 24 }}>
            Your report has been filed and routed to the organizer's incident queue for triage.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={() => { setSubmitted(false); setTranscript(''); setCategory(''); setSeverity('') }}
              style={{
                padding: '12px 24px', borderRadius: 32, border: `1px solid ${C.green}`,
                background: 'transparent', color: C.green, fontWeight: 600, fontSize: 13,
                cursor: 'pointer', fontFamily: HANKEN, textTransform: 'uppercase',
              }}
            >
              File another
            </button>
            <button
              onClick={() => nav('staff-dashboard')}
              style={{
                padding: '12px 24px', borderRadius: 32, border: 'none',
                background: C.green, color: '#fff', fontWeight: 600, fontSize: 13,
                cursor: 'pointer', fontFamily: HANKEN, textTransform: 'uppercase',
              }}
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <button className="ff-breadcrumb" onClick={() => nav('staff-dashboard')}>
        ← Dashboard
      </button>

      <h2 style={{
        fontFamily: BRICOLAGE, fontWeight: 700, fontSize: 28,
        color: '#f4f4f4', textTransform: 'uppercase', marginBottom: 8,
      }}>
        Report Incident
      </h2>
      <p style={{ fontSize: 14, color: '#9a9a9a', marginBottom: 24 }}>
        Speak or type your report. It'll be routed to the organizer's incident queue.
      </p>

      {/* Mic button */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <button
          className={`ff-mic-btn${recording ? ' recording' : ''}`}
          onClick={handleRecord}
          aria-label={recording ? 'Stop recording' : 'Start voice recording'}
        >
          {recording ? '⏹' : '🎤'}
        </button>
        <div style={{ fontSize: 12, color: recording ? '#e23a45' : '#6c6c6c', marginTop: 8, fontWeight: 500 }}>
          {recording ? 'Recording... tap to stop' : 'Tap to start voice report'}
        </div>
      </div>

      {/* Transcript */}
      <div className="ff-dash-card" style={{ padding: 20, marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: '#6c6c6c', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Report details
        </label>
        <textarea
          value={transcript}
          onChange={e => setTranscript(e.target.value)}
          placeholder="Describe the incident..."
          rows={4}
          style={{
            width: '100%', background: '#0e0e0e', border: '1px solid #333',
            color: '#f4f4f4', padding: '14px 18px', borderRadius: 12,
            fontSize: 14, fontFamily: HANKEN, resize: 'vertical',
            outline: 'none',
          }}
        />
      </div>

      {/* Category + Severity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="ff-dash-card" style={{ padding: 16 }}>
          <label style={{ fontSize: 12, color: '#6c6c6c', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Category
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {categories.map(c => (
              <button
                key={c}
                className={`ff-filter-chip${category === c ? ' active' : ''}`}
                onClick={() => setCategory(c)}
                style={{ fontSize: 12, textTransform: 'capitalize' }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="ff-dash-card" style={{ padding: 16 }}>
          <label style={{ fontSize: 12, color: '#6c6c6c', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Severity
          </label>
          <div style={{ display: 'flex', gap: 6 }}>
            {severities.map(s => (
              <button
                key={s}
                className={`ff-filter-chip${severity === s ? ' active' : ''}`}
                onClick={() => setSeverity(s)}
                style={{ fontSize: 12, textTransform: 'capitalize' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="ff-dash-card" style={{ padding: 16, marginBottom: 24 }}>
        <label style={{ fontSize: 12, color: '#6c6c6c', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Location (zone)
        </label>
        <div style={{ display: 'flex', gap: 6 }}>
          {zones.map(z => (
            <button
              key={z.id}
              className={`ff-filter-chip${zone === z.id ? ' active' : ''}`}
              onClick={() => setZone(z.id)}
              style={{ fontSize: 12 }}
            >
              {z.id}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!transcript || !category || !severity}
        className="ff-cta"
        style={{
          width: '100%', padding: '15px', borderRadius: 32, border: 'none',
          background: transcript && category && severity ? C.green : '#333',
          color: '#fff', fontFamily: HANKEN, fontWeight: 600, fontSize: 14,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          cursor: transcript && category && severity ? 'pointer' : 'default',
        }}
      >
        Submit incident report
      </button>
    </div>
  )
}
