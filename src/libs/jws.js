import jwt from "jsonwebtoken";
import { tokenSecret } from "../../index.js";

export function createAccessToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      tokenSecret,
      {
        expiresIn: "1h",
      },
      //   callback
      (err, token) => {
        // Por si salio mal el token
        if (err) reject(err);
        // Si sale bien genera el token
        resolve(token);
      }
    );
  })
}
