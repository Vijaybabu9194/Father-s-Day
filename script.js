class CinematicFathersDayExperience {
    constructor() {
        this.particles = []
        this.canvas = null
        this.ctx = null
        this.mouseX = 0
        this.mouseY = 0
        this.isPlaying = false
        this.currentTime = 0
        this.totalTime = 225 // 3:45 in seconds
        this.init()
    }

    init() {
        // Enhanced mobile detection and viewport fix
        this.isMobile =
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            window.innerWidth < 768
        this.isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0

        // Fix viewport on mobile
        if (this.isMobile) {
            document.body.style.overflowX = "hidden"
            document.documentElement.style.overflowX = "hidden"
        }

        this.setupLoadingScreen()

        // Only setup custom cursor on non-touch devices
        if (!this.isTouch) {
            this.setupCustomCursor()
        }

        // Reduce particle count significantly on mobile
        if (!this.isMobile) {
            this.setupParticleSystem()
        }

        this.setupScrollAnimations()
        this.setupInteractiveElements()
        this.setupAudioPlayer()

        // Reduce floating hearts frequency on mobile
        this.createFloatingHearts()

        // Only start animation loop on desktop for better mobile performance
        if (!this.isMobile) {
            this.startAnimationLoop()
        }

        // Add touch event listeners for mobile
        if (this.isTouch) {
            this.setupTouchInteractions()
        }

        // Add resize handler to maintain proper viewport
        window.addEventListener("resize", () => {
            if (this.isMobile) {
                document.body.style.overflowX = "hidden"
                document.documentElement.style.overflowX = "hidden"
            }
        })
    }

    setupLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById("loadingScreen")
            loadingScreen.style.opacity = "0"
            setTimeout(() => {
                loadingScreen.style.display = "none"
                this.startExperience()
            }, 2000)
        }, 3000)
    }

    startExperience() {
        document.body.style.overflow = "auto"
        this.typewriterEffect()
    }

    typewriterEffect() {
        const title = document.querySelector(".hero-title")
        const originalText = title.textContent
        title.textContent = ""

        let i = 0
        const typeInterval = setInterval(() => {
            title.textContent += originalText[i]
            i++
            if (i >= originalText.length) {
                clearInterval(typeInterval)
                this.addSparkleEffect(title)
            }
        }, 200)
    }

    setupCustomCursor() {
        const cursor = document.querySelector(".cursor")
        const follower = document.querySelector(".cursor-follower")

        document.addEventListener("mousemove", (e) => {
            this.mouseX = e.clientX
            this.mouseY = e.clientY

            cursor.style.left = e.clientX - 10 + "px"
            cursor.style.top = e.clientY - 10 + "px"

            setTimeout(() => {
                follower.style.left = e.clientX - 20 + "px"
                follower.style.top = e.clientY - 20 + "px"
            }, 100)
        })

        // Cursor interactions
        document.querySelectorAll("button, .photo-frame, .timeline-content, .holographic-card").forEach((el) => {
            el.addEventListener("mouseenter", () => {
                cursor.style.transform = "scale(1.5)"
                follower.style.transform = "scale(1.5)"
            })

            el.addEventListener("mouseleave", () => {
                cursor.style.transform = "scale(1)"
                follower.style.transform = "scale(1)"
            })
        })
    }

    setupParticleSystem() {
        this.canvas = document.getElementById("particleCanvas")
        this.ctx = this.canvas.getContext("2d")
        this.resizeCanvas()

        window.addEventListener("resize", () => this.resizeCanvas())

        // Reduce particles for better performance
        const particleCount = window.innerWidth < 768 ? 30 : 50
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(this.createParticle())
        }
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 3 + 1,
            opacity: Math.random() * 0.5 + 0.2,
            color: `hsl(${Math.random() * 60 + 40}, 70%, 60%)`,
            life: Math.random() * 100 + 100,
        }
    }

    updateParticles() {
        // Use for loop instead of forEach for better performance
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i]
            particle.x += particle.vx
            particle.y += particle.vy
            particle.life--

            // Simplified mouse interaction
            const dx = this.mouseX - particle.x
            const dy = this.mouseY - particle.y
            const distance = dx * dx + dy * dy // Skip sqrt for performance

            if (distance < 10000) {
                // 100px squared
                particle.vx += dx * 0.00005
                particle.vy += dy * 0.00005
            }

            // Wrap around screen
            if (particle.x < 0) particle.x = this.canvas.width
            if (particle.x > this.canvas.width) particle.x = 0
            if (particle.y < 0) particle.y = this.canvas.height
            if (particle.y > this.canvas.height) particle.y = 0

            // Regenerate particle
            if (particle.life <= 0) {
                this.particles[i] = this.createParticle()
            }
        }
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        this.particles.forEach((particle) => {
            this.ctx.beginPath()
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)

            const gradient = this.ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size)
            gradient.addColorStop(0, particle.color)
            gradient.addColorStop(1, "transparent")

            this.ctx.fillStyle = gradient
            this.ctx.globalAlpha = particle.opacity
            this.ctx.fill()
        })

        this.ctx.globalAlpha = 1
    }

    setupAudioPlayer() {
        const playBtn = document.getElementById("playBtn")
        const volumeSlider = document.getElementById("volumeSlider")
        const audioVisualizer = document.getElementById("audioVisualizer")
        const audioBars = audioVisualizer.querySelectorAll(".audio-bar")

        playBtn.addEventListener("click", () => {
            this.toggleAudio()
        })

        volumeSlider.addEventListener("input", (e) => {
            this.setVolume(e.target.value)
        })

        // Enhanced audio visualizer animation
        this.animateAudioBars(audioBars)
    }

    toggleAudio() {
        const playBtn = document.getElementById("playBtn")
        const playIcon = playBtn.querySelector(".play-icon")
        const playText = playBtn.querySelector(".play-text")

        this.isPlaying = !this.isPlaying

        if (this.isPlaying) {
            playIcon.textContent = "⏸️"
            playText.textContent = "Pause"
            this.startAudioTimer()
            this.enhanceAudioVisualization()
        } else {
            playIcon.textContent = "▶️"
            playText.textContent = "Play Our Song"
            this.stopAudioTimer()
        }
    }

    setVolume(volume) {
        // Visual feedback for volume change
        const volumeIcon = document.querySelector(".volume-icon")
        if (volume == 0) {
            volumeIcon.textContent = "🔇"
        } else if (volume < 30) {
            volumeIcon.textContent = "🔈"
        } else if (volume < 70) {
            volumeIcon.textContent = "🔉"
        } else {
            volumeIcon.textContent = "🔊"
        }
    }

    startAudioTimer() {
        this.audioTimer = setInterval(() => {
            this.currentTime++
            if (this.currentTime >= this.totalTime) {
                this.currentTime = 0
            }
            this.updateTimeDisplay()
        }, 1000)
    }

    stopAudioTimer() {
        if (this.audioTimer) {
            clearInterval(this.audioTimer)
        }
    }

    updateTimeDisplay() {
        const currentTimeEl = document.getElementById("currentTime")
        const progressFill = document.getElementById("progressFill")

        const minutes = Math.floor(this.currentTime / 60)
        const seconds = this.currentTime % 60
        currentTimeEl.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`

        const progress = (this.currentTime / this.totalTime) * 100
        progressFill.style.width = `${progress}%`
    }

    animateAudioBars(bars) {
        bars.forEach((bar, index) => {
            const baseHeight = 15 + Math.random() * 20
            const maxHeight = 80 + Math.random() * 40
            const animationDuration = 0.8 + Math.random() * 0.8

            bar.style.setProperty("--base-height", `${baseHeight}px`)
            bar.style.setProperty("--max-height", `${maxHeight}px`)
            bar.style.animationDuration = `${animationDuration}s`
        })
    }

    enhanceAudioVisualization() {
        const audioBars = document.querySelectorAll(".audio-bar")

        if (this.isPlaying) {
            audioBars.forEach((bar, index) => {
                const intensity = Math.random() * 0.5 + 0.5
                bar.style.animationDuration = `${0.5 + Math.random() * 0.5}s`
                bar.style.transform = `scaleY(${intensity})`
            })

            setTimeout(() => {
                if (this.isPlaying) {
                    this.enhanceAudioVisualization()
                }
            }, 200)
        } else {
            audioBars.forEach((bar) => {
                bar.style.transform = "scaleY(1)"
            })
        }
    }

    setupScrollAnimations() {
        // Throttle scroll events
        let ticking = false

        const observer = new IntersectionObserver(
            (entries) => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                                entry.target.classList.add("animate")

                                // Lighter timeline effects
                                if (entry.target.classList.contains("timeline-item")) {
                                    this.createTimelineEffect(entry.target)
                                }
                            }
                        })
                        ticking = false
                    })
                    ticking = true
                }
            },
            {
                threshold: 0.1,
                rootMargin: "0px 0px -30px 0px",
            },
        )

        document.querySelectorAll(".timeline-item").forEach((item) => {
            observer.observe(item)
        })

        // Optimize photo frame animations
        document.querySelectorAll(".photo-frame").forEach((frame, index) => {
            frame.style.animationDelay = `${index * 0.1}s`
            observer.observe(frame)
        })
    }

    createTimelineEffect(element) {
        const icon = element.querySelector(".timeline-icon")
        if (icon) {
            // Create ripple effect
            const ripple = document.createElement("div")
            ripple.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border: 2px solid #ffd700;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: rippleEffect 2s ease-out;
        `
            icon.appendChild(ripple)
            setTimeout(() => ripple.remove(), 2000)
        }
    }

    setupInteractiveElements() {
        // Hero button
        document.getElementById("beginJourney").addEventListener("click", () => {
            document.querySelector(".static-gallery").scrollIntoView({
                behavior: "smooth",
            })
            this.createMagicalTransition()
        })

        // Photo frame interactions
        document.querySelectorAll(".photo-frame").forEach((frame) => {
            frame.addEventListener("click", () => {
                this.createPhotoClickEffect(frame)
            })
        })

        // Holographic card
        const holoCard = document.querySelector(".holographic-card")
        holoCard.addEventListener("mouseenter", () => {
            this.createHolographicEffect(holoCard)
        })
    }

    createMagicalTransition() {
        // Create magical particles
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement("div")
            particle.innerHTML = ["✨", "💫", "⭐", "🌟", "🎵", "🎶"][Math.floor(Math.random() * 6)]
            particle.style.position = "fixed"
            particle.style.left = Math.random() * window.innerWidth + "px"
            particle.style.top = window.innerHeight + "px"
            particle.style.fontSize = "20px"
            particle.style.pointerEvents = "none"
            particle.style.zIndex = "9999"
            particle.style.animation = `magicalFloat ${3 + Math.random() * 2}s ease-out forwards`

            document.body.appendChild(particle)
            setTimeout(() => particle.remove(), 5000)
        }
    }

    createPhotoClickEffect(frame) {
        const rect = frame.getBoundingClientRect()

        // Create heart burst
        for (let i = 0; i < 8; i++) {
            const heart = document.createElement("div")
            heart.innerHTML = "💖"
            heart.style.position = "fixed"
            heart.style.left = rect.left + rect.width / 2 + "px"
            heart.style.top = rect.top + rect.height / 2 + "px"
            heart.style.fontSize = "20px"
            heart.style.pointerEvents = "none"
            heart.style.zIndex = "9999"

            const angle = (Math.PI * 2 * i) / 8
            const distance = 80 + Math.random() * 40
            const endX = Math.cos(angle) * distance
            const endY = Math.sin(angle) * distance

            heart.style.setProperty("--endX", endX + "px")
            heart.style.setProperty("--endY", endY + "px")
            heart.style.animation = "heartBurst 1.5s ease-out forwards"

            document.body.appendChild(heart)
            setTimeout(() => heart.remove(), 1500)
        }
    }

    createHolographicEffect(element) {
        const rect = element.getBoundingClientRect()

        for (let i = 0; i < 8; i++) {
            const beam = document.createElement("div")
            beam.style.cssText = `
          position: fixed;
          left: ${rect.left + Math.random() * rect.width}px;
          top: ${rect.top + Math.random() * rect.height}px;
          width: 2px;
          height: 40px;
          background: linear-gradient(to bottom, #4ecdc4, transparent);
          animation: holoBeam 1s ease-out forwards;
          pointer-events: none;
          z-index: 9999;
        `
            document.body.appendChild(beam)
            setTimeout(() => beam.remove(), 1000)
        }
    }

    createFloatingHearts() {
        const heartsContainer = document.getElementById("floatingHearts")

        // Reduce frequency significantly on mobile and limit number of hearts
        const interval = this.isMobile ? 8000 : 4000 // Longer interval on mobile
        const maxHearts = this.isMobile ? 3 : 8 // Fewer hearts on mobile

        setInterval(() => {
            const existingHearts = heartsContainer.children.length
            if (existingHearts < maxHearts) {
                const heart = document.createElement("div")
                heart.className = "floating-heart"
                heart.innerHTML = ["💖", "💕", "💗", "💝", "❤️"][Math.floor(Math.random() * 5)]
                heart.style.left = Math.random() * 100 + "%"
                heart.style.animationDuration = Math.random() * 2 + (this.isMobile ? 8 : 6) + "s"
                heart.style.animationDelay = Math.random() * 1 + "s"

                heartsContainer.appendChild(heart)

                setTimeout(
                    () => {
                        if (heart.parentNode) {
                            heart.remove()
                        }
                    },
                    this.isMobile ? 10000 : 8000,
                )
            }
        }, interval)
    }

    addSparkleEffect(element) {
        const rect = element.getBoundingClientRect()

        for (let i = 0; i < 12; i++) {
            const sparkle = document.createElement("div")
            sparkle.innerHTML = "✨"
            sparkle.style.position = "fixed"
            sparkle.style.left = rect.left + Math.random() * rect.width + "px"
            sparkle.style.top = rect.top + Math.random() * rect.height + "px"
            sparkle.style.fontSize = "16px"
            sparkle.style.pointerEvents = "none"
            sparkle.style.zIndex = "9999"
            sparkle.style.animation = "sparkleEffect 2s ease-out forwards"

            document.body.appendChild(sparkle)
            setTimeout(() => sparkle.remove(), 2000)
        }
    }

    startAnimationLoop() {
        let lastTime = 0
        const targetFPS = 30 // Reduce from 60fps to 30fps for better performance
        const frameInterval = 1000 / targetFPS

        const animate = (currentTime) => {
            if (currentTime - lastTime >= frameInterval) {
                this.updateParticles()
                this.drawParticles()
                lastTime = currentTime
            }
            requestAnimationFrame(animate)
        }
        animate(0)
    }

    setupTouchInteractions() {
        // Touch-friendly photo interactions
        document.querySelectorAll(".photo-frame").forEach((frame) => {
            let touchStartTime = 0

            frame.addEventListener("touchstart", (e) => {
                touchStartTime = Date.now()
                frame.classList.add("touch-active")
            })

            frame.addEventListener("touchend", (e) => {
                const touchDuration = Date.now() - touchStartTime
                if (touchDuration < 500) {
                    // Quick tap
                    this.createPhotoClickEffect(frame)
                }
                frame.classList.remove("touch-active")
            })
        })

        // Touch-friendly timeline interactions
        document.querySelectorAll(".timeline-item").forEach((item) => {
            item.addEventListener("touchstart", () => {
                item.classList.add("touch-highlight")
            })

            item.addEventListener("touchend", () => {
                setTimeout(() => {
                    item.classList.remove("touch-highlight")
                }, 300)
            })
        })

        // Prevent zoom on double tap for specific elements
        document.querySelectorAll(".hero-cta, .play-btn, .photo-frame").forEach((element) => {
            element.addEventListener("touchend", (e) => {
                e.preventDefault()
            })
        })
    }
}

