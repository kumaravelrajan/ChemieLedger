// Import the express lirbary
import routes from './routes'
import { setup } from './fabric/fabric.service'
const express = require('express')
const dotenv = require('dotenv')
const bodyParser = require("body-parser");
const QRCode = require('qrcode')
dotenv.config()
const isProduction = process.env.NODE_INV === 'prod'
const port = process.env.PORT || 8080

// Create a new express application and use
// the express static middleware, to serve all files
// inside the public directory
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(process.env.PUBLIC_PATH, express.static('public'))
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


// app.get('/product-history', function(req, res){

//     let data = {
//         name:"Ashika",
//         department:"Informatics",
//         id:"123456789",
//     }
//     let stringdata = JSON.stringify(data)
    
//     QRCode.toDataURL(stringdata, function (err, code) {
//         if(err) res.send("Error occurred while generating QR Code!");
//         res.render("login", { code });
//     })
// })

app.use('/productHistory', routes)

// Setup fabric
setup()

// Start the server on port 8080
app.listen(port, () => console.log(`Listening on port ${port}`));



