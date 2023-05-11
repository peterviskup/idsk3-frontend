const { render } = require('govuk-frontend-helpers/nunjucks')
const { getExamples } = require('govuk-frontend-lib/files')

describe('idsk-header', () => {
  let examples

  beforeAll(async () => {
    examples = await getExamples('idsk-header')
  })

  describe('custom options', () => {
    it('renders custom navigation classes', () => {
      const $ = render('idsk-header', examples['full width with navigation'])

      const $component = $('.idsk-header')
      const $container = $component.find('.idsk-header__navigation')

      expect($container.hasClass('govuk-header__navigation--end')).toBeTruthy()
    })

    it('renders home page URL', () => {
      const $ = render('idsk-header', examples['custom homepage url'])

      const $component = $('.idsk-header')
      const $homepageLink = $component.find('.idsk-header__link--homepage')
      expect($homepageLink.attr('href')).toEqual('/')
    })
  })

  describe('with product name', () => {
    it('renders product name', () => {
      const $ = render('idsk-header', examples['with product name'])

      const $component = $('.idsk-header')
      const $productName = $component.find('.idsk-header__product-name')
      expect($productName.text().trim()).toEqual('Product Name')
    })
  })

  describe('with service name', () => {
    it('renders service name', () => {
      const $ = render('idsk-header', examples['with service name'])

      const $component = $('.idsk-header')
      const $serviceName = $component.find('.idsk-header__link--service-name')
      expect($serviceName.text().trim()).toEqual('Service Name')
    })

    it('wraps the service name with a link when a url is provided', () => {
      const $ = render('idsk-header', examples['with service name'])

      const $component = $('.idsk-header')
      const $serviceName = $component.find('.idsk-header__link--service-name')
      expect($serviceName.get(0).tagName).toEqual('a')
      expect($serviceName.attr('href')).toEqual('/components/header')
    })
  })

  describe('with navigation', () => {
    it('renders navigation', () => {
      const $ = render('idsk-header', examples['with navigation'])

      const $component = $('.idsk-header')
      const $list = $component.find('ul.idsk-header__navigation')
      const $items = $list.find('li.idsk-header__navigation-item')
      const $firstItem = $items.find('a.idsk-header__link:first-child')
      expect($items.length).toEqual(4)
      expect($firstItem.attr('href')).toEqual('#1')
      expect($firstItem.text()).toContain('Navigation item 1')
    })

    it('renders navigation default label correctly', () => {
      const $ = render('idsk-header', examples['with navigation'])

      const $component = $('.idsk-header')
      const $nav = $component.find('nav')

      expect($nav.attr('aria-label')).toEqual('Top Level Navigation')
    })

    it('renders navigation with active item', () => {
      const $ = render('idsk-header', examples['with navigation'])

      const $activeItem = $('li.idsk-header__navigation-item:first-child')
      expect($activeItem.hasClass('idsk-header__navigation-item--active')).toBeTruthy()
    })

    describe('menu button', () => {
      it('has an explicit type="button" so it does not act as a submit button', () => {
        const $ = render('idsk-header', examples['with navigation'])

        const $button = $('.idsk-header__menu-button')

        expect($button.attr('type')).toEqual('button')
      })

      it('renders default label correctly', () => {
        const $ = render('idsk-header', examples['with navigation'])

        const $button = $('.idsk-header__menu-button')

        expect($button.attr('aria-label')).toEqual('Show or hide Top Level Navigation')
      })

      it('renders default text correctly', () => {
        const $ = render('idsk-header', examples['with navigation'])

        const $button = $('.idsk-header__menu-button')

        expect($button.text()).toEqual('Menu')
      })
    })
  })
})
