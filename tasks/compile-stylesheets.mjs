import { join, parse } from 'path'
import { promisify } from 'util'

import { render } from 'node-sass'
import PluginError from 'plugin-error'
import postcss from 'postcss'
// eslint-disable-next-line import/default
import postcssrc from 'postcss-load-config'

import { paths, pkg } from '../config/index.js'
import { getListing } from '../lib/file-helper.js'

import { writeAsset } from './compile-assets.mjs'
import { destination, isDist, isPackage, isPublic } from './task-arguments.mjs'

// Sass renderer
const sassRender = promisify(render)

/**
 * Compile Sass to CSS task
 *
 * @returns {Promise<void>}
 */
export async function compileStylesheets () {
  const importEntries = await getImportEntries()

  try {
    await Promise.all(importEntries.map(compileStylesheet))
  } catch (cause) {
    throw new PluginError('compile:scss', cause)
  }
}

compileStylesheets.displayName = 'compile:scss'

/**
 * Compile Sass to CSS helper
 *
 * @param {AssetEntry} assetEntry - Asset entry
 */
export async function compileStylesheet ([modulePath, { srcPath, destPath }]) {
  const moduleSrcPath = join(srcPath, modulePath)
  const moduleDestPath = join(destPath, getPathByDestination(modulePath))

  // Render Sass
  const { css, map } = await sassRender({
    file: moduleSrcPath,
    outFile: moduleDestPath,

    // Enable source maps
    sourceMap: true,
    sourceMapContents: true,

    // Resolve @imports via
    includePaths: [
      join(paths.node_modules, 'govuk_frontend_toolkit/stylesheets'),
      paths.node_modules
    ]
  })

  const options = {
    from: moduleSrcPath,
    to: moduleDestPath,
    map: {
      inline: false,
      prev: map.toString()
    }
  }

  // Transform with PostCSS
  const config = await postcssrc(options)
  const result = await postcss(config.plugins).process(css, options)

  // Write to files
  return writeAsset(moduleDestPath, result)
}

/**
 * Stylesheet imports to compile
 *
 * @returns {Promise<AssetEntry[]>} Import entries
 */
export async function getImportEntries () {
  const srcPath = isPublic ? paths.app : join(paths.src, 'govuk')
  const destPath = isPackage ? join(destination, 'govuk') : destination

  // Source stylesheets
  const importPaths = await getListing(srcPath, '[!_]*.scss')

  return importPaths
    .map((modulePath) => ([modulePath, {
      srcPath,
      destPath
    }]))
}

/**
 * Stylesheet path by destination
 *
 * @param {AssetEntry[0]} filePath - File path
 * @returns {AssetEntry[0]} File path adjusted by destination
 */
export function getPathByDestination (filePath) {
  let { dir, name } = parse(filePath)

  // Adjust file path by destination
  name = isDist ? `${name.replace(/^all/, pkg.name)}-${pkg.version}` : name

  // Adjust file path for minification
  return join(dir, !isPackage
    ? `${name}.min.css`
    : `${name}.scss`)
}

/**
 * @typedef {import('./compile-assets.mjs').AssetEntry} AssetEntry
 * @typedef {import('./compile-assets.mjs').AssetOutput} AssetOutput
 */
