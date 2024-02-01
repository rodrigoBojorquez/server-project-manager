import connection from "../database.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();


// TODO: LOGIN FOR USERS

/*
    export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let userFound = await User.findOne({ email });
    if (!userFound)
      return res.status(400).json(["The email does not exist"]);
      
      // console.log(userFound.password);
      let isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) {
      return res.status(400).json(["The password is incorrect"]);
    }

    const token = await createAccessToken({
      id: userFound._id,
    });

    res.cookie("token", token);

    res.json({
      id: userFound._id,
      email: userFound.email,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
*/ 

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
      // Buscar el correo electrónico existente
      const querySearch = "SELECT email, password, rol_fk FROM users WHERE email = ?";
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

      switch (roleName) {
        case 'administrator': 
           res.json({message: 'you are administrator'});
          break;
        case 'team leader': 
           res.json({message: 'you are team leader'});
          
        case 'employee': 
           res.json({message: 'you are employee'});
          break;
        case 'registrators': 
           res.json({message: 'you are registrators'});
          break;
        case 'warehouse admin': 
           res.json({message: 'you are warehouse admin'});
          break;
        default: res.json({message: 'you are not registered'});  
      }
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
};