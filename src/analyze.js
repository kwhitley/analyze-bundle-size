const { magenta, green } = require('chalk')
const fs = require('fs-extra')
const globby = require('globby')
const gzip = require('gzip-size')
const cmd = require('node-cmd')
const path = require('path')

const ROOT_PATH = path.resolve()

async function analyze() {
  const files = await globby(ROOT_PATH + '/src`', {
    dot: false,
    onlyFiles: true,
  })

  const extensions = new Map

  for (var filepath of files) {
    console.log(filepath)
  }

  console.log(JSON.stringify(files, null, 2))
}

console.log(magenta(`analyzing: ${ROOT_PATH}`))
analyze()