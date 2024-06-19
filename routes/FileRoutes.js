const express = require('express')
const router = express.Router()
const fileControler = require('../controller/fileControler.js')


router.post('/upload',fileControler.ConverterFile)


module.exports = router