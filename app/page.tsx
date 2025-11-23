"use client"

import { useState } from "react"
import LandingScreen from "@/components/landing-screen"
import GameScreen from "@/components/game-screen"

export default function Page() {
  const [gameState, setGameState] = useState<"landing" | "playing">("landing")
  const [startingBalance, setStartingBalance] = useState<number>(0)

  const handleStartGame = (amount: number) => {
    setStartingBalance(amount)
    setGameState("playing")
  }

  const handleGameEnd = () => {
    setGameState("landing")
  }

  const handlePlayAgain = (amount: number) => {
    setStartingBalance(amount)
    setGameState("playing")
  }

  return (
    <main className="w-full min-h-screen bg-casino-dark">
      {gameState === "landing" && <LandingScreen onStartGame={handleStartGame} />}
      {gameState === "playing" && <GameScreen startingBalance={startingBalance} onGameEnd={handleGameEnd} />}
    </main>
  )
}
