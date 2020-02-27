const { magenta, green, grey, yellow, magentaBright} = require('chalk')
const filesize = require('filesize')
const fs = require('fs-extra')
const globby = require('globby')
const gzipSize = require('gzip-size')
const cmd = require('node-cmd')
const path = require('path')
const pluralize = require('pluralize')
const strip = require('strip-color')

const ROOT_PATH = path.resolve()
const COLUMN_WIDTH = 20

const sortByKey = (key, ascending) => (a, b) => a[key] < b[key] ? (ascending ? -1 : 1) : (a[key] > b[key] ? (ascending ? 1 : -1) : 0)

function displayStats(stats = {}, options = {}) {
  let {
    sortBy = 'size',
    ascending = false,
    columnWidth = COLUMN_WIDTH,
    columnWidths = [],
    showTotal = true,
  } = options

  let extensions = Object.values(stats).sort(sortByKey(sortBy, ascending))

  extensions.forEach(info => {
    let { extension, size, count, gzipped } = info

    const columns = [
      yellow(count) + ' ' + green(`${extension}`) + ' ' + grey(pluralize('file', count)),
      filesize(size),
      `${magentaBright(filesize(gzipped))} ${magenta('gzipped')}`,
    ]

    console.log(...columns.map((c, i) => {
      const padding = strip(c).padEnd(columnWidths[i] || columnWidth).replace(/^.*?(\s+)$/, '$1')
      
      return c + padding
    }))
  })
}

async function analyze() {
  console.log(`\nanalyzing ${ROOT_PATH}...\n`)

  const files = await globby(ROOT_PATH, {
    dot: false,
    gitignore: true,
    onlyFiles: true,
  })

  const sizelist = {}

  for (var filepath of files) {
    const [ extension ] = filepath.match(/\w+$/) || []
    
    if (!extension) continue

    let details = sizelist[extension]

    if (!details) {
      details = {
        extension,
        files: [],
        count: 0,
        size: 0,
        gzipped: 0,
      }
    }


    const filestats = await fs.stat(filepath)
    const file = await fs.readFile(filepath)
    const gzippedSize = await gzipSize(file)
    
    details.count++
    details.files.push(filepath)
    details.size += filestats.size
    details.gzipped += gzippedSize

    sizelist[extension] = details
  }

  displayStats(sizelist, {
    columnWidths: [22, 15, 20],
    summarize: ['jpg', 'html', 'js'],
  })
}

analyze()