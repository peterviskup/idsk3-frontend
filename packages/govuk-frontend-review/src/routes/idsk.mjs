import * as idskContentStructure from '../../../../shared/config/idskContentStructure.js'

export default (app, { govukComponentNames, govukExampleNames, govukFullPageExamples }) => {
  app.get('/', async (req, res, next) => {
    res.locals = {
      idskItroductionContent: idskContentStructure.default.introduction,
      idskPatternsContent: idskContentStructure.default.patterns,
      idskUsageExamples: idskContentStructure.default.usageExamples,
      idskComponentsUsageContent: idskContentStructure.default.componentsUsage,
      govukComponentNames,
      govukExampleNames,
      govukFullPageExamples
    }

    res.render('idsk/index', (error, html) => {
      if (error) {
        next(error)
      } else {
        res.send(html)
      }
    })
  })

  // Introduction (Uvod) view
  app.get('/uvod/:content/:action?', function (req, res, next) {
    // Passing a random number used for the links so that they will be unique and not display as "visited"
    const randomPageHash = (Math.random() * 1000000).toFixed()
    res.render(`idsk/uvod/${req.params.content}/${req.params.action || 'index'}`, { randomPageHash }, function (error, html) {
      if (error) {
        next(error)
      } else {
        res.send(html)
      }
    })
  })

  // shallow content view
  // e.g.:
  // /slovnik
  app.get('/:content/:action?', function (req, res, next) {
    // Passing a random number used for the links so that they will be unique and not display as "visited"
    const randomPageHash = (Math.random() * 1000000).toFixed()
    res.render(`idsk/${req.params.content}/${req.params.action || 'index'}`, { randomPageHash }, function (error, html) {
      if (error) {
        next(error)
      } else {
        res.send(html)
      }
    })
  })
}
