export function createSpeechRecognition(onTranscript, onEnd) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

  if (!SpeechRecognition) {
    console.warn('Speech recognition not supported')
    return null
  }

  const recognition = new SpeechRecognition()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = 'en-US'
  recognition.maxAlternatives = 1

  recognition.onresult = (event) => {
    let interim = ''
    let final = ''

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        final += transcript
      } else {
        interim += transcript
      }
    }

    onTranscript({ interim, final })
  }

  recognition.onerror = (event) => {
    if (event.error === 'no-speech' || event.error === 'network') {
      if (onEnd) onEnd()
    }
  }

  recognition.onend = () => {
    if (onEnd) onEnd()
  }

  return recognition
}