const express = require('express')
const multer = require('multer')
const financialController = require('../../controllers/financialController')
const financialRoutes = express.Router()
const upload = multer()

financialRoutes.post('/financial/:userID"', upload.single('file'), financialController.importXLSX)

financialRoutes.get('/financial/:userID', financialController.totalTransactions)

financialRoutes.delete('/financial/:userID/:entryID', financialController.totalTransactions)


module.exports = financialRoutes