/* eslint-disable */

import { toggleClass } from '../../common.mjs'

/**
 * Header for extended websites
 */
function IdskHeaderExtended ($module) {
  this.$module = $module
  this.$lastMenuElement = ''
  this.$firstMenuElement = ''
}

/**
 * HeaderExtended init function
 */
IdskHeaderExtended.prototype.init = function () {
  var $module = this.$module
  // check for module
  if (!$module) {
    return
  }

  // check for search component
  var $searchComponents = $module.querySelectorAll(
    '.idsk-header-extended__search'
  )
  if ($searchComponents) {
    $searchComponents.forEach(
      function ($searchComponent) {
        $searchComponent.addEventListener(
          'change',
          this.handleSearchChange.bind(this)
        )
        // trigger change event
        $searchComponent.dispatchEvent(new Event('change'))
      }.bind(this)
    )
  }

  // check for language switcher
  var $toggleLanguageSwitchers = $module.querySelectorAll(
    '.idsk-header-extended__language-button'
  )
  if ($toggleLanguageSwitchers) {
    // Handle $toggleLanguageSwitcher click events
    $toggleLanguageSwitchers.forEach(
      function ($toggleLanguageSwitcher) {
        $toggleLanguageSwitcher.addEventListener(
          'click',
          this.handleLanguageSwitcherClick.bind(this)
        )
        $toggleLanguageSwitcher.addEventListener(
          'focus',
          this.handleLanguageSwitcherClick.bind(this)
        )
      }.bind(this)
    )

    // close language list if i left the last item from langauge list e.g. if user use tab key for navigations
    var $lastLanguageItems = $module.querySelectorAll(
      '.idsk-header-extended__language-list-item:last-child .idsk-header-extended__language-list-link'
    )
    $lastLanguageItems.forEach(
      function ($lastLanguageItem) {
        $lastLanguageItem.addEventListener(
          'blur',
          this.checkBlurLanguageSwitcherClick.bind(this)
        )
      }.bind(this)
    )
  }

  // check for menu items
  var $menuItems = $module.querySelectorAll('.idsk-header-extended__link')
  if ($menuItems) {
    // Handle $menuItem click events
    $menuItems.forEach(
      function ($menuItem) {
        $menuItem.addEventListener('click', this.handleSubmenuClick.bind(this))
        $menuItem.addEventListener('focus', this.handleSubmenuClick.bind(this))
      }.bind(this)
    )
  }

  // check for menu button and close menu button
  var $hamburgerMenuButton = $module.querySelector(
    '.idsk-js-header-extended-side-menu'
  )
  var $closeMenuButton = $module.querySelector(
    '.idsk-header-extended__mobile-close'
  )
  if ($hamburgerMenuButton && $closeMenuButton) {
    this.initMobileMenuTabbing()
    $hamburgerMenuButton.addEventListener(
      'click',
      this.showMobileMenu.bind(this)
    )
    $closeMenuButton.addEventListener('click', this.hideMobileMenu.bind(this))
  }

  window.addEventListener('scroll', this.scrollFunction.bind(this))

  $module.boundCheckBlurMenuItemClick = this.checkBlurMenuItemClick.bind(this)
  $module.boundCheckBlurLanguageSwitcherClick =
    this.checkBlurLanguageSwitcherClick.bind(this)

  // check for cookies

  if (!window.localStorage.getItem('acceptedCookieBanner')) {
    $module.classList.add('idsk-header-extended--cookie')
    var $cookieBanner = document.querySelector('.idsk-cookie-banner')

    if ($cookieBanner) {
      // scroll handler
      window.addEventListener('scroll', function () {
        var headerPosition = document.body.getBoundingClientRect().top
        // @ts-ignore
        var cookieBannerHeight = $cookieBanner.offsetHeight
        if (headerPosition < -cookieBannerHeight) {
          $module.classList.remove('idsk-header-extended--cookie')
          $module.style.top = '0px'
        } else {
          $module.classList.add('idsk-header-extended--cookie')
          $module.style.top = cookieBannerHeight.toString() + 'px'
        }
      })

      // cookie resize handler
      var resizeObserver = new ResizeObserver(function () {
        // @ts-ignore
        $module.style.top = $cookieBanner.offsetHeight.toString() + 'px'
      })

      resizeObserver.observe($cookieBanner)
    }
  }
}

/**
 * Hide label if search input is not empty
 *
 * @param {object} e
 */
IdskHeaderExtended.prototype.handleSearchChange = function (e) {
  var $searchInput = e.target || e.srcElement
  var $search = $searchInput.closest('.idsk-header-extended__search')
  var $searchLabel = $search.querySelector('label')
  if ($searchInput.value) {
    $searchLabel.classList.add('idsk-header-extended__search-input--focus')
  } else {
    $searchLabel.classList.remove('idsk-header-extended__search-input--focus')
  }
}

