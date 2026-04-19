import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const EMERGENCY_CATEGORIES = [
  {
    id: 'medical',
    label: 'Medical',
    emoji: '🏥',
    color: 'red',
    description: 'Health & medical assistance',
    presets: [
      { id: 'm1', text: 'I need medical help. Please call an ambulance now.', short: 'Call ambulance' },
      { id: 'm2', text: 'I am having chest pain. Please help me immediately.', short: 'Chest pain' },
      { id: 'm3', text: 'I am having difficulty breathing. I need help.', short: 'Breathing difficulty' },
      { id: 'm4', text: 'I am allergic to this. Please remove it immediately.', short: 'Allergy alert' },
      { id: 'm5', text: 'I feel dizzy and may faint. Please sit me down and call for help.', short: 'Feeling faint' },
      { id: 'm6', text: 'I have a medical condition. My emergency contact is in my phone.', short: 'Medical condition' },
      { id: 'm7', text: 'I need my medication urgently. Please help me find it.', short: 'Need medication' },
      { id: 'm8', text: 'Please do not move me. I may have a spinal injury.', short: 'Spinal injury' },
    ]
  },
  {
    id: 'safety',
    label: 'Safety',
    emoji: '🚨',
    color: 'orange',
    description: 'Danger & safety alerts',
    presets: [
      { id: 's1', text: 'I am in danger. Please call the police immediately.', short: 'Call police' },
      { id: 's2', text: 'Help! I need assistance right now.', short: 'Need help now' },
      { id: 's3', text: 'Please stay with me. I do not feel safe.', short: 'Stay with me' },
      { id: 's4', text: 'I am lost. Can you help me find my way?', short: 'I am lost' },
      { id: 's5', text: 'Someone is following me. Please help.', short: 'Being followed' },
      { id: 's6', text: 'I need to leave this situation immediately. Please help me.', short: 'Need to leave' },
      { id: 's7', text: 'Please call my emergency contact. Their number is saved as ICE.', short: 'Call my contact' },
      { id: 's8', text: 'I need police, fire, or ambulance. This is an emergency.', short: 'Emergency services' },
    ]
  }
]

