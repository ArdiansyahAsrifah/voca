import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TONES = [
  { id: 'casual', label: '😄 Casual' },
  { id: 'warm', label: '🤗 Warm' },
  { id: 'witty', label: '😏 Witty' },
  { id: 'formal', label: '👔 Formal' },
]

const STYLES = [
  { id: 'short', label: '⚡ Short & Punchy' },
  { id: 'detailed', label: '📝 Detailed' },
  { id: 'humorous', label: '😂 Humorous' },
  { id: 'empathetic', label: '💙 Empathetic' },
]

const TOPICS = [
  { id: 'family', label: '👨‍👩‍👧 Family' },
  { id: 'work', label: '💼 Work' },
  { id: 'health', label: '🏥 Health' },
  { id: 'hobbies', label: '🎨 Hobbies' },
  { id: 'food', label: '🍜 Food' },
  { id: 'sports', label: '⚽ Sports' },
  { id: 'travel', label: '✈️ Travel' },
  { id: 'tech', label: '💻 Tech' },
  { id: 'music', label: '🎵 Music' },
  { id: 'movies', label: '🎬 Movies' },
]

export default function Profile() {
  const navigate = useNavigate()
  const saved = JSON.parse(localStorage.getItem('vocaProfile') || '{}')

  const [tone, setTone] = useState(saved.tone || 'casual')
  const [style, setStyle] = useState(saved.style || 'short')
  const [topics, setTopics] = useState(saved.topics || [])
  const [isSaved, setIsSaved] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const toggleTopic = (id) => {
    setTopics(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const saveProfile = () => {
    const profile = { tone, style, topics, phrases: [], language: 'English' }
    localStorage.setItem('vocaProfile', JSON.stringify(profile))
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const confirmReset = () => {
    localStorage.removeItem('vocaProfile')
    navigate('/onboarding')
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">

      <div className="bg-blob-1" />
      <div className="bg-blob-2" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 glass border-b border-white/60 sticky top-0 z-10">
        <button
          onClick={() => navigate('/conversation')}
          className="text-teal-600 text-sm font-medium px-2 py-1"
        >
          ← Back
        </button>
        <span className="font-bold text-stone-700">My Profile</span>
        <button
          onClick={saveProfile}
          className={`text-xs px-3 py-1.5 rounded-full transition-all font-medium ${
            isSaved
              ? 'bg-green-500/80 text-white'
              : 'glass-sent text-white'
          }`}
        >
          {isSaved ? '✓ Saved!' : 'Save'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-6 relative z-10">

        {/* Profile summary card */}
        <div className="glass-teal rounded-2xl p-4">
          <p className="text-xs font-semibold text-teal-700 mb-2">Your Communication Profile</p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs glass text-teal-700 px-3 py-1 rounded-full"
              style={{ border: '0.5px solid rgba(13,148,136,0.25)' }}>
              {TONES.find(t => t.id === tone)?.label}
            </span>
            <span className="text-xs glass text-teal-700 px-3 py-1 rounded-full"
              style={{ border: '0.5px solid rgba(13,148,136,0.25)' }}>
              {STYLES.find(s => s.id === style)?.label}
            </span>
            {topics.slice(0, 3).map(id => (
              <span key={id} className="text-xs glass text-teal-700 px-3 py-1 rounded-full"
                style={{ border: '0.5px solid rgba(13,148,136,0.25)' }}>
                {TOPICS.find(t => t.id === id)?.label}
              </span>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Your Tone</p>
          <div className="grid grid-cols-2 gap-2">
            {TONES.map(t => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={`p-3 rounded-2xl text-sm font-medium transition-all ${
                  tone === t.id ? 'glass-btn-active text-teal-700' : 'glass-btn text-stone-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Style */}
        <div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Reply Style</p>
          <div className="grid grid-cols-2 gap-2">
            {STYLES.map(s => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`p-3 rounded-2xl text-sm font-medium transition-all ${
                  style === s.id ? 'glass-btn-active text-teal-700' : 'glass-btn text-stone-600'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topics */}
        <div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Favorite Topics</p>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map(t => (
              <button
                key={t.id}
                onClick={() => toggleTopic(t.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  topics.includes(t.id)
                    ? 'glass-btn-active text-teal-700'
                    : 'glass-btn text-stone-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reset — with confirmation */}
        <div className="pt-2 border-t border-white/40">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-3 rounded-2xl text-red-400 text-sm font-medium transition-all"
              style={{
                background: 'rgba(255,255,255,0.35)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '0.5px solid rgba(252,165,165,0.35)',
              }}
            >
              🔄 Reset Profile & Redo Onboarding
            </button>
          ) : (
            <div className="glass rounded-2xl p-4 flex flex-col gap-3"
              style={{ border: '0.5px solid rgba(252,165,165,0.4)' }}>
              <p className="text-sm text-stone-600 text-center font-medium">
                Reset your profile? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium glass-btn text-stone-600"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReset}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{
                    background: 'rgba(220,38,38,0.8)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '0.5px solid rgba(255,255,255,0.2)',
                  }}
                >
                  Yes, reset
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}