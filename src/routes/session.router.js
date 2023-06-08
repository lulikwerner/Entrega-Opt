import { Router } from "express";
import passport from 'passport';
import UserManager from "../dao/mongo/managers/users.js";
import { isValidPassword, createHash } from "../utils.js";


const router = Router();
const userM = new UserManager();


router.post('/register',passport.authenticate('register',{failureRedirect:'/api/sessions/registerFail', failureMessage:true}) , async(req,res)=>{
    res.send({status:"success", message:"Registered"})
})

router.get('/registerFail', (req,res) =>{
  console.log(req.session.messages);
  res.status(400).send({status:"error", error:req.session.messages});
})

router.post('/login',passport.authenticate('login', {failureRedirect:'/api/sessions/loginFail', failureMessage:true}), async(req, res) => {  
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
  //Solo permito que meta 4 veces mal la info de password o user, sino la bloqueo
  if(req.session.messages.length>4) return res.status(400).send({message:"Ya te excediste en la cantidad de intentos"})
  res.status(400).send({status:"error", error:req.session.messages})
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

router.post('/restorePassword', async (req,res) => {
    const {email, password}=req.body;
    const user = await userM.getUsers({email})
    if(!user) return res.status(400).send({status:"error", error:"El usuario no existe"})
    console.log(req.body);
    const isSamePassword = await isValidPassword(password,user.password)
    if(isSamePassword) return res.status(400).send({status:"error", error:"No puede ser igual a la contrasenia anterior"})
    const newHashedPassword = await createHash(password);
    await userM.updateUser({email},newHashedPassword)
    res.sendStatus(200)
})

  export default router;

  