export default function Emergency() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('medical')
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [mode, setMode] = useState(null) // 'speak' | 'show'
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef(null)

  const category = EMERGENCY_CATEGORIES.find(c => c.id === activeCategory)

  const handlePresetTap = (preset) => {
    setSelectedPreset(preset)
    setMode(null)
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const handleSpeak = () => {
    if (!selectedPreset) return
    window.speechSynthesis.cancel()
    setMode('speak')

    const utterance = new SpeechSynthesisUtterance(selectedPreset.text)
    utterance.lang = 'en-US'
    utterance.rate = 0.85
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const handleShow = () => {
    if (!selectedPreset) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setMode('show')
  }

  const handleDismiss = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setSelectedPreset(null)
    setMode(null)
  }

  const repeatSpeak = () => {
    if (!selectedPreset) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(selectedPreset.text)
    utterance.lang = 'en-US'
    utterance.rate = 0.85
    utterance.pitch = 1
    utterance.volume = 1
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  // SHOW MODE — fullscreen display for bystanders to read
  if (mode === 'show' && selectedPreset) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center z-50 cursor-pointer"
        style={{
          background: activeCategory === 'medical'
            ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
            : 'linear-gradient(135deg, #ea580c, #c2410c)',
        }}
        onClick={handleDismiss}
      >
        <div className="px-8 text-center">
          <div className="text-8xl mb-8" style={{ fontSize: '80px' }}>
            {category.emoji}
          </div>
          <p className="text-white font-bold leading-tight mb-10"
            style={{ fontSize: '32px', lineHeight: '1.3', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            {selectedPreset.text}
          </p>
          <div
            className="mx-auto px-6 py-3 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1.5px solid rgba(255,255,255,0.4)',
              display: 'inline-block',
            }}
          >
            <p className="text-white/80 text-sm font-medium">Tap anywhere to dismiss</p>
          </div>
        </div>
      </div>
    )
  }

  // SPEAK MODE — confirmation + repeat
  if (mode === 'speak' && selectedPreset) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <div className="bg-blob-1" />
        <div className="bg-blob-2" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 glass border-b border-white/60 sticky top-0 z-10">
          <button onClick={handleDismiss} className="text-stone-500 text-sm px-3 py-1.5 rounded-xl glass-btn">
            ← Back
          </button>
          <span className="font-bold text-teal-600 text-lg tracking-wide">VOCA</span>
          <div className="w-16" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 relative z-10">
          {/* Speaking indicator */}
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center"
            style={{
              background: activeCategory === 'medical'
                ? 'rgba(220,38,38,0.12)'
                : 'rgba(234,88,12,0.12)',
              border: `2px solid ${activeCategory === 'medical' ? 'rgba(220,38,38,0.3)' : 'rgba(234,88,12,0.3)'}`,
            }}
          >
            <span style={{ fontSize: '48px' }}>
              {isSpeaking ? '🔊' : '✅'}
            </span>
          </div>

          {/* Message */}
          <div className="glass rounded-2xl p-5 w-full text-center">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: activeCategory === 'medical' ? '#dc2626' : '#ea580c' }}>
              Speaking aloud
            </p>
            <p className="text-xl font-bold text-stone-800 leading-snug">
              {selectedPreset.text}
            </p>
          </div>

          {/* Actions */}
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={repeatSpeak}
              className="w-full py-4 rounded-2xl font-semibold text-white text-base active:opacity-80"
              style={{
                background: activeCategory === 'medical'
                  ? 'rgba(220,38,38,0.85)'
                  : 'rgba(234,88,12,0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '0.5px solid rgba(255,255,255,0.3)',
              }}
            >
              🔊 Repeat aloud
            </button>
            <button
              onClick={() => setMode('show')}
              className="w-full py-4 rounded-2xl font-semibold text-stone-700 text-base glass-btn"
            >
              📱 Switch to Show mode
            </button>
            <button
              onClick={handleDismiss}
              className="w-full py-3 text-stone-400 text-sm"
            >
              ← Choose different message
            </button>
          </div>
        </div>
      </div>
    )
  }

  // MAIN EMERGENCY PAGE
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="bg-blob-1" />
      <div className="bg-blob-2" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 glass border-b border-white/60 sticky top-0 z-10">
        <button
          onClick={() => navigate('/conversation')}
          className="text-stone-500 text-sm px-3 py-1.5 rounded-xl glass-btn"
        >
          ← Back
        </button>
        <span className="font-bold text-teal-600 text-lg tracking-wide">VOCA</span>
        <div
          className="text-xs px-3 py-1.5 rounded-full font-semibold"
          style={{
            background: 'rgba(220,38,38,0.1)',
            color: '#dc2626',
            border: '0.5px solid rgba(220,38,38,0.25)',
          }}
        >
          🚨 Emergency
        </div>
      </div>

      {/* Category tabs */}
      <div className="px-4 pt-4 flex gap-2 relative z-10">
        {EMERGENCY_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setSelectedPreset(null); setMode(null) }}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all"
            style={activeCategory === cat.id ? {
              background: cat.id === 'medical' ? 'rgba(220,38,38,0.12)' : 'rgba(234,88,12,0.12)',
              border: `1.5px solid ${cat.id === 'medical' ? 'rgba(220,38,38,0.35)' : 'rgba(234,88,12,0.35)'}`,
              color: cat.id === 'medical' ? '#dc2626' : '#ea580c',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            } : {
              background: 'rgba(255,255,255,0.45)',
              border: '0.5px solid rgba(255,255,255,0.75)',
              color: '#78716c',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Preset grid */}
      <div className="px-4 mt-4 flex-1 relative z-10">
        <p className="text-xs text-stone-400 mb-3 font-medium">
          {selectedPreset ? 'Tap again to deselect · Choose action below' : 'Tap a message to send'}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {category.presets.map(preset => (
            <button
              key={preset.id}
              onClick={() => handlePresetTap(preset)}
              className="p-4 rounded-2xl text-left transition-all"
              style={selectedPreset?.id === preset.id ? {
                background: activeCategory === 'medical' ? 'rgba(220,38,38,0.1)' : 'rgba(234,88,12,0.1)',
                border: `1.5px solid ${activeCategory === 'medical' ? 'rgba(220,38,38,0.4)' : 'rgba(234,88,12,0.4)'}`,
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              } : {
                background: 'rgba(255,255,255,0.5)',
                border: '0.5px solid rgba(255,255,255,0.75)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <p className="text-sm font-semibold text-stone-800 leading-snug">{preset.short}</p>
              <p className="text-xs text-stone-400 mt-1 leading-snug line-clamp-2">{preset.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons — sticky bottom, appears when preset selected */}
      <div className="px-4 pb-8 pt-4 relative z-10">
        {selectedPreset ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-stone-500 text-center mb-1 font-medium">
              "{selectedPreset.short}" — how do you want to send it?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleSpeak}
                className="flex-1 py-4 rounded-2xl font-bold text-white text-base active:opacity-80"
                style={{
                  background: activeCategory === 'medical'
                    ? 'rgba(220,38,38,0.85)'
                    : 'rgba(234,88,12,0.85)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '0.5px solid rgba(255,255,255,0.3)',
                }}
              >
                🔊 Speak
              </button>
              <button
                onClick={handleShow}
                className="flex-1 py-4 rounded-2xl font-bold text-stone-700 text-base glass-btn"
              >
                📱 Show
              </button>
            </div>
            <button
              onClick={handleDismiss}
              className="w-full py-2 text-stone-400 text-xs"
            >
              Deselect
            </button>
          </div>
        ) : (
          <div
            className="w-full py-4 rounded-2xl text-center"
            style={{
              background: 'rgba(255,255,255,0.35)',
              border: '0.5px solid rgba(255,255,255,0.6)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            <p className="text-stone-400 text-sm">Select a message above to continue</p>
          </div>
        )}
      </div>
    </div>
  )
}