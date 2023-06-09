import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


//Genrar token para JWT
export const generateToken = (user) => {
    //Creo el Token
    const token = jwt.sign({user}, "jwtsecret", {expiresIn:'24h'}) // SI lo pongo en '' puedo marcarle horas dias , etc sino sin'' lo pongo en segundos
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
