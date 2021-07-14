import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import methodOverride from 'method-override'
import helmet from 'helmet'
import dotenv from 'dotenv'
import routes from './routes'
import { connectDB } from './models'
import { setup } from './fabric/fabric.service'

// ----------------------
// env variables
// ----------------------
dotenv.config()
const isProduction = process.env.NODE_INV === 'prod'
const port = process.env.PORT || 3000

// create global app object
const app = express()

// ----------------------
// security layer
// ----------------------
app.use(helmet())

// ----------------------
// Resources
// ----------------------
app.use(process.env.PUBLIC_PATH, express.static('public'))

// ----------------------
// Create DB-Connection
// ----------------------
connectDB()
  .then(() => {
    console.log('db-connect: successful')
    if (!isProduction) {
      mongoose.set('debug', true)
    }
  })
  .catch(err => {
    console.log('db:connect: error ', err)
  })

// ----------------------
// express configuration
// ----------------------
// logger
app.use(morgan('dev'))
// request parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// use http options (PUT, DELETE...) where the client does not support
app.use(methodOverride())

// ----------------------
// insert all routes, custom middlewares, etc.
// ----------------------
app.use('/api/v1', routes)

// ----------------------
// error handling
// ----------------------
// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use((err, req, res, next) => {
    console.log(err.stack)

    res.status(err.status || 500)

    res.json({
      errors: {
        message: err.message,
        error: err
      }
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.json({
    errors: {
      message: err.message,
      error: {}
    }
  })
})

// Setup fabric
setup()


// start the server
var server = app.listen(port, () => {
  console.log('Listening on port ' + server.address().port)
})
