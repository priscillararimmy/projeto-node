const express = require('express')
const usersController = require('../../controllers/usersController')

const usersRoutes = express.Router()

usersRoutes.post('/userCreate', usersController.register)
usersRoutes.patch('/user/:id', usersController.updDate)
usersRoutes.get('/users', usersController.index)
usersRoutes.get('/user/:id', usersController.indexOne)


module.exports = usersRoutes