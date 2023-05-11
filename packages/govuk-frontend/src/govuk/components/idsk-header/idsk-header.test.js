/* eslint-env jest */

const { goTo } = require('govuk-frontend-helpers/puppeteer')
const { devices } = require('puppeteer')
const iPhone = devices['iPhone 6']

beforeAll(async () => {
  await page.emulate(iPhone)
})

describe('/components/idsk-header', () => {
  describe('/components/idsk-header/with-navigation/preview', () => {
    describe('when JavaScript is unavailable or fails', () => {
      beforeAll(async () => {
        await page.setJavaScriptEnabled(false)
      })

      afterAll(async () => {
        await page.setJavaScriptEnabled(true)
      })

      it('falls back to making the navigation visible', async () => {
        await goTo(page,
          '/components/idsk-header/with-navigation/preview'
        )
        const isContentVisible = await page.waitForSelector(
          '.idsk-header__navigation',
          { visible: true, timeout: 5000 }
        )
        expect(isContentVisible).toBeTruthy()
      })
    })

    describe('when JavaScript is available', () => {
      describe('when menu button is pressed', () => {
        it('should indicate the open state of the toggle button', async () => {
          await goTo(page,
            '/components/idsk-header/with-navigation/preview'
          )

          await page.click('.govuk-js-header-toggle')

          const toggleButtonIsOpen = await page.evaluate(() =>
            document.body
              .querySelector('.idsk-header__menu-button')
              .classList.contains('idsk-header__menu-button--open')
          )
          expect(toggleButtonIsOpen).toBeTruthy()
        })

        it('should indicate the expanded state of the toggle button using aria-expanded', async () => {
          await goTo(page,
            '/components/idsk-header/with-navigation/preview'
          )

          await page.click('.govuk-js-header-toggle')

          const toggleButtonAriaExpanded = await page.evaluate(() =>
            document.body
              .querySelector('.idsk-header__menu-button')
              .getAttribute('aria-expanded')
          )
          expect(toggleButtonAriaExpanded).toBe('true')
        })

        it('should indicate the open state of the navigation', async () => {
          await goTo(page,
            '/components/idsk-header/with-navigation/preview'
          )

          await page.click('.govuk-js-header-toggle')

          const navigationIsOpen = await page.evaluate(() =>
            document.body
              .querySelector('.idsk-header__navigation')
              .classList.contains('idsk-header__navigation--open')
          )
          expect(navigationIsOpen).toBeTruthy()
        })

        it('should indicate the visible state of the navigation using aria-hidden', async () => {
          await goTo(page,
            '/components/idsk-header/with-navigation/preview'
          )

          await page.click('.govuk-js-header-toggle')

          const navigationAriaHidden = await page.evaluate(() =>
            document.body
              .querySelector('.idsk-header__navigation')
              .getAttribute('aria-hidden')
          )
          expect(navigationAriaHidden).toBe('false')
        })
      })

      describe('when menu button is pressed twice', () => {
        it('should indicate the open state of the toggle button', async () => {
          await goTo(page,
            '/components/idsk-header/with-navigation/preview'
          )

          await page.click('.govuk-js-header-toggle')
          await page.click('.govuk-js-header-toggle')

          const toggleButtonIsOpen = await page.evaluate(() =>
            document.body
              .querySelector('.idsk-header__menu-button')
              .classList.contains('idsk-header__menu-button--open')
          )
          expect(toggleButtonIsOpen).toBeFalsy()
        })

        it('should indicate the expanded state of the toggle button using aria-expanded', async () => {
          await goTo(page,
            '/components/idsk-header/with-navigation/preview'
          )

          await page.click('.govuk-js-header-toggle')
          await page.click('.govuk-js-header-toggle')

          const toggleButtonAriaExpanded = await page.evaluate(() =>
            document.body
              .querySelector('.idsk-header__menu-button')
              .getAttribute('aria-expanded')
          )
          expect(toggleButtonAriaExpanded).toBe('false')
        })

        it('should indicate the open state of the navigation', async () => {
          await goTo(page,
            '/components/idsk-header/with-navigation/preview'
          )

          await page.click('.govuk-js-header-toggle')
          await page.click('.govuk-js-header-toggle')

          const navigationIsOpen = await page.evaluate(() =>
            document.body
              .querySelector('.idsk-header__navigation')
              .classList.contains('idsk-header__navigation--open')
          )
          expect(navigationIsOpen).toBeFalsy()
        })

        it('should indicate the visible state of the navigation using aria-hidden', async () => {
          await goTo(page,
            '/components/idsk-header/with-navigation/preview'
          )

          await page.click('.govuk-js-header-toggle')
          await page.click('.govuk-js-header-toggle')

          const navigationAriaHidden = await page.evaluate(() =>
            document.body
              .querySelector('.idsk-header__navigation')
              .getAttribute('aria-hidden')
          )
          expect(navigationAriaHidden).toBe('true')
        })
      })
    })
  })
})
