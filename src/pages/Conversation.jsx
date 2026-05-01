import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateSmartReplies, generateSmartRepliesWithImage, detectContextLabel } from '../services/ollama'
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

  // --- Camera state ---
  const [cameraMode, setCameraMode] = useState(false)        // show camera UI
  const [cameraStream, setCameraStream] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)   // base64 data URL
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [contextLabel, setContextLabel] = useState('')        // e.g. "Menu 🍜"

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
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
      stopCamera()
    }
  }, [])

  // Attach stream to video element when cameraMode opens
  useEffect(() => {
    if (cameraMode && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream
    }
  }, [cameraMode, cameraStream])

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

  const fetchSmartReplies = async (text, imageBase64 = null) => {
    setIsLoadingReplies(true)
    setSmartReplies([])
    try {
      let replies
      if (imageBase64) {
        replies = await generateSmartRepliesWithImage(text, userProfile, imageBase64)
      } else {
        replies = await generateSmartReplies(text, userProfile)
      }
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

  // ─── Camera ───────────────────────────────────────────────────────────
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      setCameraStream(stream)
      setCapturedImage(null)
      setCameraMode(true)
    } catch (err) {
      console.error('Camera error:', err)
      alert('Camera not available. Please allow camera access.')
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop())
      setCameraStream(null)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)
    const dataURL = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedImage(dataURL)
    stopCamera()
  }

  const retakePhoto = async () => {
    setCapturedImage(null)
    setContextLabel('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      setCameraStream(stream)
    } catch (err) {
      console.error(err)
    }
  }

  const analyzeAndApply = async () => {
    if (!capturedImage) return
    setIsAnalyzing(true)
    setCameraMode(false)

    // Strip base64 header for API
    const base64Data = capturedImage.split(',')[1]

    try {
      const label = await detectContextLabel(base64Data)
      setContextLabel(label)

      // Generate replies using current transcript + image
      await fetchSmartReplies(transcript || 'What do you think about this?', base64Data)
    } catch (e) {
      console.error(e)
      setContextLabel('📷 Context')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearContext = () => {
    setCapturedImage(null)
    setContextLabel('')
    setSmartReplies([])
  }

  const closeCameraMode = () => {
    stopCamera()
    setCameraMode(false)
    setCapturedImage(null)
  }

  // ─── Camera Overlay UI ────────────────────────────────────────────────
  if (cameraMode) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 sticky top-0 z-10"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}>
          <button onClick={closeCameraMode} className="text-white/70 text-sm px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.2)' }}>
            ✕ Cancel
          </button>
          <span className="font-bold text-white text-base">📷 Context Camera</span>
          <div className="w-20" />
        </div>

        {/* Context tip */}
        <div className="px-4 py-2 text-center" style={{ background: 'rgba(13,148,136,0.15)' }}>
          <p className="text-xs text-teal-300 font-medium">
            Point at a menu, whiteboard, sign, or product → Gemma 4 will read it and suggest perfect replies
          </p>
        </div>

        {/* Viewfinder or Preview */}
        <div className="flex-1 relative flex items-center justify-center">
          {!capturedImage ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ maxHeight: 'calc(100vh - 220px)' }}
              />
              {/* Corner guides */}
              <div className="absolute inset-8 pointer-events-none"
                style={{ border: '2px solid rgba(13,148,136,0.6)', borderRadius: '16px',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)' }} />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <p className="text-white/50 text-xs text-center">Frame your context</p>
              </div>
            </>
          ) : (
            <img src={capturedImage} alt="Captured"
              className="w-full object-cover" style={{ maxHeight: 'calc(100vh - 220px)' }} />
          )}
        </div>

        {/* Controls */}
        <div className="px-6 pb-10 pt-4 flex flex-col gap-3"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}>
          {!capturedImage ? (
            <button
              onClick={capturePhoto}
              className="mx-auto w-20 h-20 rounded-full flex items-center justify-center active:scale-95 transition-all"
              style={{
                background: 'rgba(13,148,136,0.9)',
                border: '4px solid rgba(255,255,255,0.3)',
                boxShadow: '0 0 32px rgba(13,148,136,0.5)',
              }}
            >
              <span style={{ fontSize: '32px' }}>📷</span>
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                onClick={analyzeAndApply}
                className="w-full py-4 rounded-2xl font-bold text-white text-base active:opacity-80 transition-all"
                style={{
                  background: 'rgba(13,148,136,0.9)',
                  border: '0.5px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 4px 20px rgba(13,148,136,0.4)',
                }}
              >
                ✨ Analyze with Gemma 4
              </button>
              <button
                onClick={retakePhoto}
                className="w-full py-3 rounded-2xl text-white/70 text-sm font-medium"
                style={{ background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.2)' }}
              >
                🔄 Retake
              </button>
            </div>
          )}
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    )
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

      {/* ─── Context Camera Bar ─── */}
      <div className="px-4 mt-3 relative z-10">
        {/* Active context indicator */}
        {capturedImage && contextLabel && (
          <div className="flex items-center gap-3 mb-2 p-3 rounded-2xl"
            style={{
              background: 'rgba(13,148,136,0.08)',
              border: '1px solid rgba(13,148,136,0.25)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}>
            {/* Thumbnail */}
            <img src={capturedImage} alt="context"
              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
              style={{ border: '1.5px solid rgba(13,148,136,0.3)' }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-teal-700">Context active</p>
              <p className="text-sm text-stone-700 font-medium truncate">{contextLabel}</p>
            </div>
            <button onClick={clearContext}
              className="text-stone-400 text-xs px-2 py-1 rounded-lg glass-btn flex-shrink-0">
              ✕ Clear
            </button>
          </div>
        )}

        {/* Analyzing spinner */}
        {isAnalyzing && (
          <div className="flex items-center gap-3 mb-2 p-3 rounded-2xl glass-teal">
            <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <p className="text-sm text-teal-700 font-medium">Gemma 4 is analyzing your image...</p>
          </div>
        )}

        {/* Camera button */}
        {!capturedImage && !isAnalyzing && (
          <button
            onClick={openCamera}
            className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm transition-all active:scale-[0.98]"
            style={{
              background: 'rgba(255,255,255,0.5)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px dashed rgba(13,148,136,0.4)',
              color: '#0d9488',
            }}
          >
            <span style={{ fontSize: '18px' }}>📷</span>
            <span>Context Camera</span>
            <span className="text-xs font-normal opacity-60">Point at menu, sign, or whiteboard</span>
          </button>
        )}
      </div>

      {/* Smart Replies */}
      <div className="px-4 mt-3 flex-1 relative z-10">
        <p className="text-xs text-stone-400 mb-2 flex items-center gap-1">
          {isLoadingReplies
            ? <><span className="inline-block w-3 h-3 border border-teal-400 border-t-transparent rounded-full animate-spin" /> {capturedImage ? '✨ Gemma 4 reading your image...' : '✨ Gemma 4 is analyzing...'}</>
            : smartReplies.length > 0
              ? <>{capturedImage ? `📷 Replies based on ${contextLabel || 'context'}:` : 'Choose a reply:'}</>
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