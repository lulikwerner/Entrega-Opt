import passport from "passport";
import local from "passport-local";
import GithubStrategy from "passport-github2";
import userModel from "../dao/mongo/models/user.js";
import { createHash, isValidPassword } from "../utils.js";
import {Strategy, ExtractJwt} from 'passport-jwt';
import {cookieExtractor } from '../utils.js';

const LocalStrategy = local.Strategy; //Es la estrategia

const initlizePassport = () => {
    //username y password son obligatorios extraerlos por eso te lo pide. Pongo el valor en true passReqToCallback: true para que me deje extraer la otra info del user y le digo que el email va a ser el username field usernameField:'email' 
passport.use('register',new LocalStrategy({passReqToCallback: true, usernameField:'email'}, async(req,email,password,done) => {
        try{
        //Aca extraigo todo lo que quiero que no sea username y password
        const { first_name, last_name } = req.body;
        //Corroboro que completen todos los campos de registro
      if(!first_name || !last_name || !email || !password){
          return done(null,false, { message: 'Por favor completar todos los campos' });
        } 
        //Busco si ya existe el usuario
        const exists = await userModel.findOne({email});
        if(exists) done(null,false,{message:'El usuario ya existe'})
        //Si no existe el usuario en la db. Encripto la contrasenia
        const hashedPassword = await createHash(password);


        //Construyo el usuario que voy a registrar
        const user = {
          first_name,
          last_name,  
          email,
          password:hashedPassword
        }
          const result = await userModel.create(user);
          //Si todo salio ok
          done(null,result);
        }catch(error){
            done(error)
        }
}))

    //le digo que el email va a ser el field username
passport.use('login', new LocalStrategy({usernameField:'email'},async(email, password,done)=>{
    //PASSPORT SOLO DEBE DEVOLVER EL USUARIO FINAL. NO ES RESPONSABLE DE LA SESION
    let user;
    if(email === "adminCoder@coder.com" && password==="adminCod3r123" ){
      //Aca inicializo el admin
      const user = {
        id:0,
        name: `Admin`,
        role: 'admin',
        email: '...'
      }
      return done(null, user);
    }
    user = await userModel.findOne({email}); //Solo busco por email
    if (!user) return done(null,false,{message: "Credenciales incorrectas" });
    

    // Si el usuario existe valido el pw
    const isPasswordValid   = await isValidPassword(password,user.password);
    console.log(password)
    console.log(user.password)
    if(!isPasswordValid ) return done(null,false,{message:"contrasenia incorrecta"});

    //Si el usuario existe y la contrasenia es correcta entonces devuelvo la sesion en passport
    user = {
        id:user._id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role
    };
    return done(null,user);
}));

passport.use('github', new GithubStrategy({
  clientID:"Iv1.1dd1410ac14946b5",
  clientSecret:"795760751219fa0e7038b9f9bbaa1e1f5d768235",
  callbackURL:"http://localhost:8080/api/sessions/githubcallback"
}, async(accessToken, refreshToken, profile, done )=>{
    try{
      console.log(profile);
      //Tomo los datos que me sirven
      const{name,email} = profile._json;
      const user = await userModel.findOne({email});
      if(!user){
        //Si el usuario no existe lo creo yo
        const newUser = {
          first_name: name,
          email,
          password:''
        }
        //Creo el nuevo usuario
        const result = await userModel.create(newUser);
        done(null,result)
      }
      //Si el usuario ya existia
      done(null,user);

    }catch(error){
      done(error);
    }
}))

//Passport  se encargara de la verificacion de mi TOKEN
passport.use('jwt', new Strategy({
  //Selecciono fromExtractor xq el token viene la cookie. Es para extraer el token de la cookie
    jwtFromRequest:ExtractJwt.fromExtractors([cookieExtractor]),
    secretOrKey: 'jwtsecret' //Tiene que coincidir con el que esta en utils.js  en const token
}, async(payload,done)=>{
  //En el payload viene el usuario que yo cree
    return done(null, payload)
}))

};
export default initlizePassport;