import configFn from './govuk-prototype-kit.config.mjs'

describe('GOV.UK Prototype Kit config', () => {
  /** @type {import('./govuk-prototype-kit.config.mjs').PrototypeKitConfig} */
  let config

  beforeAll(async () => {
    config = await configFn()
  })

  it('includes paths for assets, scripts, sass', () => {
    expect(config.assets).toEqual([
      '/govuk/assets',
      '/govuk/all.js.map'
    ])

    expect(config.sass).toEqual([
      '/govuk-prototype-kit/init.scss'
    ])

    expect(config.scripts).toEqual([
      '/govuk/all.js',
      '/govuk-prototype-kit/init.js'
    ])
  })

  describe('Nunjucks', () => {
    it('includes macros list', () => {
      expect(config.nunjucksMacros).toEqual([
        {
          importFrom: 'govuk/components/accordion/macro.njk',
          macroName: 'govukAccordion'
        },
        {
          importFrom: 'govuk/components/back-link/macro.njk',
          macroName: 'govukBackLink'
        },
        {
          importFrom: 'govuk/components/breadcrumbs/macro.njk',
          macroName: 'govukBreadcrumbs'
        },
        {
          importFrom: 'govuk/components/button/macro.njk',
          macroName: 'govukButton'
        },
        {
          importFrom: 'govuk/components/character-count/macro.njk',
          macroName: 'govukCharacterCount'
        },
        {
          importFrom: 'govuk/components/checkboxes/macro.njk',
          macroName: 'govukCheckboxes'
        },
        {
          importFrom: 'govuk/components/cookie-banner/macro.njk',
          macroName: 'govukCookieBanner'
        },
        {
          importFrom: 'govuk/components/date-input/macro.njk',
          macroName: 'govukDateInput'
        },
        {
          importFrom: 'govuk/components/details/macro.njk',
          macroName: 'govukDetails'
        },
        {
          importFrom: 'govuk/components/error-message/macro.njk',
          macroName: 'govukErrorMessage'
        },
        {
          importFrom: 'govuk/components/error-summary/macro.njk',
          macroName: 'govukErrorSummary'
        },
        {
          importFrom: 'govuk/components/fieldset/macro.njk',
          macroName: 'govukFieldset'
        },
        {
          importFrom: 'govuk/components/file-upload/macro.njk',
          macroName: 'govukFileUpload'
        },
        {
          importFrom: 'govuk/components/footer/macro.njk',
          macroName: 'govukFooter'
        },
        {
          importFrom: 'govuk/components/header/macro.njk',
          macroName: 'govukHeader'
        },
        {
          importFrom: 'govuk/components/hint/macro.njk',
          macroName: 'govukHint'
        },
        {
          importFrom: 'govuk/components/idsk-accordion/macro.njk',
          macroName: 'idskAccordion'
        },
        {
          importFrom: 'govuk/components/idsk-address/macro.njk',
          macroName: 'idskAddress'
        },
        {
          importFrom: 'govuk/components/idsk-banner/macro.njk',
          macroName: 'idskBanner'
        },
        {
          importFrom: 'govuk/components/idsk-button/macro.njk',
          macroName: 'idskButton'
        },
        {
          importFrom: 'govuk/components/idsk-card/macro.njk',
          macroName: 'idskCard'
        },
        {
          importFrom: 'govuk/components/idsk-crossroad/macro.njk',
          macroName: 'idskCrossroad'
        },
        {
          importFrom: 'govuk/components/idsk-customer-surveys/macro.njk',
          macroName: 'idskCustomerSurveys'
        },
        {
          importFrom: 'govuk/components/idsk-customer-surveys-radios/macro.njk',
          macroName: 'idskCustomerSurveysRadios'
        },
        {
          importFrom: 'govuk/components/idsk-customer-surveys-text-area/macro.njk',
          macroName: 'idskCustomerSurveysTextArea'
        },
        {
          importFrom: 'govuk/components/idsk-feedback/macro.njk',
          macroName: 'idskFeedback'
        },
        {
          importFrom: 'govuk/components/idsk-footer/macro.njk',
          macroName: 'idskFooter'
        },
        {
          importFrom: 'govuk/components/idsk-footer-extended/macro.njk',
          macroName: 'idskFooterExtended'
        },
        {
          importFrom: 'govuk/components/idsk-header/macro.njk',
          macroName: 'idskHeader'
        },
        {
          importFrom: 'govuk/components/idsk-header-extended/macro.njk',
          macroName: 'idskHeaderExtended'
        },
        {
          importFrom: 'govuk/components/idsk-header-web/macro.njk',
          macroName: 'idskHeaderWeb'
        },
        {
          importFrom: 'govuk/components/idsk-in-page-navigation/macro.njk',
          macroName: 'idskInPageNavigation'
        },
        {
          importFrom: 'govuk/components/idsk-interactive-map/macro.njk',
          macroName: 'idskInteractiveMap'
        },
        {
          importFrom: 'govuk/components/idsk-intro-block/macro.njk',
          macroName: 'idskIntroBlock'
        },
        {
          importFrom: 'govuk/components/idsk-registration-for-event/macro.njk',
          macroName: 'idskRegistrationForEvent'
        },
        {
          importFrom: 'govuk/components/idsk-related-content/macro.njk',
          macroName: 'idskRelatedContent'
        },
        {
          importFrom: 'govuk/components/idsk-search-component/macro.njk',
          macroName: 'idskSearchComponent'
        },
        {
          importFrom: 'govuk/components/idsk-search-results/macro.njk',
          macroName: 'idskSearchResults'
        },
        {
          importFrom: 'govuk/components/idsk-search-results-filter/macro.njk',
          macroName: 'idskSearchResultsFilter'
        },
        {
          importFrom: 'govuk/components/idsk-skip-link/macro.njk',
          macroName: 'idskSkipLink'
        },
        {
          importFrom: 'govuk/components/idsk-stepper/macro.njk',
          macroName: 'idskStepper'
        },
        {
          importFrom: 'govuk/components/idsk-subscription-form/macro.njk',
          macroName: 'idskSubscriptionForm'
        },
        {
          importFrom: 'govuk/components/idsk-table/macro.njk',
          macroName: 'idskTable'
        },
        {
          importFrom: 'govuk/components/idsk-table-filter/macro.njk',
          macroName: 'idskTableFilter'
        },
        {
          importFrom: 'govuk/components/idsk-tabs/macro.njk',
          macroName: 'idskTabs'
        },
        {
          importFrom: 'govuk/components/idsk-timeline/macro.njk',
          macroName: 'idskTimeline'
        },
        {
          importFrom: 'govuk/components/idsk-warning-text/macro.njk',
          macroName: 'idskWarningText'
        },
        {
          importFrom: 'govuk/components/input/macro.njk',
          macroName: 'govukInput'
        },
        {
          importFrom: 'govuk/components/inset-text/macro.njk',
          macroName: 'govukInsetText'
        },
        {
          importFrom: 'govuk/components/label/macro.njk',
          macroName: 'govukLabel'
        },
        {
          importFrom: 'govuk/components/notification-banner/macro.njk',
          macroName: 'govukNotificationBanner'
        },
        {
          importFrom: 'govuk/components/pagination/macro.njk',
          macroName: 'govukPagination'
        },
        {
          importFrom: 'govuk/components/panel/macro.njk',
          macroName: 'govukPanel'
        },
        {
          importFrom: 'govuk/components/phase-banner/macro.njk',
          macroName: 'govukPhaseBanner'
        },
        {
          importFrom: 'govuk/components/radios/macro.njk',
          macroName: 'govukRadios'
        },
        {
          importFrom: 'govuk/components/select/macro.njk',
          macroName: 'govukSelect'
        },
        {
          importFrom: 'govuk/components/skip-link/macro.njk',
          macroName: 'govukSkipLink'
        },
        {
          importFrom: 'govuk/components/summary-list/macro.njk',
          macroName: 'govukSummaryList'
        },
        {
          importFrom: 'govuk/components/table/macro.njk',
          macroName: 'govukTable'
        },
        {
          importFrom: 'govuk/components/tabs/macro.njk',
          macroName: 'govukTabs'
        },
        {
          importFrom: 'govuk/components/tag/macro.njk',
          macroName: 'govukTag'
        },
        {
          importFrom: 'govuk/components/textarea/macro.njk',
          macroName: 'govukTextarea'
        },
        {
          importFrom: 'govuk/components/warning-text/macro.njk',
          macroName: 'govukWarningText'
        }
      ])
    })

    it('includes paths', () => {
      expect(config.nunjucksPaths).toEqual(['/'])
    })
  })
})
