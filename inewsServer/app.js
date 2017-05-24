var express = require('express');
	router = require('./routes/index.js');
var app = express();

app.use('/',router);

app.listen(8080);


