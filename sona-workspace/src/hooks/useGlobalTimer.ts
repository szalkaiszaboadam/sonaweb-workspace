'use client'

import { useState, useEffect } from 'react'

export type TimerData = {
  workspaceId: string
  projectId: string | null
  description: string
  taskId: string | null
  status: 'idle' | 'running' | 'paused'
  accumulatedSeconds: number
  lastStartTime: number | null
}

const defaultTimer: TimerData = {
  workspaceId: '', projectId: null, description: '', taskId: null,
  status: 'idle', accumulatedSeconds: 0, lastStartTime: null
}

let globalTimerState: TimerData = defaultTimer
const listeners = new Set<() => void>()

if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('sona-global-timer')
  if (saved) {
    try { globalTimerState = JSON.parse(saved) } catch (e) {}
  }
}

function notify() {
  if (typeof window !== 'undefined') {
    if (globalTimerState.status === 'idle') {
      localStorage.removeItem('sona-global-timer')
    } else {
      localStorage.setItem('sona-global-timer', JSON.stringify(globalTimerState))
    }
  }
  listeners.forEach(listener => listener())
}

export const formatTimerDisplay = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0')
  const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0')
  const s = (totalSeconds % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

export function useGlobalTimer() {
  const [timer, setTimer] = useState<TimerData>(globalTimerState)
  const [displaySeconds, setDisplaySeconds] = useState(0)

  useEffect(() => {
    const handleUpdate = () => setTimer(globalTimerState)
    listeners.add(handleUpdate)
    return () => { listeners.delete(handleUpdate) }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    const updateDisplay = () => {
      if (globalTimerState.status === 'idle') {
        setDisplaySeconds(0)
      } else if (globalTimerState.status === 'paused') {
        setDisplaySeconds(globalTimerState.accumulatedSeconds)
      } else if (globalTimerState.status === 'running' && globalTimerState.lastStartTime) {
        const elapsed = Math.floor((Date.now() - globalTimerState.lastStartTime) / 1000)
        setDisplaySeconds(globalTimerState.accumulatedSeconds + elapsed)
      }
    }
    updateDisplay()
    if (timer.status === 'running') {
      interval = setInterval(updateDisplay, 1000)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [timer.status, timer.accumulatedSeconds, timer.lastStartTime])

  const start = (workspaceId: string, projectId: string | null = null, description: string = '', taskId: string | null = null) => {
    globalTimerState = {
      workspaceId, projectId, description, taskId,
      status: 'running',
      accumulatedSeconds: 0,
      lastStartTime: Date.now()
    }
    notify()
  }

  const pause = () => {
    if (globalTimerState.status !== 'running' || !globalTimerState.lastStartTime) return
    const elapsed = Math.floor((Date.now() - globalTimerState.lastStartTime) / 1000)
    globalTimerState = {
      ...globalTimerState,
      status: 'paused',
      accumulatedSeconds: globalTimerState.accumulatedSeconds + elapsed,
      lastStartTime: null
    }
    notify()
  }

  const resume = () => {
    if (globalTimerState.status !== 'paused') return
    globalTimerState = {
      ...globalTimerState,
      status: 'running',
      lastStartTime: Date.now()
    }
    notify()
  }

  const stop = () => {
    let total = globalTimerState.accumulatedSeconds
    if (globalTimerState.status === 'running' && globalTimerState.lastStartTime) {
      total += Math.floor((Date.now() - globalTimerState.lastStartTime) / 1000)
    }
    const finalData = { ...globalTimerState, totalSeconds: total }
    globalTimerState = defaultTimer
    notify()
    return finalData
  }

  return { timer, displaySeconds, start, pause, resume, stop }
}