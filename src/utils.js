import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';


//Genrar token para JWT
export const generateToken = (user) => {
    //Creo el Token
    const token = jwt.sign(user, "jwtsecret", {expiresIn:'24h'}) // SI lo pongo en '' puedo marcarle horas dias , etc sino sin'' lo pongo en segundos
    return token;
}
//En el parametro options le envio a donde lo quiero dirigir si !user
export const passportCall = (strategy,options ={}) => {
    //creo mi propio "done"
    return async(req,res,next) =>{
        passport.authenticate(strategy,(error,user,info) => {
            //cuando me mandan null en mi estrategia de passport de mi "done"
            console.log('verificando')
            if(error) return next(error);
            //cuando me mandan false en mi estrategia de passport de mi "done"
            if(!user) {

                //Si le paso a donde se debe dirigir me va a redirigir a la pagina que le pase sino me va a devolver el message en la pantalal
                if(options.redirect) return res.redirect(options.redirect);
                return res.status(401).send({status:"error", error:info.message?info.message:info.toString()});
            };
            ////cuando me mandan un usuario
            req.user = user;
            next();
            //Como es el middleware de passport tengo que enviar el req,res,next
        })(req,res,next);
    }
}
//Chequea que venga el token en cookie y lo devuelve sino devuelve null
export const cookieExtractor = (req) => {
    let token=null;
    if(req&&req.cookies){
        token=req.cookies['authToken']//'authToken en el nombre que le di desde el front en el jwtAuth.js
    }
    return token; 
}

export const createHash = async(password) =>{
    const salts = await bcrypt.genSalt(10);
    return bcrypt.hash(password,salts)
}

export const isValidPassword = (password,hashedPassword) => bcrypt.compareSync(password,hashedPassword);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export { __dirname };
