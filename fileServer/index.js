const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors')

const app = express()

const port = 3002

app.use(cors())

const initFileServer = () => {
  app.get('/sample-packs', async (req, res) => {
    const samplePacks = await fs.promises.readdir(path.join(__dirname, '/../src/assets/sample-packs'))

    res.send(samplePacks.filter(item => item !== '.DS_Store'))
  })

  app.listen(port, () => {
    console.log(`Sample packs file server listening at http://localhost:${port}`)
  })
}

initFileServer()

module.exports = {
  initFileServer
}
