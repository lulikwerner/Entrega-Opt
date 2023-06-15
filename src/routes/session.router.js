import { Router } from "express";
import passport from 'passport';
import { generateToken } from "../utils.js";
import userModel from "../dao/mongo/models/user.js";
import { isValidPassword } from "../utils.js";
import {authToken} from "../middlewares/jwtAuth.js"
import { passportCall } from "../utils.js";

const router = Router();

router.post('/register',passport.authenticate('register',{failureRedirect:'/api/sessions/registerFail'}) , async(req,res)=>{
    res.send({status:"success", message:"Registered"})
})

router.get('/registerFail', (req,res) =>{
  console.log(req.session.messages);
  res.status(400).send({status:"error", error:req.session.messages});
})
//session:false apago todo lo que passport tiene de sessions
router.post('/login',passportCall('login'), async(req, res) => {  
 
    //Si el usuario existe y la contrasenia es correcta entonces devuelvo la sesion en passport
   const user = {
        id:req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
    };
    //Genero el TOKEN
    const accessToken = generateToken(user);
    //Le mando el TOKEN desde el body al fron-end
    res.cookie('authToken', accessToken, {
      maxAge: 1000*60*60*24,//tiene que coincidir con la expiracion del token definido en utils.js
      httpOnly: true,
      //sameSite:"strict"
    }).sendStatus(200);
  }); 

router.get('/loginFail', (req,res) => {
  console.log(req.session.messages);
  res.status(400).send({status:"error", error:req.session.messages})
})


router.get('/github', passportCall('github'), (req,res) => {   const user = {
  id:req.user.id,
  name: req.user.name,
  email: req.user.email,
  role: req.user.role
};
//Genero el TOKEN
const accessToken = generateToken(user);
//Le mando el TOKEN desde el body al fron-end
res.cookie('authToken', accessToken, {
maxAge: 1000*60*60*24,//tiene que coincidir con la expiracion del token definido en utils.js
httpOnly: true,
//sameSite:"strict"
}).sendStatus(200);
res.send({status:"succes", message:"Logueado pero con GituHub"})
})

router.get('/githubcallback', passportCall('github'), (req,res) => {
  const user = req.user;
  //Aqui creo la sesion
  req.session.user = {
    id: user.id,
    name: user.first_name,
    role: user.role
  }
  res.send({status:"succes", message:"Logeado con gitHub"});
})

//Rutas para JWT
router.post('/jwtLogin', async(req,res) => {

})

router.get('/jwtProfile', authToken, async(req,res) => {
    console.log(req.user);
    res.send({status:"success", payload:req.user})
})


router.post('/logout', (req, res) => {
    // Destruye la sesion de la cookie
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      // Redirigo al Login
      res.redirect('/login');
    });
  });

  export default router;

  