'use strict'
var express= require('express');
var AnimalController = require('../controllers/animal');

var api =express.Router();
var md_auth=require('../middlewares/authenticated');
var md_admin=require('../middlewares/is_admin');

//var multipart = require('connect-multiparty');
//var md_upload = multipart({uploadDir: './uploads/users'})
var crypto = require('crypto')

var multer = require('multer');

const storage = multer.diskStorage({

  destination(req, file, cb) {

    cb(null, './uploads/animals');

  },
  filename(req, file = {}, cb) {

    const { originalname } = file;

    const fileExtension = (originalname.match(/\.+[\S]+$/) || [])[0];

    // cb(null, `${file.fieldname}__${Date.now()}${fileExtension}`);

    crypto.pseudoRandomBytes(16, function (err, raw) {

      cb(null, raw.toString('hex') + Date.now() + fileExtension);

    });

  },
});

var mul_upload = multer({dest: './uploads/animals',storage});

api.get('/pruebas-animales', md_auth.ensureAuth,AnimalController.pruebas);
api.post('/animal', [md_auth.ensureAuth, md_admin.isAdmin], AnimalController.saveAnimal);
api.get('/animals',AnimalController.getAnimals);
api.get('/animal/:id',AnimalController.getAnimal);
api.put('/animal/:id',[md_auth.ensureAuth,md_admin.isAdmin], AnimalController.updateAnimal);
api.post('/upload-image-animal/:id', [md_auth.ensureAuth, mul_upload.single('image'),md_admin.isAdmin], AnimalController.uploadImage);
api.get('/get-image-animal/:imageFile', AnimalController.getImageFile);
api.delete('/animal/:id',[md_auth.ensureAuth, md_admin.isAdmin], AnimalController.deleteAnimal);

module.exports=api;

