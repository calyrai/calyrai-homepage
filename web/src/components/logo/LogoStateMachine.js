export default class LogoStateMachine {
  constructor(config, onTransition) {
    this.config = config
    this.onTransition = onTransition
    const initialState = config?.interaction?.initialState
    const allowedInitialStates = new Set(['idle', 'active', 'qr_build', 'qr_show', 'dissolve', 'entropy', 'reassemble'])
    this.state = allowedInitialStates.has(initialState) ? initialState : 'idle'
    this.timers = new Set()
    this.destroyed = false
    this.#emit(this.state)
    this.#scheduleByState(this.state)
  }

  getState() {
    return this.state
  }

  handleHoverEnter() {
    if (this.state === 'entropy') {
      this.transitionTo('reassemble')
      return
    }
    if (this.state === 'idle') {
      this.transitionTo('active')
    }
  }

  triggerQrBuild() {
    if (this.state === 'idle' || this.state === 'active' || this.state === 'reassemble') {
      this.transitionTo('qr_build')
    }
  }

  handleHoverLeave() {
    if (this.state === 'active') {
      this.transitionTo('idle')
    }
  }

  handleClick() {
    this.triggerQrBuild()
  }

  handlePointerReturn() {
    if (this.state === 'entropy') {
      this.transitionTo('reassemble')
    }
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

  // Maps each state to its auto-transition: [nextState, configDurationKey, fallbackMs]
  static #SCHEDULE = [
    ['qr_build',   'qr_show',    'qr_build',   2600],
    ['qr_show',    'dissolve',   'qr_show',    12000],
    ['dissolve',   'reassemble', 'dissolve',   3200],
    // Keep QR as the home state: every cycle reforms into QR again.
    ['reassemble', 'qr_build',   'reassemble', 3600],
  ]

  #scheduleByState(state) {
    const states = this.config?.states || {}
    const interaction = this.config?.interaction || {}

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

    if (state === 'idle' || state === 'active') {
      this.#setTimer(interaction.idleTimeoutToEntropyMs || 80000, () => this.transitionTo('entropy'))
    }
  }
}