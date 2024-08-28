import { getBreakpoint } from '../../common/index.mjs'
import { ElementError } from '../../errors/index.mjs'
import { GOVUKFrontendComponent } from '../../govuk-frontend-component.mjs'

/**
 * Header component
 *
 * @preserve
 */
export class Header extends GOVUKFrontendComponent {
  /** @private */
  $module

  /** @private */
  /** @type {HTMLElement | undefined} */
  $menuButton

  /** @private */
  /** @type {HTMLElement | undefined} */
  $menu

  /** @private */
  /** @type {HTMLElement | undefined} */
  $dropdownToggle

  /** @private */
  /** @type {HTMLElement | undefined} */
  $header

  /**
   * Save the opened/closed state for the nav in memory so that we can
   * accurately maintain state when the screen is changed from small to big and
   * back to small
   *
   * @private
   */
  menuIsOpen = false

  /**
   * A global const for storing a matchMedia instance which we'll use to detect
   * when a screen size change happens. We rely on it being null if the feature
   * isn't available to initially apply hidden attributes
   *
   * @private
   * @type {MediaQueryList | null}
   */
  mql = null

  /**
   * Apply a matchMedia for desktop which will trigger a state sync if the
   * browser viewport moves between states.
   *
   * @param {Element | null} $module - HTML element to use for header
   */
  constructor($module) {
    super()

    if (!$module) {
      throw new ElementError({
        componentName: 'Header',
        element: $module,
        identifier: 'Root element (`$module`)'
      })
    }

    this.$module = $module
    const $menuButton = $module.querySelector('.govuk-js-header-toggle')

    const header = document.querySelector('.govuk-header')
    if (header instanceof HTMLElement) {
      this.$header = header
    }

    // Headers don't necessarily have a navigation. When they don't, the menu
    // toggle won't be rendered by our macro (or may be omitted when writing
    // plain HTML)
    if (!$menuButton) {
      return this
    }

    const menuId = $menuButton.getAttribute('aria-controls')
    if (!menuId) {
      throw new ElementError({
        componentName: 'Header',
        identifier:
          'Navigation button (`<button class="govuk-js-header-toggle">`) attribute (`aria-controls`)'
      })
    }

    const websitesNavBody = $module.querySelector(
      '.idsk-secondary-navigation__body'
    )
    const websitesNavBtn = $module.querySelector(
      '.idsk-secondary-navigation__heading-button'
    )

    if (
      websitesNavBody instanceof HTMLElement &&
      websitesNavBtn instanceof HTMLElement
    ) {
      websitesNavBtn.addEventListener('click', () => {
        const menuIsOpen = !(websitesNavBtn.ariaExpanded === 'true')
        const iconClassList =
          websitesNavBtn.querySelector('.material-icons')?.classList
        if (menuIsOpen) {
          websitesNavBody.classList.remove('hidden')
          iconClassList?.add('rotate180')
          websitesNavBtn.ariaExpanded = 'true'
        } else {
          websitesNavBody.classList.add('hidden')
          iconClassList?.remove('rotate180')
          websitesNavBtn.ariaExpanded = 'false'
        }
      })
    }

    const menu = document.querySelector(`#${menuId}`)
    if (menu instanceof HTMLElement) {
      this.$menu = menu
    }
    if ($menuButton instanceof HTMLElement) {
      this.$menuButton = $menuButton
      this.$menuButton.addEventListener('click', () => {
        this.handleMenuButtonClick()
      })
    }

    this.setupResponsiveChecks()

    // Get dropdown menu and toggle. Then function for show or hide dropdown
    const dropdownToggle = $module.querySelector('.dropdown-toggle')
    if (dropdownToggle instanceof HTMLElement) {
      this.$dropdownToggle = dropdownToggle
      this.openCloseDropdownMenu()
    }
  }

  /**
   * Setup viewport resize check
   *
   * @private
   */
  setupResponsiveChecks() {
    const breakpoint = getBreakpoint('desktop')

    if (!breakpoint.value) {
      throw new ElementError({
        componentName: 'Header',
        identifier: `CSS custom property (\`${breakpoint.property}\`) on pseudo-class \`:root\``
      })
    }

    // Media query list for GOV.UK Frontend desktop breakpoint
    this.mql = window.matchMedia(`(min-width: ${breakpoint.value})`)

    // MediaQueryList.addEventListener isn't supported by Safari < 14 so we need
    // to be able to fall back to the deprecated MediaQueryList.addListener
    if ('addEventListener' in this.mql) {
      this.mql.addEventListener('change', () => this.checkMode())
    } else {
      // @ts-expect-error Property 'addListener' does not exist
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this.mql.addListener(() => this.checkMode())
    }

    this.checkMode()
  }

