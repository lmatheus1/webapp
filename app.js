'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var app = express();

// cargar rutas
var user_routes = require("./routes/user");
var animal_routes = require("./routes/animal");

// middlewares de body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configurar cabeceras y cors de nuestra API (lista para usarlas en el proyecto del frontend)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY,Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Method"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

// Rutas body-parser

//app.use(express.static(path.join(__dirname, 'client'))); //  "public" off of current is root (esto es con # en direccion web)
app.use('/', express.static('client', {redirect:false}));// esto es sin # en direccion web (recomendable)
app.use("/api", user_routes);
app.use("/api", animal_routes);

app.get('*', function(req, res, next){                  // esto es sin # en direccion web (recomendable)
  res.sendFile(path.resolve('client/index.html'));      // esto es sin # en direccion web (recomendable)
});

module.exports = app;

