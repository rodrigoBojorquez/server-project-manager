import connection from "../database.js";
import dotenv from "dotenv";

dotenv.config();

// TODO: employees general
export const getEmployees = async (req, res) => {
    const { rol } = req.query;
  
    try {
      const querySearch = "SELECT id_rol, title FROM rols;";
      const [rols] = await connection.promise().query(querySearch);
      
      // Verificar si el rol proporcionado es válido
      const rolsArr = rols.map(obj => obj.title);
      if (!rolsArr.includes(rol)) {
        return res.status(400).json({ error: 'Invalid user role' });
      }
  
      // Obtener el ID del rol proporcionado
      const rolObj = rols.find(obj => obj.title == rol);
      const idRol = rolObj.id_rol;
  
      // Obtener empleados con el rol específico
      const queryEmployees = "SELECT * FROM users WHERE rol_fk = ?;";
      const [employeesSearch] = await connection.promise().query(queryEmployees, [idRol]);
  
      // Devolver la lista de empleados
      return res.json(employeesSearch);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };


