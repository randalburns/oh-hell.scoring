import { useState, useRef, useCallback } from 'react'

const WORD_NUM = {
  zero: 0, oh: 0, jit: 0, jeet: 0, gyro: 0, go: 0,
  one: 1, won: 1, two: 2, to: 2, too: 2, three: 3, four: 4, for: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
}

function wordToNum(token) {
  if (/^\d+$/.test(token)) {
    if (token.length === 1 || token === '10') return parseInt(token)
    return null
  }
  return token in WORD_NUM ? WORD_NUM[token] : null
}

// Extract all numbers in order, splitting multi-digit tokens into individual digits.
export function parseNumbers(transcript) {
  const nums = []
  const tokens = transcript.toLowerCase().replace(/[,\-]/g, ' ').split(/\s+/)
  for (const t of tokens) {
    if (/^\d+$/.test(t)) {
      if (t.length === 1 || t === '10') nums.push(parseInt(t))
      else for (const ch of t) nums.push(parseInt(ch))
    } else if (t in WORD_NUM) {
      nums.push(WORD_NUM[t])
    }
  }
  return nums
}

// Extract numbers that follow any of the given keywords, in transcript order.
// Looks up to 2 tokens ahead in case of filler words (e.g. "bid a three").
function parseKeywordNumbers(transcript, keywords) {
  const tokens = transcript.toLowerCase().replace(/[,\-]/g, ' ').split(/\s+/)
  const nums = []
  for (let i = 0; i < tokens.length; i++) {
    if (keywords.includes(tokens[i])) {
      for (let j = i + 1; j <= i + 2 && j < tokens.length; j++) {
        const n = wordToNum(tokens[j])
        if (n !== null) { nums.push(n); break }
      }
    }
  }
  return nums
}

function makeVoiceHook(getNumbers) {
  return function useVoice() {
    const [listening, setListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [error, setError] = useState('')
    const recogRef = useRef(null)
    const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition)

    const onNumbersRef = useRef(null)
    const start = useCallback((onNumbers) => {
      onNumbersRef.current = onNumbers
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SR) return
      setError('')
      setTranscript('')
      const recog = new SR()
      recog.lang = 'en-US'
      recog.interimResults = false
      recog.maxAlternatives = 1
      recog.onstart = () => setListening(true)
      recog.onresult = e => {
        const t = e.results[0][0].transcript
        setTranscript(t)
        const nums = getNumbers(t)
        if (nums.length > 0) onNumbersRef.current(nums)
        else setError(`Heard "${t}" — no numbers found`)
      }
      recog.onerror = e => { setError(e.error); setListening(false) }
      recog.onend = () => setListening(false)
      recogRef.current = recog
      recog.start()
    }, [])

    const stop = useCallback(() => { recogRef.current?.stop(); setListening(false) }, [])
    return { listening, transcript, error, start, stop, supported }
  }
}

// Generic hook — falls back to all numbers if no keywords matched.
export function useVoiceInput(onNumbers) {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  const recogRef = useRef(null)
  const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition)

  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    setError('')
    setTranscript('')
    const recog = new SR()
    recog.lang = 'en-US'
    recog.interimResults = false
    recog.maxAlternatives = 1
    recog.onstart = () => setListening(true)
    recog.onresult = e => {
      const t = e.results[0][0].transcript
      setTranscript(t)
      const nums = parseNumbers(t)
      if (nums.length > 0) onNumbers(nums)
      else setError(`Heard "${t}" — no numbers found`)
    }
    recog.onerror = e => { setError(e.error); setListening(false) }
    recog.onend = () => setListening(false)
    recogRef.current = recog
    recog.start()
  }, [onNumbers])

  const stop = useCallback(() => { recogRef.current?.stop(); setListening(false) }, [])
  return { listening, transcript, error, start, stop, supported }
}

function makeContinuousVoiceHook(keywords) {
  return function useVoiceHook({ onNumbers }) {
    const [listening, setListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [error, setError] = useState('')
    const recogRef = useRef(null)
    const accNumsRef = useRef([])
    const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition)

    const start = useCallback(() => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SR) return
      setError('')
      setTranscript('')
      accNumsRef.current = []
      const recog = new SR()
      recog.lang = 'en-US'
      recog.continuous = true
      recog.interimResults = false
      recog.maxAlternatives = 1
      recog.onstart = () => setListening(true)
      recog.onresult = e => {
        let fullTranscript = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            const t = e.results[i][0].transcript
            fullTranscript += (fullTranscript ? ' ' : '') + t
            const keyword = parseKeywordNumbers(t, keywords)
            const segment = keyword.length > 0 ? keyword : parseNumbers(t)
            accNumsRef.current.push(...segment)
          }
        }
        if (fullTranscript) setTranscript(prev => prev ? prev + ' ' + fullTranscript : fullTranscript)
        if (accNumsRef.current.length > 0) onNumbers([...accNumsRef.current])
        else if (fullTranscript) setError(`Heard "${fullTranscript}" — no numbers found`)
      }
      recog.onerror = e => { if (e.error !== 'aborted') setError(e.error); setListening(false) }
      recog.onend = () => setListening(false)
      recogRef.current = recog
      recog.start()
    }, [onNumbers])

    const stop = useCallback(() => { recogRef.current?.stop(); setListening(false) }, [])
    return { listening, transcript, error, start, stop, supported }
  }
}

export const useBidVoice = makeContinuousVoiceHook(['bid', 'bed'])
export const useTrickVoice = makeContinuousVoiceHook(['got'])
