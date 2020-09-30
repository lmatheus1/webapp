'use strict'
// modulos
var bcrypt = require('bcrypt-nodejs');
var fs=require('fs');
var path=require('path')

// modelos
var User = require('../models/user');

// servicio jwt
var jwt = require('../services/jwt');

// acciones
function pruebas(req, res){
    res.status(200).send({
        message: 'Probando el controlador de usuarios y la accion pruebas',
    });
}

function saveUser(req, res){

    // Crear objeto usuario
    var user = new User();

    // Recoger parametros peticion
    var params = req.body;

if (params.password && params.name && params.surname && params.email){
    
        // Asignar valores al objeto de usuario
        user.name = params.name;
        user.surname = params.surname;
        user.email = params.email;
        user.rol = 'ROLE_USER';
        user.image = null;

        User.findOne({email: user.email.toLowerCase()}, (err, issetUser)=>{
            if(err){
                res.status(500).send({message: 'Error al comprobar el usuario'})   
            }else{
                if(!issetUser){
                       // Cifrar la contraseña
                    bcrypt.hash(params.password, null, null, function(err, hash){
                        user.password=hash;
                        // Guadar usuario en base de datos
                            user.save((err, userStored) => {
                                if (err){
                                    res.status(500).send({message: 'Error al guardar'})
                                }else{
                                    if (!userStored){
                                        res.status(404).send({message: 'No se ha registrado el usuario'})   
                                    }else{
                                        res.status(200).send({user:userStored});
                                    }
                                }
                            });
                        })
                }else{
                    res.status(200).send({
                        message: 'El usuario no puede registarse porque ya existe'
                    });     
                }
            }
        });       
 
}else{
    res.status(200).send({
        message: 'Introduce los datos correctamente para poder registrar al usuario'
    });  
}    
}

function login (req, res){
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({email: email.toLowerCase()}, (err, user)=>{
        if(err){ 
            res.status(500).send({message: 'Error al comprobar el usuario. Email errado'})   
        }else{
            if(user){
                bcrypt.compare(password, user.password, (err, check)=>{
                    if (check){
                        // comprobar y generar el token
                        if(params.gettoken){
                            // devolver el token jwt
                            res.status(200).send({
                               token: jwt.createToken(user)
                            });

                        }else{
                            res.status(200).send({user,  message: 'El usuario ha entrado...'}); 
                        }

                        
                    }else{
                        res.status(404).send({
                            message: 'El usuario no ha podido loguearse correctamente. Password errado'
                        }); 
                    }
                });
                   
            }else{
                res.status(404).send({
                    message: 'El usuario no ha podido loguearse. Email errado'
                });        
            }
        }
    }); 

    
}
function updateUser(req, res){
    var userId= req.params.id;
    var update= req.body;
    if (userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permiso para actualizar el usuario'});
    }

    User.findByIdAndUpdate(userId, update, {new:true}, (err, userUpdated) => { 
        if(err){
            res.status(500).send({
                message: 'Error al actualizar usuario'
            }); 
        }else{
            if(!userUpdated){
                res.status(404).send({message:'No se podido actualizar el usuario'});
            }else{
                res.status(200).send({user: userUpdated}); // nota: la peticion 200 siempre es para indicar positivo
            }
        }


    }); 
}

 function uploadImage(req, res){
    var userId=req.params.id;
    var file_name='No subido';
    console.log('req.file', req.file);
    if(req.file){
           //console.log(req.file);
    var file_path = req.file.path;
    var file_split = file_path.split('/');
    var file_name = file_split[2];
    var ext_split = req.file.originalname.split('\.');
    var file_ext = ext_split[1]
    if(file_ext== 'png' || file_ext== 'gif' || file_ext== 'jpg'){
      User.findByIdAndUpdate(userId, {image:file_name}, {new:true}, (err, userUpdated) => {
        if(!userUpdated){
          res.status(404).send({message: 'No se ha podido actualizar el usuario'});
        }else{
          res.status(200).send({user: userUpdated});
        }
      })
    }else{
      res.status(200).send({message: 'Extension del archivo no valida'});
    }
  }else{
    res.status(200).send({message: 'No has subido ninguna imagen..'});
  }      
}

function getImageFile(req, res){
    var imageFile = req.params.imageFile;
    var path_file = 'uploads/users/'+imageFile;
    fs.access(path_file, (err) => {
        if (!err) {
            res.status(200).sendFile(path.resolve(path_file));
        }else{
            res.status(404).send({message: 'File do not exists'})
        }
    });    
}

function getKeepers(req, res){
    User.find({role:'ROLE_ADMIN'}).exec((err, users)=>{
        if (err){
            res.status(500).send({message: 'Error en la peticion'})  
        }else{
            if(!users){
                res.status(404).send({message: 'No hay cuidadores'})  
            }else{
                res.status(200).send({users});     
            }
        }
    });
}

module.exports={
    pruebas,
    saveUser,
    login,
    updateUser,
    uploadImage,
    getImageFile,
    getKeepers
}
