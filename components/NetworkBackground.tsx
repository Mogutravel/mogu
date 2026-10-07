'use client'

import React, { useEffect, useRef } from 'react'

export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    // Ajustar el tamaño del canvas al documento completo para que cubra todo el scroll
    const updateSize = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        window.innerHeight
      )
    }

    updateSize()
    window.addEventListener('resize', updateSize)

    // Configuración de partículas basada en el área total
    const particleCount = Math.floor((canvas.width * canvas.height) / 25000)
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
    }> = []

    for (let i = 0; i < Math.max(particleCount, 40); i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.5,
      })
    }

    // Posición del mouse (coordenadas relativas a la ventana + scroll)
    let mouse = { x: -1000, y: -1000, radius: 160 }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY + window.scrollY
    }

    window.addEventListener('mousemove', handleMouseMove)

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < particles.length; i++) {
        let p = particles[i]
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        // Dibujar nodo
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(16, 185, 129, 0.45)'
        ctx.fill()

        // Conectar con otras partículas
        for (let j = i + 1; j < particles.length; j++) {
          let p2 = particles[j]
          let dx = p.x - p2.x
          let dy = p.y - p2.y
          let dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 130) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            const alpha = (1 - dist / 130) * 0.18
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }

        // Conectar con el mouse
        let mouseDist = Math.sqrt((p.x - mouse.x) ** 2 + (p.y - mouse.y) ** 2)
        if (mouseDist < mouse.radius) {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(mouse.x, mouse.y)
          const mouseAlpha = (1 - mouseDist / mouse.radius) * 0.35
          ctx.strokeStyle = `rgba(52, 211, 153, ${mouseAlpha})`
          ctx.lineWidth = 0.8
          ctx.stroke()
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', updateSize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  )
}