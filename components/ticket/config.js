const fs = require('fs')
const path = require('path')

const globalConfigContentPath = path.join(
  __dirname,
  '../../cron/scan/globalConf.json'
)

module.exports = {
  baseConf: () => {
    const fileBuffer = fs.readFileSync(globalConfigContentPath, 'utf-8')
    const confJson = JSON.parse(fileBuffer)
    return confJson
  }

}
