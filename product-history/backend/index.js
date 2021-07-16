// Import the express lirbary
import routes from './routes'
import { setup } from './fabric/fabric.service'
const express = require('express')
const dotenv = require('dotenv')
const bodyParser = require("body-parser");
const QRCode = require('qrcode')
dotenv.config()
const port = process.env.PORT || 8080
const CLIENT_PATH = process.env.CLIENT_PATH;

// Create a new express application and use
// the express static middleware, to serve all files
// inside the public directory
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(process.env.PUBLIC_PATH, express.static('public'))
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


app.get('/product-history/:sourceId', function(req, res){
    QRCode.toDataURL(`${CLIENT_PATH}/${encodeURIComponent(req.params.sourceId)}`, function (err, code) {
        if(err) res.send("Error occurred while generating QR Code!");
        res.render("login", { code });
    })
})

app.use('/productHistory', routes)

// Setup fabric
setup()

// Start the server on port 8080
app.listen(port, () => console.log(`Listening on port ${port}`));



