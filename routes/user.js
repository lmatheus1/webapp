'use strict'
var express= require('express');
var UserController = require('../controllers/user');

var api =express.Router();
var md_auth=require('../middlewares/authenticated');

//var multipart = require('connect-multiparty');
//var md_upload = multipart({uploadDir: './uploads/users'})
var crypto = require('crypto')

var multer = require('multer');

const storage = multer.diskStorage({

  destination(req, file, cb) {

    cb(null, './uploads/users');

  },
  filename(req, file = {}, cb) {

    const { originalname } = file;

    const fileExtension = (originalname.match(/\.+[\S]+$/) || [])[0];

     //cb(null, `${file.fieldname}__${Date.now()}${fileExtension}`);

    crypto.pseudoRandomBytes(16, function (err, raw) {

      cb(null, raw.toString('hex') + Date.now() + fileExtension);

    });

  },
});

var mul_upload = multer({dest: './uploads/users',storage});

api.get('/pruebas-del-controlador', UserController.pruebas);
api.post('/register', UserController.saveUser);
api.post('/login', UserController.login) ;
api.put('/update-user/:id',md_auth.ensureAuth,UserController.updateUser);
api.post('/upload-image-user/:id', [md_auth.ensureAuth, mul_upload.single('image')], UserController.uploadImage);
api.get('/get-image-file/:imageFile', UserController.getImageFile);
api.get('/keepers', UserController.getKeepers);

module.exports=api;

