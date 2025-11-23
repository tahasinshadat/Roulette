"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LandingScreenProps {
  onStartGame: (amount: number) => void
}

export default function LandingScreen({ onStartGame }: LandingScreenProps) {
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")

  const handleStartGame = () => {
    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount greater than 0")
      return
    }
    onStartGame(numAmount)
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* Logo / Title */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-7xl font-bold text-casino-gold mb-4 tracking-wider">ROULETTE</h1>
          <div className="h-1 w-24 bg-gradient-to-r from-casino-gold to-casino-cream mx-auto mb-8" />
        </div>

        {/* Description */}
        <p className="text-casino-cream text-lg md:text-xl mb-12 leading-relaxed">
          Experience the thrill of the classic casino game. Place your bets, spin the wheel, and test your luck. Fortune
          favors the bold.
        </p>

        {/* Input Section */}
        <div className="bg-casino-darker border border-casino-gold/20 rounded-lg p-8 mb-8">
          <label className="block text-casino-cream mb-4 text-sm font-semibold uppercase tracking-widest">
            Starting Balance
          </label>
          <div className="flex gap-4 mb-4">
            <Input
              type="number"
              placeholder="Enter amount (e.g., 1000)"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setError("")
              }}
              className="bg-casino-dark border-casino-gold/30 text-casino-cream placeholder:text-casino-cream/50 text-lg py-6"
              min="0"
              step="1"
            />
          </div>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <Button
            onClick={handleStartGame}
            className="w-full bg-casino-gold hover:bg-casino-gold/90 text-casino-dark font-bold py-6 text-lg uppercase tracking-widest rounded-lg transition-all duration-300"
          >
            Start New Game
          </Button>
        </div>

        {/* Footer Text */}
        <p className="text-casino-cream/60 text-sm">
          Play responsibly. This is a game for entertainment purposes only.
        </p>
      </div>
    </div>
  )
}
