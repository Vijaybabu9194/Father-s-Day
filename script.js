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
        this.hasUserInteracted = false // Add this line
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

        // Track user interaction for mobile autoplay
        if (this.isMobile) {
            const trackInteraction = () => {
                this.hasUserInteracted = true
                document.removeEventListener("touchstart", trackInteraction)
                document.removeEventListener("click", trackInteraction)
            }

            document.addEventListener("touchstart", trackInteraction, { once: true, passive: true })
            document.addEventListener("click", trackInteraction, { once: true })
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

        // On mobile, show everything immediately without animations
        if (this.isMobile) {
            const heroTitle = document.querySelector(".hero-title")
            const heroSubtitle = document.querySelector(".hero-subtitle")
            const heroButton = document.querySelector(".hero-cta")

            // Make sure all elements are visible immediately
            if (heroTitle) {
                heroTitle.style.opacity = "1"
                heroTitle.style.animation = "none"
            }
            if (heroSubtitle) {
                heroSubtitle.style.opacity = "1"
                heroSubtitle.style.animation = "none"
            }
            if (heroButton) {
                heroButton.style.opacity = "1"
                heroButton.style.animation = "none"
            }
        } else {
            this.typewriterEffect()
        }
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
            color: `hsl(${Math.random() * 60 + 30}, 70%, 60%)`,
        }
    }

    updateParticles() {
        this.particles.forEach((particle) => {
            particle.x += particle.vx
            particle.y += particle.vy

            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1

            // Mouse interaction
            const dx = this.mouseX - particle.x
            const dy = this.mouseY - particle.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 100) {
                particle.x -= dx * 0.01
                particle.y -= dy * 0.01
            }
        })
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        this.particles.forEach((particle) => {
            this.ctx.beginPath()
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
            this.ctx.fillStyle = particle.color
            this.ctx.globalAlpha = particle.opacity
            this.ctx.fill()
        })

        this.ctx.globalAlpha = 1
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px",
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("animate")
                }
            })
        }, observerOptions)

        // Observe timeline items
        document.querySelectorAll(".timeline-item").forEach((item) => {
            observer.observe(item)
        })
    }

    setupInteractiveElements() {
        // Begin Journey button
        const beginButton = document.getElementById("beginJourney")
        if (beginButton) {
            beginButton.addEventListener("click", () => {
                document.querySelector(".static-gallery").scrollIntoView({
                    behavior: "smooth",
                })
            })
        }

        // Photo frame interactions - COMPLETELY FIXED FOR MOBILE
        document.querySelectorAll(".photo-frame").forEach((frame) => {
            if (this.isTouch) {
                // Mobile/Touch device handling
                frame.addEventListener("click", (e) => {
                    e.preventDefault()
                    e.stopPropagation()

                    // Check if this frame is currently active
                    const isActive = frame.classList.contains("mobile-active")

                    // Remove active class from all frames
                    document.querySelectorAll(".photo-frame").forEach((otherFrame) => {
                        otherFrame.classList.remove("mobile-active")
                    })

                    // If this frame wasn't active, make it active
                    if (!isActive) {
                        frame.classList.add("mobile-active")

                        // Auto-hide after 6 seconds
                        setTimeout(() => {
                            frame.classList.remove("mobile-active")
                        }, 6000)
                    }
                })

                // Prevent context menu on long press
                frame.addEventListener("contextmenu", (e) => {
                    e.preventDefault()
                })
            } else {
                // Desktop hover behavior (unchanged)
                frame.addEventListener("mouseenter", () => {
                    // Desktop hover effects handled by CSS
                })
            }
        })

        // Close overlays when tapping outside on mobile
        if (this.isTouch) {
            document.addEventListener("click", (e) => {
                if (!e.target.closest(".photo-frame")) {
                    document.querySelectorAll(".photo-frame").forEach((frame) => {
                        frame.classList.remove("mobile-active")
                    })
                }
            })
        }
    }

    setupTouchInteractions() {
        // Prevent zoom on double tap for better UX
        let lastTouchEnd = 0
        document.addEventListener(
            "touchend",
            (event) => {
                const now = new Date().getTime()
                if (now - lastTouchEnd <= 300) {
                    event.preventDefault()
                }
                lastTouchEnd = now
            },
            false,
        )

        // Smooth scrolling for mobile
        document.addEventListener(
            "touchmove",
            (e) => {
                // Allow normal scrolling but prevent horizontal scroll
                if (
                    Math.abs(e.touches[0].clientX - e.touches[0].clientY) > Math.abs(e.touches[0].clientY - e.touches[0].clientX)
                ) {
                    e.preventDefault()
                }
            },
            { passive: false },
        )
    }

    setupAudioPlayer() {
        this.audio = document.getElementById("realAudio")
        this.playBtn = document.getElementById("playBtn")
        this.volumeSlider = document.getElementById("volumeSlider")
        this.progressFill = document.getElementById("progressFill")
        this.progressBar = document.getElementById("progressBar")
        this.currentTimeEl = document.getElementById("currentTime")
        this.totalTimeEl = document.getElementById("totalTime")

        // Set initial volume
        if (this.audio) {
            this.audio.volume = 0.7
        }

        // Play button event
        if (this.playBtn) {
            this.playBtn.addEventListener("click", () => {
                this.enableAutoplayAfterInteraction()
                this.toggleAudio()
            })
        }

        // Volume control
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener("input", (e) => {
                if (this.audio) {
                    this.audio.volume = e.target.value / 100
                }
            })
        }

        // Progress bar click
        if (this.progressBar) {
            this.progressBar.addEventListener("click", (e) => {
                if (this.audio && this.audio.duration) {
                    const rect = this.progressBar.getBoundingClientRect()
                    const clickX = e.clientX - rect.left
                    const width = rect.width
                    const clickTime = (clickX / width) * this.audio.duration
                    this.audio.currentTime = clickTime
                }
            })
        }

        // Audio event listeners
        if (this.audio) {
            this.audio.addEventListener("loadedmetadata", () => {
                this.updateTotalTime()
            })

            this.audio.addEventListener("timeupdate", () => {
                this.updateProgress()
            })

            this.audio.addEventListener("ended", () => {
                this.resetAudioPlayer()
            })

            this.audio.addEventListener("play", () => {
                this.animateAudioBars()
            })

            this.audio.addEventListener("pause", () => {
                this.stopAudioBars()
            })
        }

        // Setup intersection observer for autoplay
        this.setupAudioAutoplay()
    }

    setupAudioAutoplay() {
        const audioSection = document.getElementById("audioSection")

        if (!audioSection || !this.audio) return

        // Create a more robust intersection observer
        const observerOptions = {
            root: null,
            rootMargin: "0px",
            threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
        }

        let isAudioSectionVisible = false
        let autoplayAttempted = false

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const wasVisible = isAudioSectionVisible
                isAudioSectionVisible = entry.isIntersecting && entry.intersectionRatio > 0.25

                // Audio section became visible
                if (isAudioSectionVisible && !wasVisible) {
                    console.log("Audio section entered - attempting autoplay")
                    setTimeout(() => {
                        this.attemptAutoplay()
                    }, 300)
                }

                // Audio section became invisible
                if (!isAudioSectionVisible && wasVisible && this.isPlaying) {
                    console.log("Audio section left - stopping audio")
                    this.pauseAudio()
                    autoplayAttempted = false
                }
            })
        }, observerOptions)

        observer.observe(audioSection)

        // Additional scroll-based fallback for mobile
        let scrollTimeout
        let lastScrollTime = 0

        const checkVisibilityOnScroll = () => {
            const now = Date.now()
            if (now - lastScrollTime < 100) return // Throttle
            lastScrollTime = now

            const rect = audioSection.getBoundingClientRect()
            const windowHeight = window.innerHeight

            // Calculate visibility percentage
            const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0)
            const sectionHeight = rect.height
            const visibilityRatio = Math.max(0, visibleHeight / sectionHeight)

            const wasVisible = isAudioSectionVisible
            isAudioSectionVisible = visibilityRatio > 0.25

            // Section became visible
            if (isAudioSectionVisible && !wasVisible) {
                console.log("Scroll detected: Audio section visible")
                clearTimeout(scrollTimeout)
                scrollTimeout = setTimeout(() => {
                    this.attemptAutoplay()
                }, 200)
            }

            // Section became invisible
            if (!isAudioSectionVisible && wasVisible && this.isPlaying) {
                console.log("Scroll detected: Audio section hidden")
                this.pauseAudio()
            }
        }

        // Add scroll listener with throttling
        window.addEventListener("scroll", checkVisibilityOnScroll, { passive: true })

        // Add touch event listeners for mobile
        if (this.isMobile) {
            window.addEventListener(
                "touchend",
                () => {
                    setTimeout(checkVisibilityOnScroll, 100)
                },
                { passive: true },
            )
        }
    }

    async attemptAutoplay() {
        if (!this.audio || this.isPlaying) return

        try {
            // Reset audio to beginning if it ended
            if (this.audio.ended) {
                this.audio.currentTime = 0
            }

            console.log("Attempting to play audio...")
            await this.audio.play()
            this.isPlaying = true
            this.updatePlayButton()
            this.animateAudioBars()
            console.log("Audio started successfully")

            // Remove autoplay prompt styling
            if (this.playBtn) {
                this.playBtn.style.animation = "none"
                this.playBtn.style.boxShadow = "0 10px 30px rgba(255, 215, 0, 0.4)"
            }
        } catch (error) {
            console.log("Autoplay prevented:", error.message)
            this.showAutoplayPrompt()
        }
    }

    pauseAudio() {
        if (!this.audio || !this.isPlaying) return

        console.log("Pausing audio...")
        this.audio.pause()
        this.isPlaying = false
        this.updatePlayButton()
        this.stopAudioBars()
        console.log("Audio paused")
    }

    // Force enable autoplay after user interaction
    enableAutoplayAfterInteraction() {
        if (this.isMobile && !this.hasUserInteracted) {
            this.hasUserInteracted = true

            // Check if audio section is currently visible and try to play
            const audioSection = document.getElementById("audioSection")
            if (audioSection) {
                const rect = audioSection.getBoundingClientRect()
                const windowHeight = window.innerHeight
                const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0)
                const visibilityRatio = Math.max(0, visibleHeight / rect.height)

                if (visibilityRatio > 0.25 && !this.isPlaying) {
                    setTimeout(() => {
                        this.attemptAutoplay()
                    }, 100)
                }
            }
        }
    }

    toggleAudio() {
        if (!this.audio) return

        if (this.audio.paused) {
            this.audio.play()
            this.isPlaying = true
        } else {
            this.audio.pause()
            this.isPlaying = false
        }

        this.updatePlayButton()
    }

    updatePlayButton() {
        if (!this.playBtn) return

        const playIcon = this.playBtn.querySelector(".play-icon")
        const playText = this.playBtn.querySelector(".play-text")

        if (this.isPlaying) {
            playIcon.textContent = "⏸️"
            playText.textContent = "Pause Song"
            this.playBtn.style.animation = "none"
            this.playBtn.style.boxShadow = "0 10px 30px rgba(255, 215, 0, 0.4)"
        } else {
            playIcon.textContent = "▶️"
            playText.textContent = "Play Our Song"
        }
    }

    updateProgress() {
        if (!this.audio || !this.progressFill || !this.currentTimeEl) return

        const currentTime = this.audio.currentTime
        const duration = this.audio.duration

        if (duration) {
            const progressPercent = (currentTime / duration) * 100
            this.progressFill.style.width = `${progressPercent}%`
        }

        this.currentTimeEl.textContent = this.formatTime(currentTime)
    }

    updateTotalTime() {
        if (!this.audio || !this.totalTimeEl) return
        this.totalTimeEl.textContent = this.formatTime(this.audio.duration)
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return "0:00"

        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = Math.floor(seconds % 60)
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
    }

    resetAudioPlayer() {
        this.isPlaying = false
        this.updatePlayButton()
        this.stopAudioBars()
    }

    animateAudioBars() {
        const bars = document.querySelectorAll(".audio-bar")
        bars.forEach((bar) => {
            bar.style.animationPlayState = "running"
        })
    }

    stopAudioBars() {
        const bars = document.querySelectorAll(".audio-bar")
        bars.forEach((bar) => {
            bar.style.animationPlayState = "paused"
        })
    }

    createFloatingHearts() {
        const heartsContainer = document.getElementById("floatingHearts")
        const heartEmojis = ["💖", "💕", "💗", "💝", "❤️", "🧡", "💛", "💚", "💙", "💜"]

        // Reduce frequency on mobile
        const heartInterval = this.isMobile ? 8000 : 4000

        setInterval(() => {
            if (heartsContainer) {
                const heart = document.createElement("div")
                heart.className = "floating-heart"
                heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)]
                heart.style.left = Math.random() * 100 + "%"
                heart.style.animationDuration = Math.random() * 6 + 8 + "s"
                heart.style.fontSize = Math.random() * 1.5 + 1 + "rem"

                heartsContainer.appendChild(heart)

                // Remove heart after animation
                setTimeout(() => {
                    if (heart.parentNode) {
                        heart.parentNode.removeChild(heart)
                    }
                }, 12000)
            }
        }, heartInterval)
    }

    addSparkleEffect(element) {
        // Add sparkle animation to element
        element.style.textShadow = "0 0 20px #ffd700, 0 0 40px #ffd700, 0 0 60px #ffd700"

        setTimeout(() => {
            element.style.textShadow = "0 0 50px rgba(255, 215, 0, 0.5)"
        }, 2000)
    }

    startAnimationLoop() {
        const animate = () => {
            if (!this.isMobile) {
                this.updateParticles()
                this.drawParticles()
            }
            requestAnimationFrame(animate)
        }
        animate()
    }
}

// Initialize the experience when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new CinematicFathersDayExperience()
})
  