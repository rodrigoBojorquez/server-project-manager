import connection from "../database.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { createAccessToken } from "../libs/jws.js";

dotenv.config();


// TODO: LOGIN FOR USERS



export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
      // Buscar el correo electrónico existente
      const querySearch = "SELECT email, password, rol_fk,username FROM users WHERE email = ?";
      const [result] = await connection.promise().query(querySearch, email);

      if (result.length === 0) {
          return res.status(404).json({ message: 'User not found' });
      }

      const hashedPassword = result[0].password;
      const isMatch = await bcrypt.compare(password, hashedPassword);
      if (!isMatch) {
          return res.status(400).json({ message: 'The password is incorrect' });
      }

      const rol = result[0].rol_fk;
      const searchRol = 'SELECT title AS role_name FROM rols WHERE id_rol = ?'
      const [rolResult]  = await connection.promise().query(searchRol,rol);
      const roleName = rolResult[0].role_name;
      const username = result[0].username;

      const token = await createAccessToken({
        role_name: roleName,
        username: username,
      });
  
      res.cookie("token", token);

      return res.status(200).json({message: "ok"})
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
};