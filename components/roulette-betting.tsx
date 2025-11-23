"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface RouletteBettingProps {
  balance: number
  onSpin: (betAmount: number, betType: "red" | "black" | "number", betValue: string | number) => void
  onWalkAway: () => void
  isSpinning: boolean
}

export default function RouletteBetting({ balance, onSpin, onWalkAway, isSpinning }: RouletteBettingProps) {
  const [betAmount, setBetAmount] = useState("")
  const [selectedColor, setSelectedColor] = useState<"red" | "black" | null>(null)
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [error, setError] = useState("")

  const handleSpin = () => {
    const amount = Number.parseFloat(betAmount)

    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid bet amount")
      return
    }

    if (amount > balance) {
      setError("Insufficient balance")
      return
    }

    if (!selectedColor && !selectedNumber) {
      setError("Please select a bet type")
      return
    }

    if (selectedNumber !== null) {
      onSpin(amount, "number", selectedNumber)
    } else if (selectedColor) {
      onSpin(amount, selectedColor, selectedColor)
    }

    setBetAmount("")
    setSelectedColor(null)
    setSelectedNumber(null)
    setError("")
  }

  const toggleColor = (color: "red" | "black") => {
    setSelectedColor(selectedColor === color ? null : color)
    setSelectedNumber(null)
    setError("")
  }

  const toggleNumber = (num: number) => {
    setSelectedNumber(selectedNumber === num ? null : num)
    setSelectedColor(null)
    setError("")
  }

  return (
    <div className="bg-casino-darker border border-casino-gold/20 rounded-lg p-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold text-casino-gold mb-6 uppercase tracking-widest">Place Bet</h2>

      {/* Bet Amount */}
      <div className="mb-6">
        <label className="block text-casino-cream text-sm font-semibold mb-2 uppercase tracking-widest">
          Bet Amount
        </label>
        <Input
          type="number"
          placeholder="Enter amount"
          value={betAmount}
          onChange={(e) => {
            setBetAmount(e.target.value)
            setError("")
          }}
          className="bg-casino-dark border-casino-gold/30 text-casino-cream placeholder:text-casino-cream/50 w-full py-2"
          max={balance}
          min="1"
          step="1"
        />
      </div>

      {/* Color Selection */}
      <div className="mb-6">
        <label className="block text-casino-cream text-sm font-semibold mb-3 uppercase tracking-widest">Color</label>
        <div className="flex gap-3">
          <button
            onClick={() => toggleColor("red")}
            className={`flex-1 py-3 px-4 rounded-lg font-bold uppercase transition-all ${
              selectedColor === "red"
                ? "bg-red-500 text-white scale-105"
                : "bg-casino-dark border border-red-500/50 text-red-400 hover:border-red-500"
            }`}
          >
            Red
          </button>
          <button
            onClick={() => toggleColor("black")}
            className={`flex-1 py-3 px-4 rounded-lg font-bold uppercase transition-all ${
              selectedColor === "black"
                ? "bg-gray-800 text-white scale-105"
                : "bg-casino-dark border border-gray-500/50 text-gray-400 hover:border-gray-500"
            }`}
          >
            Black
          </button>
        </div>
      </div>

      {/* Number Selection */}
      <div className="mb-6">
        <label className="block text-casino-cream text-sm font-semibold mb-3 uppercase tracking-widest">
          Or Select Number
        </label>
        <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-casino-gold scrollbar-track-casino-dark">
          {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => toggleNumber(num)}
              className={`py-2 px-1 rounded text-sm font-bold transition-all ${
                selectedNumber === num
                  ? "bg-casino-gold text-casino-dark scale-110"
                  : "bg-casino-dark border border-casino-gold/30 text-casino-cream hover:border-casino-gold"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {/* Spin Button */}
      <Button
        onClick={handleSpin}
        disabled={isSpinning || balance <= 0}
        className="w-full bg-casino-gold hover:bg-casino-gold/90 disabled:opacity-50 text-casino-dark font-bold py-3 uppercase tracking-widest rounded-lg transition-all mb-3"
      >
        {isSpinning ? "Spinning..." : "Spin"}
      </Button>

      {/* Walk Away Button */}
      <Button
        onClick={onWalkAway}
        disabled={isSpinning}
        variant="outline"
        className="w-full border-casino-cream/50 text-casino-cream hover:bg-casino-cream/10 font-bold py-3 uppercase tracking-widest rounded-lg transition-all bg-transparent"
      >
        Walk Away
      </Button>
    </div>
  )
}
