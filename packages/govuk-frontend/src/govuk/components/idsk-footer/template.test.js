const { render } = require('govuk-frontend-helpers/nunjucks')
const { getExamples } = require('govuk-frontend-lib/files')

describe('idsk-footer', () => {
  let examples

  beforeAll(async () => {
    examples = await getExamples('idsk-footer')
  })

  describe('meta', () => {
    it('renders heading', () => {
      const $ = render('idsk-footer', examples['with meta'])

      const $component = $('.idsk-footer')
      const $heading = $component.find('h2.govuk-visually-hidden')
      expect($heading.text()).toEqual('Items')
    })

    it('renders default heading when none supplied', () => {
      const $ = render('idsk-footer', examples['with empty meta'])

      const $component = $('.idsk-footer')
      const $heading = $component.find('h2.govuk-visually-hidden')
      expect($heading.text()).toEqual('Support links')
    })

    it('doesn\'t render footer link list when no items are provided', () => {
      const $ = render('idsk-footer', examples['with empty meta items'])

      expect($('.idsk-footer__inline-list').length).toEqual(0)
    })

    it('renders links', () => {
      const $ = render('idsk-footer', examples['with meta'])

      const $list = $('ul.idsk-footer__inline-list')
      const $items = $list.find('li.idsk-footer__inline-list-item')
      const $firstItem = $items.find('a.idsk-footer__link:first-child')
      expect($items.length).toEqual(3)
      expect($firstItem.attr('href')).toEqual('#1')
      expect($firstItem.text()).toContain('Item 1')
    })

    it('renders custom meta text', () => {
      const $ = render('idsk-footer', examples['with custom meta'])

      const $custom = $('.idsk-footer__meta-custom')
      expect($custom.text()).toContain('GOV.UK Prototype Kit v7.0.1')
    })
  })

  describe('navigation', () => {
    it('no items displayed when no item array is provided', () => {
      const $ = render('idsk-footer', examples['with empty navigation'])

      expect($('.idsk-footer__navigation').length).toEqual(0)
    })

    it('renders headings', () => {
      const $ = render('idsk-footer', examples['with navigation'])

      const $firstSection = $('.idsk-footer__section:first-child')
      const $lastSection = $('.idsk-footer__section:last-child')
      const $firstHeading = $firstSection.find('h2.idsk-footer__heading')
      const $lastHeading = $lastSection.find('h2.idsk-footer__heading')
      expect($firstHeading.text()).toEqual('Two column list')
      expect($lastHeading.text()).toEqual('Single column list')
    })

    it('renders lists of links', () => {
      const $ = render('idsk-footer', examples['with navigation'])

      const $list = $('ul.idsk-footer__list')
      const $items = $list.find('li.idsk-footer__list-item')
      const $firstItem = $items.find('a.idsk-footer__link:first-child')
      expect($items.length).toEqual(9)
      expect($firstItem.attr('href')).toEqual('#1')
      expect($firstItem.text()).toContain('Navigation item 1')
    })

    it('renders lists in columns', () => {
      const $ = render('idsk-footer', examples['with navigation'])

      const $list = $('ul.idsk-footer__list')
      expect($list.hasClass('idsk-footer__list--columns-2')).toBeTruthy()
    })
  })

  describe('section break', () => {
    it('renders when there is a navigation', () => {
      const $ = render('idsk-footer', examples['with navigation'])

      const $sectionBreak = $('hr.idsk-footer__section-break')
      expect($sectionBreak.length).toBeTruthy()
    })

    it('renders nothing when there is only meta', () => {
      const $ = render('idsk-footer', examples['with meta'])

      const $sectionBreak = $('hr.idsk-footer__section-break')
      expect($sectionBreak.length).toBeFalsy()
    })
  })

  describe('content licence', () => {
    it('is visible', () => {
      const $ = render('idsk-footer', examples.default)

      const $licenceMessage = $('.idsk-footer__licence-description')
      expect($licenceMessage.text()).toContain('Prevádzkovateľom služby je Ministerstvo investícií, regionálneho rozvoja a informatizácie Slovenskej republiky. Vytvorené v súlade s Jednotným dizajn manuálom elektronických služieb.')
    })
  })
})
