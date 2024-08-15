import { ElementError } from '../../errors/index.mjs'
import { GOVUKFrontendComponent } from '../../govuk-frontend-component.mjs'

/**
 * JavaScript enhancements for the Dropdown component
 *
 * @preserve
 */
export class Dropdown extends GOVUKFrontendComponent {
  /** @private */
  $module

  /** @private */
  button

  /** @private */
  options

  /** @private */
  isOpen = false

  /**
   * Name for the component used when initialising using data-module attributes.
   */
  static moduleName = 'govuk-dropdown'

  /**
   * @param {Element | null} $module - HTML element to use for dropdown
   */
  constructor($module) {
    super()

    if (!($module instanceof HTMLElement)) {
      throw new ElementError({
        componentName: 'Dropdown',
        element: $module,
        identifier: 'Root element (`$module`)'
      })
    }

    this.$module = $module
    const buttonElement = this.$module.querySelector('.idsk-dropdown')
    const optionsElement = this.$module.querySelector('.idsk-dropdown__options')
    this.button = buttonElement
    this.options = optionsElement

    if (!buttonElement) {
      throw new ElementError({
        componentName: 'Dropdown button',
        element: buttonElement,
        identifier: 'Button dropdown trigger'
      })
    }

    if (!optionsElement) {
      throw new ElementError({
        componentName: 'Dropdown options',
        element: optionsElement,
        identifier: 'Dropdown options block'
      })
    }

    this.button?.addEventListener('click', () => this.handleClick())
    document.addEventListener('click', (event) => {
      if (
        event.target instanceof Node &&
        !this.$module.contains(event.target) &&
        this.isOpen
      ) {
        this.handleClick()
      }
    })
  }

  /**
   * Trigger a click event
   *
   * @private
   */
  handleClick() {
    if (!this.button) {
      return
    }

    this.isOpen = !this.isOpen
    const label = this.$module.dataset.pseudolabel ?? ''

    if (this.isOpen) {
      this.$module.classList.add('open')
      this.button
        .querySelector('svg')
        ?.classList.add('idsk-dropdown__icon--opened')
      this.button.ariaLabel = `Zavrieť ${label}`
      this.options?.classList.add('idsk-dropdown--opened')
      // this.$module.querySelector('.material-icons')?.classList.add('rotate180')
    } else {
      this.$module.classList.remove('open')
      this.button
        .querySelector('svg')
        ?.classList.remove('idsk-dropdown__icon--opened')
      this.button.ariaLabel = `Rozbaliť ${label}`
      this.options?.classList.remove('idsk-dropdown--opened')
    }

    this.button.ariaExpanded = this.isOpen.toString()
  }
}
