const fs = require('fs');
const {check, validationResult, body} = require ('express-validator');
const bcrypt = require('bcrypt');
var path = require('path');
let db = require("../database/models");


const userController = {

    register: function (req,res){
        res.render('register');
    },

    //CREAR USUARIOS

    createUser: function(req, res){

        db.Usuario.findAll()
        .then(function(usuarios){
            let usuarioExistente = null;
            usuarios.forEach((elem, i) => {
            if (elem.email == req.body.email) {
                usuarioExistente = elem;
            }
            });

            if (usuarioExistente == null){ // Validamos que el usuario no exista en nuestra base de datos.

                let errors = validationResult(req);

                if (errors.isEmpty()){ //Validamos que no haya errores y creamos una variable con los datos del nuevo usuario.
                let usuario = {
                first_name: req.body.nombre,
                last_name: req.body.apellido,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 10),
                category: "user"
                }
                //Agregamos el usuario a Session
                req.session.usuarioLogueado = usuario
                //y agregamos el nuevo usuario a la base de datos
                db.Usuario.create({
                    first_name: req.body.nombre,
                    last_name: req.body.apellido,
                    email: req.body.email,
                    password: bcrypt.hashSync(req.body.password, 10),
                    category: "user"
                    });
                mensaje = "El usuario se ha creado correctamente! Haga click en el logo para seguir navegando.";
                return res.render("register",{mensajeRegistroOK: mensaje});
                } else {
                return res.render('register', {errors: errors.errors});
                }
            } else {
                //Si el usuario ya está registrado.
            res.render("register", {errors: [{msg:'El Email ingresado ya se encuentra registrado, por favor intente con otro'}]});
            }
        })
        .catch(function(e){
            console.log(e)
        });
    },

    //LOGIN DE USUARIOS VISTA
    login: function (req,res){
        res.render('login')
    },

    //VALIDACION DE USUARIOS
    processLogin: function(req,res){
        //Busco que usuario que coincida con el mail y que sea categoría "user".
        db.Usuario.findOne({
            where: {
                email: req.body.email,
                }
        })

        .then(function(usuario){

            if (usuario){
                if (bcrypt.compareSync(req.body.password, usuario.password)) {
                    req.session.usuarioLogueado = usuario
                    if (req.body.recordame != undefined){
                    //Si esta tildado utilizar una cookie que dure 60".
                    res.cookie('recordame', usuario.email, {maxAge: 600000})
                    }
                    res.redirect ('/')
                } else {
                    let mensaje = "Contraseña Inválida"
                    res.render ('login', {contraseñainv:mensaje});
                }
            } else {
                    let mensaje = "Mail inválido"
                    res.render ('login', {mailinv:mensaje});
                }
            })
        .catch(function(e){
            console.log(e)
        });
    },

    carrito: function (req,res){

        let sumaTotal = 0;
        if (req.session.productoCarrito){
        for (let i= 0; i< req.session.productoCarrito.length; i++){
            sumaTotal = sumaTotal + req.session.productoCarrito[i].price
            }
        }
        console.log(sumaTotal)
        res.render('productCar', {productos:req.session.productoCarrito, user: req.session.usuarioLogueado, sumaTotal: sumaTotal});
    },

    carritoAdd: function (req,res){
        db.Producto.findByPk(req.body.id)
        .then(function(producto){
            let opcion;
            switch (req.body.segundaOpcion) {
                case "eliminar":
                    opcion = "Eliminar producto"
                    break;
                case "distintoTam":
                    opcion = "Producto de distinto tamaño"
                    break;
                case "marcaSim":
                    opcion = "Marca similar"
            }

            let productoSeleccionado = {
                quantity: req.body.quantity,
                opcion: opcion,
                price: producto.price,
                name: producto.name,
                }

                if (req.session.productoCarrito == undefined){
                    req.session.productoCarrito = []
                    req.session.productoCarrito.push(productoSeleccionado)
                } else {
                    req.session.productoCarrito.push(productoSeleccionado)
                }

                let sumaTotal = 0;
                for (let i= 0; i< req.session.productoCarrito.length; i++){
                    sumaTotal = sumaTotal + req.session.productoCarrito[i].price
                }

                res.render('productCar', {productos:req.session.productoCarrito, user: req.session.usuarioLogueado, sumaTotal: sumaTotal});

        })
        .catch(function(e){
            console.log(e)
        });
    },

    detalleUsuario: function (req,res){
        res.render('userDetails', {user: req.session.usuarioLogueado});
    },
    close: function(req,res){
        req.session.usuarioLogueado = undefined;
        res.redirect ('/');
    },
}

    module.exports = userController;