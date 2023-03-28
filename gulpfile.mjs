import { join } from 'path'

import gulp from 'gulp'

import { paths } from './config/index.js'
import * as build from './tasks/build/index.mjs'
import { browser, files, npm, scripts, styles, task } from './tasks/index.mjs'

/**
 * Umbrella scripts tasks (for watch)
 * Runs JavaScript code quality checks, documentation, compilation
 */
gulp.task('scripts', gulp.series(
  task.name('compile:js', () =>
    scripts.compile('all.mjs', {
      srcPath: join(paths.src, 'govuk'),
      destPath: join(paths.app, 'dist/javascripts'),

      filePath (file) {
        return join(file.dir, `${file.name}.min.js`)
      }
    })
  ),

  npm.script('build:jsdoc')
))

/**
 * Umbrella styles tasks (for watch)
 * Runs Sass code quality checks, documentation, compilation
 */
gulp.task('styles', gulp.series(
  task.name('compile:scss', () =>
    styles.compile('**/[!_]*.scss', {
      srcPath: join(paths.app, 'src/stylesheets'),
      destPath: join(paths.app, 'dist/stylesheets'),

      filePath (file) {
        return join(file.dir, `${file.name}.min.css`)
      }
    })
  ),

  npm.script('build:sassdoc')
))

/**
 * Build target tasks
 */
gulp.task('build:app', build.app())
gulp.task('build:package', build.package())
gulp.task('build:dist', build.dist())

/**
 * Dev task
 * Runs a sequence of tasks on start
 */
gulp.task('dev', gulp.series(
  build.app(),
  files.watch,
  npm.script('serve', paths.app)
))

/**
 * Screenshots task
 * Sends screenshots to Percy for visual regression testing
 */
gulp.task('screenshots', browser.screenshots)
