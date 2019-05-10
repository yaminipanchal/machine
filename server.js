const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require("path");
const fs = require("fs");
const config = require("./config/config");


// initialize our express app
const app = express();
const router = express.Router();

// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: false }));

// set the view engine to ejs
app.set('view engine', 'ejs');

// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));
app.use("/node_modules", express.static(__dirname + '/node_modules'));

// index page 
app.get('/', function(req, res) {
    res.render('index');
});



var url = config.database.url;

const mongoDB = process.env.MONGODB_URI || url;
mongoose.connect(mongoDB, { useCreateIndex: true, useNewUrlParser: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
// console.log(db)

db.on('error', console.error.bind(console, 'MongoDB connection error:'));




var routePath = "./routes/"; //add one folder then put your route files there my router folder name is routers
fs.readdirSync(routePath).forEach(function(file) {
    var route = routePath + file;
    require(route)(app);
});



// var api = require('./routes/')(app); // pass 'app'


// config.files.server.routes.forEach(function(routePath) {
//        // console.log(routePath)
//        require(path.resolve(routePath))(app);
//    });


let port = process.env.port || 3000;

app.listen(port, () => {
    console.log('Server is up and running on port numner ' + port);
});

// require('./routes')(app);
// require(path.resolve("./route"))(app);
// router.use(function(req, res, next) {
//     // .. some logic here .. like any other middleware
//     next();
// });

module.exports = app;