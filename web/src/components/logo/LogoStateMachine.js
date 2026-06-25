export default class LogoStateMachine {
  constructor(config, onTransition) {
    this.config = config
    this.onTransition = onTransition
    this.state = 'idle'
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

  #scheduleByState(state) {
    const states = this.config?.states || {}
    const interaction = this.config?.interaction || {}

    if (state === 'qr_build') {
      this.#setTimer(states.qr_build?.durationMs || 1400, () => this.transitionTo('qr_show'))
      return
    }

    if (state === 'qr_show') {
      this.#setTimer(states.qr_show?.durationMs || 10000, () => this.transitionTo('dissolve'))
      return
    }

    if (state === 'dissolve') {
      this.#setTimer(states.dissolve?.durationMs || 2200, () => this.transitionTo('reassemble'))
      return
    }

    if (state === 'reassemble') {
      this.#setTimer(states.reassemble?.durationMs || 2600, () => this.transitionTo('idle'))
      return
    }

    if (state === 'idle' || state === 'active') {
      this.#setTimer(interaction.idleTimeoutToEntropyMs || 80000, () => this.transitionTo('entropy'))
    }
  }
}