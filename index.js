const express = require('express');
const routes = require('./src/routes');
const app = express()

app.use(express.json())


app.use(routes)

//servidor
app.listen(3333, () => console.log('Executando'))