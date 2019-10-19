const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
app.use(cors())
//const PORT = process.env.PORT || 3000;
app.listen(process.env.PORT || 3000,function(){
  console.log('server has been started')
})

app.use(bodyParser.json({limit: "500mb"}));
app.use(bodyParser.urlencoded({limit: "500mb", extended: true, parameterLimit:50000}));
app.use('/api',require('./routes/api.js'))
