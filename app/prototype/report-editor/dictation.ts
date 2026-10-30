"use client"

// PROTOTYPE — desktop dictation for the Inbox composer (story 21). Uses the browser's own speech
// recognition: no audio reaches our server and nothing is stored. The result is plain text the
// manager checks before sending, so the Capture is an ordinary text Capture.

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"

// lib.dom ships the result types but not the recogniser itself (Chrome still prefixes it).
type Recognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: { results: SpeechRecognitionResultList }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}
type RecognitionCtor = new () => Recognition

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

const noSubscribe = () => () => {}

export type DictationState = "idle" | "listening" | "blocked" | "no-mic" | "failed"

/** Message shown in place when dictation can't run. Kept short: it sits in the composer's hint line. */
export const dictationMessage: Partial<Record<DictationState, string>> = {
  blocked: "Mic blocked in site settings",
  "no-mic": "No microphone found",
  failed: "Dictation didn't work, try again",
}

/** Puts what was said after what was already typed, with one space between. */
export function joinDictation(before: string, said: string) {
  const s = said.trim()
  if (!s) return before
  if (!before.trim()) return s
  return /\s$/.test(before) ? before + s : `${before} ${s}`
}

/**
 * `onText` gets everything said in this session so far (final and interim), each time it changes.
 * `supported` is false on the server and in browsers without speech recognition: hide the control then.
 */
export function useDictation(onText: (said: string) => void) {
  const supported = useSyncExternalStore(noSubscribe, () => recognitionCtor() !== null, () => false)
  const [state, setState] = useState<DictationState>("idle")
  const rec = useRef<Recognition | null>(null)
  // A stopped session still delivers its last words; a newer session silences it.
  const closing = useRef<Recognition | null>(null)
  const onTextRef = useRef(onText)
  useEffect(() => {
    onTextRef.current = onText
  })

  /** Ends the session and drops anything still in flight (used before sending). */
  const cancel = useCallback(() => {
    for (const r of [rec.current, closing.current]) {
      if (!r) continue
      r.onresult = r.onerror = r.onend = null
      r.abort()
    }
    rec.current = closing.current = null
    setState((s) => (s === "listening" ? "idle" : s))
  }, [])

  const start = useCallback(() => {
    const Ctor = recognitionCtor()
    if (!Ctor || rec.current) return
    closing.current?.abort()
    closing.current = null
    const r = new Ctor()
    r.lang = "en-US"
    r.continuous = true
    r.interimResults = true
    r.onresult = (e) => {
      if (rec.current !== r && closing.current !== r) return
      let said = ""
      for (let i = 0; i < e.results.length; i++) said += e.results[i][0].transcript
      onTextRef.current(said)
    }
    r.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") setState("blocked")
      else if (e.error === "audio-capture") setState("no-mic")
      else if (e.error === "no-speech" || e.error === "aborted") setState("idle")
      else setState("failed")
    }
    r.onend = () => {
      if (rec.current === r) rec.current = null
      if (closing.current === r) closing.current = null
      // An error already set its own state; a plain end goes back to idle.
      setState((s) => (s === "listening" ? "idle" : s))
    }
    rec.current = r
    setState("listening")
    try {
      r.start()
    } catch {
      rec.current = null
      setState("failed")
    }
  }, [])

  /** Stops listening but keeps the last words that are still being recognised. */
  const stop = useCallback(() => {
    const r = rec.current
    if (r) {
      rec.current = null
      closing.current = r
      r.stop()
    }
    setState((s) => (s === "listening" ? "idle" : s))
  }, [])

  /** Clears a shown error, e.g. once the manager types again. */
  const reset = useCallback(() => setState((s) => (s === "listening" ? s : "idle")), [])

  useEffect(() => cancel, [cancel])

  return { supported, state, listening: state === "listening", start, stop, cancel, reset }
}
