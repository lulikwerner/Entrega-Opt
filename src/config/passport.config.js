import passport from "passport";
import local from "passport-local";
import userModel from "../dao/mongo/models/user.js";
import { createHash, isValidPassword } from "../utils.js";

const LocalStrategy = local.Strategy

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

//Lo transforma en un unico id para su tablita
passport.serializeUser(function(user,done){
    return done(null,user.id)
});
//Con esto rellena el user que trae 
passport.deserializeUser(async function(id,done){
    if(id===0){
        return done(null,{
            role:'admin',
            name:'ADMIN'
        })
    }
    const user = await userModel.findOne({_id:id});
    return done(null,user);
});

}
export default initlizePassport;