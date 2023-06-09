import jwt from 'jsonwebtoken'

export const authToken = (req,res,next) => {

    //Busco en el heather la autorizacion
    const authHeader = req.headers.authorization;
    console.log('auth', authHeader)
    if(!authHeader) res.status(401).send({status:"error", error:"No autenticado"})
    //Del token le saco la palabra Bearer y me quedo solo con el token 
    const token = authHeader.split(" ")[1];
    //Verifico el token . El segundo parametro es el secret y tiene que coincidir con el que tengo en utils.js. El ultimo paramentro es un callback
    jwt.verify(token, "jwtsecret", (error,credentials) => {
        if(error) return res.status(401).send({error:"Token Invalido"})
        //Creo mi usuario a partir de las credenciales
        req.user = credentials.user
        next();
    })
}