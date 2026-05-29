import { useVoiceInput } from '../useVoiceInput'

export default function VoiceMic({ onNumbers, hint }) {
  const { listening, transcript, error, start, stop, supported } = useVoiceInput(onNumbers)

  if (!supported) return null

  return (
    <div className="voice-wrap">
      <button
        type="button"
        className={`voice-btn ${listening ? 'voice-listening' : ''}`}
        onClick={listening ? stop : start}
        aria-label={listening ? 'Stop listening' : 'Start voice input'}
      >
        <span className="voice-icon">{listening ? '⏹' : '🎤'}</span>
        <span className="voice-label">{listening ? 'Listening…' : 'Voice'}</span>
      </button>
      {hint && !listening && !transcript && (
        <span className="voice-hint">{hint}</span>
      )}
      {listening && (
        <span className="voice-status voice-active">Names are ignored — only numbers count</span>
      )}
      {transcript && !listening && (
        <span className="voice-status">Heard: "{transcript}"</span>
      )}
      {error && !listening && (
        <span className="voice-status voice-error">{error}</span>
      )}
    </div>
  )
}
