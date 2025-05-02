"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface CountdownTimerProps {
  endTime: Date
  onComplete?: () => void
  compact?: boolean
  className?: string
}

export function CountdownTimer({ endTime, onComplete, compact = false, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - new Date().getTime()

      if (difference <= 0) {
        setIsComplete(true)
        onComplete?.()
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime, onComplete])

  if (isComplete) {
    return <div className={cn("text-red-400 font-medium", className)}>Auction ended</div>
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1 text-xs", className)}>
        <span className="font-mono">{timeLeft.days}d</span>
        <span className="font-mono">{timeLeft.hours}h</span>
        <span className="font-mono">{timeLeft.minutes}m</span>
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-4 gap-2", className)}>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          {timeLeft.days}
        </span>
        <span className="text-xs text-muted-foreground">Days</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          {timeLeft.hours}
        </span>
        <span className="text-xs text-muted-foreground">Hours</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          {timeLeft.minutes}
        </span>
        <span className="text-xs text-muted-foreground">Mins</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          {timeLeft.seconds}
        </span>
        <span className="text-xs text-muted-foreground">Secs</span>
      </div>
    </div>
  )
}
