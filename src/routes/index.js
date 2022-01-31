const express = require('express')
const financialRoutes = require('./v1/financialRoutes')
const usersRoutes = require('./v1/userRoutes')
const routes = express.Router()


routes.use([financialRoutes, usersRoutes])

module.exports = routes
