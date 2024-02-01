import  jwt from "jsonwebtoken";
import { tokenSecret } from "../../index.js";


export const verifyToken = (req, res, next) => {
    const {token} = req.cookies;
    // console.log(token);
    if(!token) {
        return res.status(403).json({message: 'No token, authorization denied'});
    }
    jwt.verify(token, tokenSecret, (err, role) => {
        if(err) return res.status(401).json({message: "Token invalid"});
        // console.log(role.role_name);
        req.role = role
        next();
    })
}