/**
 * Handle open/hide language switcher
 *
 * @param {object} e
 */
IdskHeaderExtended.prototype.handleLanguageSwitcherClick = function (e) {
  var $toggleButton = e.target || e.srcElement
  // var $target = $toggleButton.closest('.idsk-header-extended__language');
  this.$activeSearch = $toggleButton.closest('.idsk-header-extended__language')
  toggleClass(this.$activeSearch, 'idsk-header-extended__language--active')
  document.addEventListener(
    'click',
    this.$module.boundCheckBlurLanguageSwitcherClick,
    true
  )
}

/**
 * handle click outside language switcher or "blur" the item link
 */
IdskHeaderExtended.prototype.checkBlurLanguageSwitcherClick = function () {
  // var $target = this.$module.querySelectorAll('.idsk-header-extended__language');
  this.$activeSearch.classList.remove('idsk-header-extended__language--active')
  document.removeEventListener(
    'click',
    this.$module.boundCheckBlurLanguageSwitcherClick,
    true
  )
}

/**
 * Handle open/hide submenu
 *
 * @param {object} e
 */
IdskHeaderExtended.prototype.handleSubmenuClick = function (e) {
  var $srcEl = e.target || e.srcElement
  var $toggleButton = $srcEl.closest('.idsk-header-extended__navigation-item')
  var $currActiveList = this.$module.querySelectorAll(
    '.idsk-header-extended__navigation-item--active'
  )

  if ($currActiveList.length > 0) {
    $currActiveList[0].classList.remove(
      'idsk-header-extended__navigation-item--active'
    )
  }
  toggleClass($toggleButton, 'idsk-header-extended__navigation-item--active')

  document.addEventListener(
    'click',
    this.$module.boundCheckBlurMenuItemClick,
    true
  )
}

/**
 * handle click outside menu or "blur" the item link
 */
IdskHeaderExtended.prototype.checkBlurMenuItemClick = function () {
  var $currActiveList = this.$module.querySelectorAll(
    '.idsk-header-extended__navigation-item--active'
  )
  $currActiveList[0].classList.remove(
    'idsk-header-extended__navigation-item--active'
  )
  document.removeEventListener(
    'click',
    this.$module.boundCheckBlurMenuItemClick,
    true
  )
}

/**
 * Show mobile menu
 *
 * @param {object} e
 */
IdskHeaderExtended.prototype.showMobileMenu = function (e) {
  var $hamburgerMenuButton = this.$module.querySelector(
    '.idsk-js-header-extended-side-menu'
  )

  this.$module.classList.add('idsk-header-extended--show-mobile-menu')
  document.getElementsByTagName('body')[0].style.overflow = 'hidden'
  if (document.activeElement === $hamburgerMenuButton) {
    // @ts-ignore
    this.$lastMenuElement.focus()
  }
}
/**
 * Hide mobile menu
 *
 * @param {object} e
 */
IdskHeaderExtended.prototype.hideMobileMenu = function (e) {
  var $hamburgerMenuButton = this.$module.querySelector(
    '.idsk-js-header-extended-side-menu'
  )

  this.$module.classList.remove('idsk-header-extended--show-mobile-menu')
  document.getElementsByTagName('body')[0].style.overflow = 'visible'
  $hamburgerMenuButton.focus()
}

/**
 * Create loop in mobile menu for tabbing elements
 */
IdskHeaderExtended.prototype.initMobileMenuTabbing = function () {
  // Get header extended mobile menu focusable elements
  var $headerExtended = this.$module.querySelectorAll(
    '.idsk-header-extended__mobile'
  )[0]
  var $mobileMenuElements = $headerExtended.querySelectorAll(
    'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])'
  )
  this.$firstMenuElement = $mobileMenuElements[0]
  this.$lastMenuElement = $mobileMenuElements[$mobileMenuElements.length - 1]
  var KEYCODE_TAB = 9

  document.addEventListener(
    'keydown',
    function (e) {
      var isTabPressed = e.key === 'Tab' || e.keyCode === KEYCODE_TAB

      if (!isTabPressed) {
        return
      }

      if (e.shiftKey) {
        // shift + tab
        if (document.activeElement === this.$firstMenuElement) {
          this.$lastMenuElement.focus()
          e.preventDefault()
        }
      } else if (document.activeElement === this.$lastMenuElement) {
        // tab
        this.$firstMenuElement.focus()
        e.preventDefault()
      }
    }.bind(this)
  )
}

/**
 * When the user scrolls down from the top of the document, resize the navbar's padding and the logo
 */
IdskHeaderExtended.prototype.scrollFunction = function () {
  var $module = this.$module

  if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
    $module.classList.add('idsk-header-extended--shrink')
  } else if (
    document.body.scrollTop < 10 &&
    document.documentElement.scrollTop < 10
  ) {
    $module.classList.remove('idsk-header-extended--shrink')
  }
}

export default IdskHeaderExtended
