import { Router } from "express";
import passport from 'passport';
import { generateToken } from "../utils.js";
import userModel from "../dao/mongo/models/user.js";
import { isValidPassword } from "../utils.js";
import {authToken} from "../middlewares/jwtAuth.js"

const router = Router();

router.post('/register',passport.authenticate('register',{failureRedirect:'/api/sessions/registerFail'}) , async(req,res)=>{
    res.send({status:"success", message:"Registered"})
})

router.get('/registerFail', (req,res) =>{
  console.log(req.session.messages);
  res.status(400).send({status:"error", error:req.session.messages});
})

router.post('/login',passport.authenticate('login', {failureRedirect:'/api/sessions/loginFail'}), async(req, res) => {  
  req.session.user = {
    name: req.user.name,
    role: req.user.role,
    id: req.user.id,
    email: req.user.email
  }
  console.log('Logged in user:', req.user); 
  return res.status(200).json({ status: "success" });
 
  }); 

router.get('/loginFail', (req,res) => {
  console.log(req.session.messages);
  res.status(400).send({status:"error", error:req.session.messages})
})


router.get('/github', passport.authenticate('github'), (req,res) => {})

router.get('/githubcallback', passport.authenticate('github'), (req,res) => {
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
  const {email, password} =  req.body
  let accessToken;
    if(email === "adminCoder@coder.com" && password==="adminCod3r123" ){
      //Aca inicializo el admin
      const user = {
        id:0,
        name: `Admin`,  
        role: 'admin',
        email: '...'
      }
      //Ahora genero TOKEN
       accessToken = generateToken(user);
      res.send({status:"success", token:accessToken})
    }
    let user = await userModel.findOne({email}); //Solo busco por email
    if (!user) return res.status(400).send({status:'error', error:'No se encontro el ususario'})
    // Si el usuario existe valido el pw
    const isPasswordValid   = await isValidPassword(password,user.password);
    if(!isPasswordValid ) return res.status(400).send({status:'error', error:'Contrasenia incorrecta'})

    //Si el usuario existe y la contrasenia es correcta entonces devuelvo la sesion en passport
    user = {
        id:user._id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role
    };
    accessToken = generateToken(user);
    res.send({status:'success', accessToken})
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

  