  /**
   * Sync menu state
   *
   * Uses the global variable menuIsOpen to correctly set the accessible and
   * visual states of the menu and the menu button.
   * Additionally will force the menu to be visible and the menu button to be
   * hidden if the matchMedia is triggered to desktop.
   *
   * @private
   */
  checkMode() {
    if (this.mql == null || !this.$header) {
      return
    }

    if (this.mql.matches) {
      // desktop mode
      this.$menu?.removeAttribute('hidden')
      this.$menuButton?.setAttribute('hidden', '')
      this.$header // hide logo
        .querySelector('.govuk-header__link--homepage')
        ?.removeAttribute('hidden')
      this.$header
        .querySelector('.idsk-searchbar__wrapper')
        ?.classList.remove('hide')
    } else {
      // mobile
      this.$menuButton?.removeAttribute('hidden')
      this.$menuButton?.setAttribute(
        'aria-expanded',
        this.menuIsOpen.toString()
      )

      /*
      if (!this.$menu) {
        return
      }
        */

      this.$menu?.removeAttribute('hidden')
      if (this.$menuButton) {
        this.$menuButton.textContent = this.menuIsOpen ? 'Zatvoriť' : 'Menu'
        this.createMaterialIcon('close', this.$menuButton)
      }

      if (this.menuIsOpen) {
        this.$menu?.removeAttribute('hidden')
        // this.$header.style.background = '#fafafa'
        this.$header // show actionPanel
          .querySelector('.govuk-header__actionPanel.mobile')
          ?.classList.remove('mobile-hidden')
        this.$header // hide hide logo
          .querySelector('.govuk-header__link--homepage')
          ?.setAttribute('hidden', '')
        console.log(this.$header.querySelector('.idsk-searchbar__wrapper'))
        this.$header
          .querySelector('.idsk-searchbar__wrapper')
          ?.classList.remove('hide')
      } else {
        this.$menu?.setAttribute('hidden', '')
        // this.$header.style.background = '#fff'
        this.$header // hide action panel
          .querySelector('.govuk-header__actionPanel.mobile')
          ?.classList.add('mobile-hidden')
        this.$header // show logo
          .querySelector('.govuk-header__link--homepage')
          ?.removeAttribute('hidden')
        this.$header
          .querySelector('.idsk-searchbar__wrapper')
          ?.classList.add('hide')
      }
    }
  }

  /**
   * Handle menu button click
   *
   * When the menu button is clicked, change the visibility of the menu and then
   * sync the accessibility state and menu button state
   *
   * @private
   */
  handleMenuButtonClick() {
    this.menuIsOpen = !this.menuIsOpen
    this.checkMode()
  }

  /**
   * Toggle dropdown menu
   */
  openCloseDropdownMenu() {
    if (!this.$dropdownToggle) {
      return
    }

    this.$dropdownToggle.addEventListener('click', (event) => {
      if (this.$dropdownToggle) {
        event.preventDefault()
        this.$dropdownToggle.classList.toggle('open')
      }
    })

    this.clickOutsideClose(this.$dropdownToggle, 'open')
  }

  /**
   * Create and add material icon to parent element
   *
   * @param {string} iconName - icon name for create
   * @param {HTMLElement} parentElem - element to which the icon will be added
   */
  createMaterialIcon(iconName, parentElem) {
    const spanIcon = document.createElement('span')
    spanIcon.className = 'material-icons'
    spanIcon.textContent = iconName.toString()
    spanIcon.ariaHidden = 'true'
    parentElem.appendChild(spanIcon)
  }

  /**
   * Function for click outside and close some elem
   *
   * @param {HTMLElement} openedElem - element which need to remove open className
   * @param {string} className - name of className to remove and close some opened element
   */
  clickOutsideClose(openedElem, className) {
    document.addEventListener('click', (event) => {
      if (event.target instanceof Node && !openedElem.contains(event.target)) {
        openedElem.classList.remove(className.toString())
      }
    })
  }

  /**
   * Name for the component used when initialising using data-module attributes.
   */
  static moduleName = 'govuk-header'
}
