'use strict';
// modulos
var fs=require('fs'); // modulo file system
var path=require('path') // modulo path

// modelos
var User = require('../models/user');
var Animal = require('../models/animal');

// acciones
function pruebas(req, res){
    res.status(200).send({
        message: 'Probando el controlador de animales y la accion pruebas',
        user:req.user
    });
}

function saveAnimal(req, res){
    var animal = new Animal();
    var params=req.body;
if (params.name){
    animal.name=params.name;
    animal.description=params.description;
    animal.year=params.year;
    animal.image=null;
    animal.user=req.user.sub;   
    animal.save((err, animalStored)=>{          // save es un metodo de mongoose
        if(err) {
            res.status(500).send({mesage:'Error en el servidor'})
        }else{
            if(!animalStored){
                res.status(404).send({message:'No se ha guardado el animal'});
            }else{
                res.status(200).send({animal:animalStored});
            }

        }
    });           
    }else{
        res.status(200).send({
         message: 'El nombre del animal es obligatorio'
        });
    }
}
function getAnimals(req, res){
    Animal.find({}).populate({path:'user'}).exec((err, animals)=>{
        if (err){
            res.status(500).send({
                message: 'Error en la peticion'
               });   
        }else{
            if(!animals){
                res.status(404).send({
                    message: 'No hay animales'
                   });     
            }else{
                res.status(200).send({animals})

            }
        }
    });
}

function getAnimal(req, res){
    var animalId= req.params.id;
    Animal.findById(animalId).populate({path:'user'}).exec((err, animal)=>{
        if (err){
            res.status(500).send({
                message: 'Error en la peticion'
               });   
        }else{
            if(!animal){
                res.status(404).send({
                    message: 'El animal no existe'
                   });     
            }else{
                res.status(200).send({
                    animal
                });
            }
        }
    });
}

function updateAnimal(req, res){
    var animalId=req.params.id;
    var update=req.body;
    Animal.findByIdAndUpdate(animalId, update,{new:true}, (err, animalUpdated )=>{
        if (err){
            res.status(500).send({
                message: 'Error en la peticion'
               });     
        }else{
            if(!animalUpdated){
                res.status(404).send({
                    message: 'NO se ha actualizado el animal'
                   });     
            }else{
                res.status(200).send({animal:animalUpdated});
            }
        }
    });

}
function uploadImage(req, res){
    var animalId=req.params.id;
    var file_name='No subido';
    if(req.file){
        var a=req.file;
        console.log(a);
        var file_path = req.file.path;
        console.log(file_path);
        var file_split = file_path.split('/');
        console.log('file_split[0]: '+file_split[0]);
        console.log('file_split[1]: '+file_split[1]);
        console.log('file_split[2]: '+file_split[2])
        var file_name = file_split[2];
        var ext_split = req.file.originalname.split('\.');

        var file_ext = ext_split[1];
        console.log('file_ext: '+file_ext);

        if(file_ext== 'png' || file_ext== 'gif' || file_ext== 'jpg'){

          Animal.findByIdAndUpdate(animalId, {image:file_name}, (err, animalUpdated) => {
        if (err){
                  res.status(500).send({
                    message:'Error al actualizar el usuario'
                  });
        }else{
            if(!animalUpdated){
              res.status(404).send({message: 'No se ha podido actualizar el animal'});
            }else{
                console.log('entro 4to if');
                console.log(animalUpdated);
              res.status(200).send({animal: animalUpdated, image:file_name});
            }
        }
          })
        }else{
            fs.unlink(file_path, (err)=>{
                if (err){
                    res.status(200).send({message: 'Extension no valida y fichero no borrado'});   
                }else{
                    res.status(200).send({message: 'Extension del archivo no valida'});
                }
            });  
        }
      }else{
        res.status(200).send({message: 'No has subido ninguna imagen..'});
      }   
}

function getImageFile(req, res){
    var imageFile = req.params.imageFile;
    var path_file = 'uploads/animals/'+imageFile;
    fs.access(path_file, (err) => {
        if (!err) {
            res.status(200).sendFile(path.resolve(path_file));
        }else{
            res.status(404).send({message: 'File do not exists'})
        }
    });    
}

function deleteAnimal(req, res){
    var animalId= req.params.id;

    Animal.findByIdAndRemove(animalId, (err, animalRemoved)=>{
        if (err){
            res.status(500).send({message: 'Error en la peticion'});   
        }else{
            if (!animalRemoved){
                res.status(500).send({message: 'No se ha podido borrar el animal'});  
            }else{
                res.status(200).send({animal: animalRemoved});
            }
        }
    })
}

module.exports={
    pruebas,
    saveAnimal,
    getAnimals,
    getAnimal,
    updateAnimal,
    uploadImage,
    getImageFile,
    deleteAnimal
};