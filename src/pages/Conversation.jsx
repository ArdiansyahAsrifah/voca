import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateSmartReplies } from '../services/gemma'
import { createSpeechRecognition } from '../services/speechToText'

export default function Conversation() {
  const navigate = useNavigate()
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [smartReplies, setSmartReplies] = useState([])
  const [sentMessage, setSentMessage] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isLoadingReplies, setIsLoadingReplies] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)

  const recognitionRef = useRef(null)
  const isListeningRef = useRef(false)
  const shouldListenRef = useRef(true)
  const isSpeakingRef = useRef(false)

  const userProfile = JSON.parse(
    localStorage.getItem('vocaProfile') || '{"tone":"casual","language":"English"}'
  )

  useEffect(() => {
    shouldListenRef.current = true
    startListening()
    return () => {
      shouldListenRef.current = false
      if (recognitionRef.current) recognitionRef.current.stop()
      window.speechSynthesis.cancel()
    }
  }, [])

  // ─── Speech ───────────────────────────────────────────────────────────
  const startListening = () => {
    if (!shouldListenRef.current) return
    if (isListeningRef.current) return
    if (isSpeakingRef.current) return

    const recognition = createSpeechRecognition(
      ({ interim, final }) => {
        setInterimTranscript(interim)
        if (final) {
          setTranscript(final)
          setInterimTranscript('')
          fetchSmartReplies(final)
        }
      },
      () => {
        isListeningRef.current = false
        setIsListening(false)
        if (shouldListenRef.current && !isSpeakingRef.current) {
          setTimeout(() => startListening(), 800)
        }
      }
    )

    if (recognition) {
      try {
        recognitionRef.current = recognition
        recognition.start()
        isListeningRef.current = true
        setIsListening(true)
      } catch (e) {
        isListeningRef.current = false
        setTimeout(() => startListening(), 1000)
      }
    }
  }

  const fetchSmartReplies = async (text) => {
    setIsLoadingReplies(true)
    setSmartReplies([])
    try {
      const replies = await generateSmartReplies(text, userProfile)
      setSmartReplies(replies)
    } catch (e) {
      console.error(e)
      setSmartReplies(['Yes!', 'No thanks', 'Tell me more', 'Interesting!'])
    } finally {
      setIsLoadingReplies(false)
    }
  }

  const speak = (text) => {
    window.speechSynthesis.cancel()
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      isListeningRef.current = false
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.onstart = () => { setIsSpeaking(true); isSpeakingRef.current = true }
    utterance.onend = () => { setIsSpeaking(false); isSpeakingRef.current = false; setTimeout(() => startListening(), 500) }
    utterance.onerror = () => { setIsSpeaking(false); isSpeakingRef.current = false; setTimeout(() => startListening(), 500) }
    window.speechSynthesis.speak(utterance)
  }

  const sendReply = (text) => {
    setSentMessage(text)
    speak(text)
    setTimeout(() => setSentMessage(''), 6000)
  }

  const sendCustom = () => {
    if (!customInput.trim()) return
    sendReply(customInput)
    setCustomInput('')
  }

  // ─── Main Conversation UI ─────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">

      <div className="bg-blob-1" />
      <div className="bg-blob-2" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 glass border-b border-white/60 sticky top-0 z-10">
        <button
          onClick={() => navigate('/profile')}
          className="glass-btn text-stone-500 text-sm px-3 py-1.5 rounded-xl"
        >
          👤 Profile
        </button>
        <span className="font-bold text-teal-600 text-lg tracking-wide">VOCA</span>
        <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full transition-all glass ${
          isSpeaking ? 'text-teal-600' : isListening ? 'text-red-500' : 'text-stone-400'
        }`}>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
            isSpeaking ? 'bg-teal-400 animate-pulse'
            : isListening ? 'bg-red-400 animate-pulse'
            : 'bg-stone-300'
          }`} />
          {isSpeaking ? '🔊 Speaking...' : isListening ? '🎤 Listening...' : 'Standby'}
        </div>
      </div>

      {/* Emergency Button */}
      <div className="px-4 pt-4 relative z-10">
        <button
          onClick={() => navigate('/emergency')}
          className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
          style={{
            background: 'rgba(220,38,38,0.82)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '0.5px solid rgba(255,255,255,0.3)',
            boxShadow: '0 4px 24px rgba(220,38,38,0.18)',
          }}
        >
          <span style={{ fontSize: '20px' }}>🚨</span>
          <span>Emergency</span>
          <span style={{ fontSize: '12px', opacity: 0.7, fontWeight: 400 }}>Medical · Safety</span>
        </button>
      </div>

      {/* Sent Message */}
      <div className={`mx-4 mt-3 p-5 rounded-2xl text-center transition-all duration-300 ${
        sentMessage ? 'glass-sent' : 'glass opacity-50'
      }`}>
        <p className={`text-3xl font-bold leading-snug ${sentMessage ? 'text-white' : 'text-teal-300'}`}>
          {sentMessage || '—'}
        </p>
        {sentMessage && (
          <p className="text-white/60 text-xs mt-2">🔊 Speaking out loud for your conversation partner</p>
        )}
      </div>

      {/* Transcription */}
      <div className="mx-4 mt-3 p-4 glass rounded-2xl min-h-[90px]">
        <p className="text-xs text-teal-600/70 font-semibold uppercase tracking-widest mb-2">
          Conversation partner
        </p>
        <p className="text-xl font-medium text-stone-800 leading-snug">
          {transcript
            ? transcript
            : <span className="text-stone-300">Waiting for your conversation partner to speak...</span>
          }
        </p>
        {interimTranscript && (
          <p className="text-lg text-stone-400 mt-1 italic">{interimTranscript}</p>
        )}
      </div>

      {/* Smart Replies */}
      <div className="px-4 mt-3 flex-1 relative z-10">
        <p className="text-xs text-stone-400 mb-2 flex items-center gap-1">
          {isLoadingReplies
            ? <><span className="inline-block w-3 h-3 border border-teal-400 border-t-transparent rounded-full animate-spin" /> ✨ Gemma 4 is analyzing...</>
            : smartReplies.length > 0
              ? <>Choose a reply:</>
              : 'Smart replies will appear automatically...'
          }
        </p>
        <div className="grid grid-cols-2 gap-2">
          {isLoadingReplies
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-14 glass rounded-xl animate-pulse" />
              ))
            : smartReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => sendReply(reply)}
                  className="glass-btn text-stone-700 px-3 py-4 rounded-xl text-sm font-medium text-left active:scale-[0.97] transition-all"
                >
                  {reply}
                </button>
              ))
          }
        </div>
      </div>

      {/* Custom Input */}
      <div className="px-4 pb-8 pt-3 flex gap-2 relative z-10">
        <input
          type="text"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendCustom()}
          placeholder="Type your own reply..."
          className="flex-1 glass-input rounded-xl px-4 py-3 text-sm text-stone-700 outline-none placeholder-stone-300"
          style={{ border: '0.5px solid rgba(255,255,255,0.72)' }}
        />
        <button
          onClick={sendCustom}
          className="glass-sent text-white px-4 py-3 rounded-xl text-sm font-medium active:opacity-80"
        >
          🔊 Send
        </button>
      </div>

    </div>
  )
}