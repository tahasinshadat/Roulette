"use client"

import { Button } from "@/components/ui/button"

interface GameEndModalProps {
  finalBalance: number
  winAmount: number
  startingBalance: number
  onPlayAgain: () => void
  onExit: () => void
}

export default function GameEndModal({
  finalBalance,
  winAmount,
  startingBalance,
  onPlayAgain,
  onExit,
}: GameEndModalProps) {
  const isWin = winAmount > 0

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-casino-darker border-2 border-casino-gold rounded-lg max-w-md w-full p-8 text-center animate-fade-in">
        <h2 className="text-4xl font-bold text-casino-gold mb-4 uppercase tracking-widest">
          {finalBalance <= 0 ? "Game Over" : "Session Ended"}
        </h2>

        <div className="mb-8">
          <p className="text-casino-cream/70 text-sm uppercase tracking-widest mb-2">Final Balance</p>
          <p className="text-4xl font-bold text-casino-gold mb-4">${finalBalance.toFixed(2)}</p>

          <div className="bg-casino-dark rounded-lg p-4 mb-4">
            <p className="text-casino-cream/70 text-sm uppercase tracking-widest mb-2">
              {isWin ? "Total Winnings" : "Total Loss"}
            </p>
            <p className={`text-3xl font-bold ${isWin ? "text-green-400" : "text-red-400"}`}>
              {isWin ? "+" : ""}${Math.abs(winAmount).toFixed(2)}
            </p>
          </div>

          <p className="text-casino-cream text-sm">
            Starting Balance: <span className="text-casino-gold font-bold">${startingBalance.toFixed(2)}</span>
          </p>
        </div>

        {finalBalance <= 0 && (
          <p className="text-red-400 text-sm mb-6 font-semibold">You've run out of chips! Time for a new game.</p>
        )}

        <div className="flex gap-4">
          <Button
            onClick={onPlayAgain}
            className="flex-1 bg-casino-gold hover:bg-casino-gold/90 text-casino-dark font-bold py-3 uppercase tracking-widest rounded-lg"
          >
            New Game
          </Button>
          <Button
            onClick={onExit}
            variant="outline"
            className="flex-1 border-casino-cream/50 text-casino-cream hover:bg-casino-cream/10 font-bold py-3 uppercase tracking-widest rounded-lg bg-transparent"
          >
            Exit
          </Button>
        </div>

        <p className="text-casino-cream/50 text-xs mt-6">Thanks for playing!</p>
      </div>
    </div>
  )
}
