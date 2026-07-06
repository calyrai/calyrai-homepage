export default class LogoStateMachine {
  constructor(config, onTransition) {
    this.config = config
    this.onTransition = onTransition
    const initialState = config?.interaction?.initialState
    const allowedInitialStates = new Set(['idle', 'active', 'braille', 'micro', 'qr_build', 'qr_show'])
    this.state = allowedInitialStates.has(initialState) ? initialState : 'idle'
    this.hasUserInteraction = false
    this.allowAutoCycleWithoutMouse = config?.interaction?.autoCycleWithoutMouse === true
    this.clickSequence = config?.interaction?.clickSequence || ['braille', 'micro', 'qr_build']
    this.clickCount = 0
    this.timers = new Set()
    this.destroyed = false
    this.#emit(this.state)
    this.#scheduleByState(this.state)
  }

  getState() {
    return this.state
  }

  handleHoverEnter() {
    this.#markUserInteraction()
    if (this.state === 'idle') {
      this.transitionTo('active')
    }
  }

  triggerQrBuild() {
    this.#markUserInteraction()
    if (this.state === 'idle' || this.state === 'active') {
      this.transitionTo('qr_build')
    }
  }

  handleHoverLeave() {
    this.#markUserInteraction()
    if (this.state === 'active') {
      this.transitionTo('idle')
    }
  }

  handleClick() {
    this.#markUserInteraction()
    
    // Cycle through click sequence: braille → micro → qr_build → (repeat)
    const nextState = this.clickSequence[this.clickCount % this.clickSequence.length]
    this.clickCount++
    this.transitionTo(nextState)
  }

  handlePointerReturn() {
    this.#markUserInteraction()
  }

  transitionTo(nextState) {
    if (this.destroyed || this.state === nextState) {
      return
    }

    this.#clearTimers()
    this.state = nextState
    this.#emit(nextState)
    this.#scheduleByState(nextState)
  }

  resetClickSequence() {
    this.clickCount = 0
  }

  destroy() {
    this.destroyed = true
    this.#clearTimers()
  }

  #emit(nextState) {
    if (typeof this.onTransition === 'function') {
      this.onTransition(nextState)
    }
  }

  #setTimer(ms, fn) {
    if (!ms || ms <= 0) {
      return
    }
    const timer = setTimeout(() => {
      this.timers.delete(timer)
      fn()
    }, ms)
    this.timers.add(timer)
  }

  #clearTimers() {
    for (const timer of this.timers) {
      clearTimeout(timer)
    }
    this.timers.clear()
  }

  #markUserInteraction() {
    this.hasUserInteraction = true
  }

  // Maps each state to its auto-transition: [currentState, nextState, configDurationKey, fallbackMs]
  static #SCHEDULE = [
    ['qr_build',   'qr_show',    'qr_build',   2600],
    // Keep QR readable with sparkle for a while, then return to idle.
    ['qr_show',    'idle',       'qr_show',    12000],
  ]

  #scheduleByState(state) {
    const states = this.config?.states || {}
    const interaction = this.config?.interaction || {}

    const canAutoCycle = this.allowAutoCycleWithoutMouse || this.hasUserInteraction
    if (!canAutoCycle) {
      return
    }

    if (state === 'qr_show' && interaction.holdQrOnStart) {
      return
    }

    const entry = LogoStateMachine.#SCHEDULE.find(([from]) => from === state)
    if (entry) {
      const [, nextState, durationKey, fallback] = entry
      this.#setTimer(states[durationKey]?.durationMs || fallback, () => this.transitionTo(nextState))
      return
    }

    if (state === 'idle' && interaction.idleCycleToQrMs) {
      this.#setTimer(interaction.idleCycleToQrMs, () => this.transitionTo('qr_build'))
      return
    }

    // No entropy/reassemble cycle in simplified flow.
  }
}