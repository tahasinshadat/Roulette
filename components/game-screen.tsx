"use client"

import { useState } from "react"
import RouletteBetting from "./roulette-betting"
import RouletteWheel from "./roulette-wheel"
import GameEndModal from "./game-end-modal"

interface GameScreenProps {
  startingBalance: number
  onGameEnd: () => void
}

export default function GameScreen({ startingBalance, onGameEnd }: GameScreenProps) {
  const [balance, setBalance] = useState(startingBalance)
  const [houseWinnings, setHouseWinnings] = useState(0)
  const [lastResult, setLastResult] = useState<{ number: number; color: string } | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showEndModal, setShowEndModal] = useState(false)
  const [winAmount, setWinAmount] = useState(0)
  const [winningNumber, setWinningNumber] = useState<number | null>(null)

  const handleSpin = (betAmount: number, betType: "red" | "black" | "number", betValue: string | number) => {
    if (isSpinning) return

    setIsSpinning(true)
    setWinningNumber(null)

    // Simulate spin delay - 4 seconds for animation
    setTimeout(() => {
      const spinResult = Math.floor(Math.random() * 37) // 0-36 including 0
      const spinColor = getColorForNumber(spinResult)

      let won = false
      let payout = 0

      if (betType === "number" && betValue === spinResult) {
        won = true
        payout = betAmount * 36 // 36:1 payout for straight bet
      } else if (betType === "red" && betValue === "red" && spinColor === "red") {
        won = true
        payout = betAmount * 2 // 1:1 payout for color
      } else if (betType === "black" && betValue === "black" && spinColor === "black") {
        won = true
        payout = betAmount * 2
      }

      const newBalance = won ? balance + payout : balance - betAmount
      const newHouseWinnings = won ? houseWinnings - payout : houseWinnings + betAmount

      setWinningNumber(spinResult)
      setLastResult({ number: spinResult, color: spinColor })
      setBalance(newBalance)
      setHouseWinnings(newHouseWinnings)
      setIsSpinning(false)

      if (newBalance <= 0) {
        setWinAmount(newBalance - startingBalance)
        setShowEndModal(true)
      }
    }, 4000) // Match wheel animation duration
  }

  const handleWalkAway = () => {
    setWinAmount(balance - startingBalance)
    setShowEndModal(true)
  }

  const getColorForNumber = (num: number): string => {
    const red = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
    if (num === 0) return "green"
    return red.includes(num) ? "red" : "black"
  }

  return (
    <div className="w-full min-h-screen p-4 md:p-8 flex flex-col">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-4xl md:text-5xl font-bold text-casino-gold mb-4 tracking-wider">ROULETTE</h1>
        <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
          <div className="bg-casino-darker border border-casino-gold/20 rounded-lg px-6 py-3">
            <p className="text-casino-cream/70 text-sm uppercase tracking-widest">Your Balance</p>
            <p className="text-2xl md:text-3xl font-bold text-casino-gold">${balance.toFixed(2)}</p>
          </div>
          <div className="bg-casino-darker border border-casino-gold/20 rounded-lg px-6 py-3">
            <p className="text-casino-cream/70 text-sm uppercase tracking-widest">House Winnings</p>
            <p className={`text-2xl md:text-3xl font-bold ${houseWinnings >= 0 ? "text-green-400" : "text-red-400"}`}>
              ${houseWinnings.toFixed(2)}
            </p>
          </div>
          {lastResult && (
            <div className="bg-casino-darker border border-casino-gold/20 rounded-lg px-6 py-3">
              <p className="text-casino-cream/70 text-sm uppercase tracking-widest">Last Result</p>
              <p
                className={`text-2xl md:text-3xl font-bold ${
                  lastResult.color === "red"
                    ? "text-red-400"
                    : lastResult.color === "green"
                      ? "text-green-400"
                      : "text-gray-300"
                }`}
              >
                {lastResult.number}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8 mb-8">
        {/* Wheel - takes up more space */}
        <div className="lg:col-span-3 bg-casino-darker border border-casino-gold/20 rounded-lg overflow-hidden h-96 md:h-full">
          <RouletteWheel winningNumber={winningNumber} isSpinning={isSpinning} />
        </div>

        {/* Betting Panel */}
        <div className="lg:col-span-1">
          <RouletteBetting balance={balance} onSpin={handleSpin} onWalkAway={handleWalkAway} isSpinning={isSpinning} />
        </div>
      </div>

      {/* End Game Modal */}
      {showEndModal && (
        <GameEndModal
          finalBalance={balance}
          winAmount={winAmount}
          startingBalance={startingBalance}
          onPlayAgain={() => {
            setShowEndModal(false)
            onGameEnd()
          }}
          onExit={() => {
            setShowEndModal(false)
            onGameEnd()
          }}
        />
      )}
    </div>
  )
}