// Add additional CSS animations
const additionalStyles = `
      @keyframes heartBurst {
          0% {
              transform: translate(0, 0) scale(1);
              opacity: 1;
          }
          100% {
              transform: translate(var(--endX), var(--endY)) scale(0);
              opacity: 0;
          }
      }
  
      @keyframes rippleEffect {
          0% {
              width: 0;
              height: 0;
              opacity: 1;
          }
          100% {
              width: 160px;
              height: 160px;
              opacity: 0;
          }
      }
  
      @keyframes magicalFloat {
          0% {
              transform: translateY(0) rotate(0deg);
              opacity: 0;
          }
          20% {
              opacity: 1;
          }
          80% {
              opacity: 1;
          }
          100% {
              transform: translateY(-100vh) rotate(360deg);
              opacity: 0;
          }
      }
  
      @keyframes holoBeam {
          0% {
              opacity: 0;
              transform: translateY(0) scaleY(0);
          }
          50% {
              opacity: 1;
              transform: translateY(-20px) scaleY(1);
          }
          100% {
              opacity: 0;
              transform: translateY(-40px) scaleY(0);
          }
      }
  
      @keyframes sparkleEffect {
          0% {
              transform: scale(0) rotate(0deg);
              opacity: 1;
          }
          100% {
              transform: scale(1) rotate(180deg);
              opacity: 0;
          }
      }
  `

const styleSheet = document.createElement("style")
styleSheet.textContent = additionalStyles
document.head.appendChild(styleSheet)

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new CinematicFathersDayExperience()
})
  