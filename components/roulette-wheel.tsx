"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

interface RouletteWheelProps {
  winningNumber: number | null
  isSpinning: boolean
  onSpinComplete?: () => void
}

// European roulette wheel sequence (0-36)
const WHEEL_SEQUENCE = [
  0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5, 10, 23, 8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2,
  21, 4, 19, 15, 32,
]

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36])

// Animation timing
const LANDING_HOLD_DURATION = 3000 // 3s fully stopped

// Ball idle speed (how fast it spins when nothing is happening)
const BALL_IDLE_SPEED = 0.03

// Helper: pocket color
const getNumberColor = (num: number): THREE.Color => {
  if (num === 0) return new THREE.Color(0x22c55e) // green
  return RED_NUMBERS.has(num) ? new THREE.Color(0xdc2626) : new THREE.Color(0x1f2937) // red or black
}

type Phase = "idle" | "spinning" | "hold"

export default function RouletteWheel({ winningNumber, isSpinning, onSpinComplete }: RouletteWheelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const wheelRef = useRef<THREE.Group | null>(null)
  const ballRef = useRef<THREE.Mesh | null>(null)

  // Keep latest props available to the animation loop
  const spinPropsRef = useRef({
    isSpinning,
    winningNumber,
    onSpinComplete,
  })

  useEffect(() => {
    spinPropsRef.current.isSpinning = isSpinning
    spinPropsRef.current.winningNumber = winningNumber
    spinPropsRef.current.onSpinComplete = onSpinComplete
  }, [isSpinning, winningNumber, onSpinComplete])

  const animationStateRef = useRef({
    wheelRotation: 0,
    ballSpinRate: BALL_IDLE_SPEED,
    ballRadius: 48, // stays constant on the outer track
    ballAngle: 0,
    maxSpinDuration: 4000,
    phase: "idle" as Phase,
    spinStartTime: 0,
    holdStartTime: 0,
    spinCompletedCallbackFired: false,
  })

  useEffect(() => {
    if (!containerRef.current) {
      console.log("[v0] Container ref not available")
      return
    }

    // Clear any existing canvases to prevent duplicates
    const container = containerRef.current
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }

    try {
      // Scene setup
      const scene = new THREE.Scene()
      sceneRef.current = scene
      scene.background = new THREE.Color(0x0f0f0f)

      const width = container.clientWidth
      const height = container.clientHeight

      if (width === 0 || height === 0) {
        console.log("[v0] Container has zero dimensions:", width, height)
        return
      }

      const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
      camera.position.set(0, 100, 80)
      camera.lookAt(0, 0, 0)

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
      renderer.setSize(width, height)
      renderer.shadowMap.enabled = true
      container.appendChild(renderer.domElement)

      console.log("[v0] Three.js renderer initialized with dimensions:", width, height)

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
      directionalLight.position.set(50, 120, 50)
      directionalLight.castShadow = true
      directionalLight.shadow.mapSize.width = 2048
      directionalLight.shadow.mapSize.height = 2048
      scene.add(directionalLight)

      const pointLight1 = new THREE.PointLight(0xffffff, 1.2, 300)
      pointLight1.position.set(0, 100, 0)
      scene.add(pointLight1)

      const pointLight2 = new THREE.PointLight(0xd4af37, 0.5, 200)
      pointLight2.position.set(0, 50, 0)
      scene.add(pointLight2)

      // Create roulette wheel
      const wheelGroup = new THREE.Group()
      wheelRef.current = wheelGroup
      scene.add(wheelGroup)

      const wheelRadius = 50

      // Wheel base
      const baseGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 1.5, 64)
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.8,
        roughness: 0.2,
      })
      const wheelBase = new THREE.Mesh(baseGeometry, baseMaterial)
      wheelBase.castShadow = true
      wheelBase.receiveShadow = true
      wheelBase.position.y = -4
      wheelGroup.add(wheelBase)

      // Rim
      const rimGeometry = new THREE.TorusGeometry(wheelRadius - 0.5, 0.5, 16, 64)
      const rimMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        metalness: 0.9,
        roughness: 0.1,
      })
      const rim = new THREE.Mesh(rimGeometry, rimMaterial)
      rim.rotation.x = Math.PI / 2
      rim.position.y = -3.5
      wheelGroup.add(rim)

      // Wheel pockets
      const segmentAngle = (Math.PI * 2) / WHEEL_SEQUENCE.length
      const pocketDepth = 3
      const pocketWidth = 8
      const pocketRadius = wheelRadius - 8

      for (let i = 0; i < WHEEL_SEQUENCE.length; i++) {
        const number = WHEEL_SEQUENCE[i]
        const color = getNumberColor(number)
        const angle = i * segmentAngle

        const pocketShape = new THREE.Shape()
        const innerRadius = pocketRadius - pocketWidth
        const outerRadius = pocketRadius + 2

        pocketShape.moveTo(0, 0)
        for (let j = 0; j <= 10; j++) {
          const a = angle - segmentAngle / 2 + (segmentAngle * j) / 10
          pocketShape.lineTo(Math.cos(a) * outerRadius, Math.sin(a) * outerRadius)
        }
        for (let j = 10; j >= 0; j--) {
          const a = angle - segmentAngle / 2 + (segmentAngle * j) / 10
          pocketShape.lineTo(Math.cos(a) * innerRadius, Math.sin(a) * innerRadius)
        }
        pocketShape.lineTo(0, 0)

        const extrudeSettings = {
          depth: pocketDepth,
          bevelEnabled: true,
          bevelThickness: 0.3,
          bevelSize: 0.3,
          bevelSegments: 2,
        }

        const pocketGeometry = new THREE.ExtrudeGeometry(pocketShape, extrudeSettings)
        const pocketMaterial = new THREE.MeshStandardMaterial({
          color: color,
          metalness: 0.15,
          roughness: 0.5,
        })
        const pocket = new THREE.Mesh(pocketGeometry, pocketMaterial)
        pocket.rotation.x = -Math.PI / 2
        pocket.position.y = -1.5
        pocket.castShadow = true
        pocket.receiveShadow = true
        wheelGroup.add(pocket)

        // Separator
        const separatorGeometry = new THREE.BoxGeometry(0.15, 1, pocketWidth - 3)
        const separatorMaterial = new THREE.MeshStandardMaterial({
          color: 0xa0a0a0,
          metalness: 0.85,
          roughness: 0.2,
        })
        const separator = new THREE.Mesh(separatorGeometry, separatorMaterial)
        separator.position.x = Math.cos(angle - segmentAngle / 2) * pocketRadius
        separator.position.z = Math.sin(angle - segmentAngle / 2) * pocketRadius
        separator.position.y = -1.5
        separator.rotation.y = angle - segmentAngle / 2
        separator.castShadow = true
        wheelGroup.add(separator)

        // Numbers
        const canvas = document.createElement("canvas")
        canvas.width = 512
        canvas.height = 512
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
          ctx.shadowBlur = 10
          ctx.shadowOffsetX = 3
          ctx.shadowOffsetY = 3

          ctx.fillStyle = "#ffffff"
          ctx.font = "bold 280px Arial"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(number.toString(), 256, 256)
        }

        const texture = new THREE.CanvasTexture(canvas)
        const textMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          transparent: true,
          emissive: 0xffffff,
          emissiveIntensity: 0.5,
        })
        const textGeometry = new THREE.PlaneGeometry(5.5, 5.5)
        const textMesh = new THREE.Mesh(textGeometry, textMaterial)

        const textRadius = pocketRadius - 2
        textMesh.position.set(Math.cos(angle) * textRadius, 2.5, Math.sin(angle) * textRadius)
        textMesh.rotation.x = -Math.PI / 2
        textMesh.rotation.z = -angle
        wheelGroup.add(textMesh)
      }

      // Center hub
      const hubGeometry = new THREE.CylinderGeometry(15, 15, 10, 64)
      const hubMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        metalness: 0.95,
        roughness: 0.1,
      })
      const hub = new THREE.Mesh(hubGeometry, hubMaterial)
      hub.castShadow = true
      hub.receiveShadow = true
      hub.position.y = 3
      wheelGroup.add(hub)

      // Inner gold ring
      const innerRingGeometry = new THREE.CylinderGeometry(17, 17, 1.5, 64)
      const innerRingMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.98,
        roughness: 0.05,
      })
      const innerRing = new THREE.Mesh(innerRingGeometry, innerRingMaterial)
      innerRing.position.y = 8
      innerRing.castShadow = true
      wheelGroup.add(innerRing)

      // Center top disc
      const topDiscGeometry = new THREE.CylinderGeometry(10, 10, 1, 64)
      const topDiscMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.9,
        roughness: 0.1,
      })
      const topDisc = new THREE.Mesh(topDiscGeometry, topDiscMaterial)
      topDisc.position.y = 9
      topDisc.castShadow = true
      wheelGroup.add(topDisc)

      // Outer gold ring
      const ringGeometry = new THREE.TorusGeometry(wheelRadius + 3, 1.5, 32, 100)
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.95,
        roughness: 0.05,
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.castShadow = true
      ring.receiveShadow = true
      ring.rotation.x = Math.PI / 2
      ring.position.y = 0
      wheelGroup.add(ring)

      // Ball
      const ballGeometry = new THREE.SphereGeometry(2, 32, 32)
      const ballMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.05,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        reflectivity: 0.9,
      })
      const ball = new THREE.Mesh(ballGeometry, ballMaterial)
      ball.castShadow = true
      ball.receiveShadow = false
      ball.position.set(animationStateRef.current.ballRadius, 4, 0)
      ballRef.current = ball
      scene.add(ball)

      // Pointer
      const pointerGeometry = new THREE.ConeGeometry(2.5, 6, 16)
      const pointerMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.95,
        roughness: 0.05,
      })
      const pointer = new THREE.Mesh(pointerGeometry, pointerMaterial)
      pointer.position.set(0, 5, -(wheelRadius + 5))
      pointer.rotation.x = Math.PI
      pointer.castShadow = true
      scene.add(pointer)

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate)

        const currentTime = Date.now()
        const state = animationStateRef.current
        const { isSpinning: isSpinningNow, onSpinComplete: onSpinCompleteNow } = spinPropsRef.current

        // --- PHASE STATE MACHINE ---

        if (state.phase === "idle") {
          if (isSpinningNow) {
            // Start a new spin
            state.phase = "spinning"
            state.spinStartTime = currentTime
            state.spinCompletedCallbackFired = false
            state.ballSpinRate = 0.08 // fast at start
          } else {
            // Idle: slow orbit
            state.ballSpinRate = BALL_IDLE_SPEED
          }
        } else if (state.phase === "spinning") {
          if (!isSpinningNow) {
            // Spin has ended -> freeze wheel & ball where they are
            state.phase = "hold"
            state.holdStartTime = currentTime
            state.ballSpinRate = 0 // stop ball completely
          } else {
            // Decelerate wheel + ball
            const progress = Math.min(
              (currentTime - state.spinStartTime) / state.maxSpinDuration,
              1,
            )
            const spinMultiplier = Math.pow(1 - progress, 1.5)
            state.ballSpinRate = 0.08 * spinMultiplier + 0.001
            state.wheelRotation += state.ballSpinRate
          }
        } else if (state.phase === "hold") {
          const timeInHold = currentTime - state.holdStartTime

          // Ball stays at same angle & radius, slightly lower (we handle Y below)
          state.ballSpinRate = 0

          if (timeInHold >= LANDING_HOLD_DURATION) {
            // Done holding for 3 seconds, go back to idle
            state.phase = "idle"
            state.ballSpinRate = BALL_IDLE_SPEED

            if (!state.spinCompletedCallbackFired && onSpinCompleteNow) {
              state.spinCompletedCallbackFired = true
              onSpinCompleteNow()
            }
          }
        }

        // --- APPLY TRANSFORMS ---

        // Wheel rotation (only changes during spinning)
        if (wheelRef.current) {
          wheelRef.current.rotation.y = state.wheelRotation
        }

        // Ball angle & position
        if (ballRef.current) {
          if (state.ballSpinRate !== 0) {
            state.ballAngle += state.ballSpinRate
          }

          ballRef.current.position.x = Math.cos(state.ballAngle) * state.ballRadius
          ballRef.current.position.z = Math.sin(state.ballAngle) * state.ballRadius

          // Height:
          // - spinning/idle: gentle bounce
          // - hold: fixed lower position (looks "settled" in the pocket area)
          if (state.phase === "hold") {
            ballRef.current.position.y = 2 // lower, but not inside the table
          } else {
            const heightFactor = state.ballRadius / 48
            ballRef.current.position.y = 4 + Math.sin(Date.now() * 0.008) * 1.5 * heightFactor
          }
        }

        renderer.render(scene, camera)
      }

      animate()

      // Handle window resize
      const handleResize = () => {
        if (!containerRef.current) return
        const width = containerRef.current.clientWidth
        const height = containerRef.current.clientHeight
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
      }

      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
        if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
          containerRef.current.removeChild(renderer.domElement)
        }
        renderer.dispose()
      }
    } catch (error) {
      console.error("[v0] Three.js initialization error:", error)
    }
  }, []) // init Three.js once

  // You can keep this or delete it; it's no longer used for animation
  const calculateWinningRotation = (_number: number): number => {
    return 0
  }

  return <div ref={containerRef} className="w-full h-full bg-casino-dark" />
}
