import connection from "../database.js";
import dotenv from "dotenv";

dotenv.config();

// TODO: employees general
export const getEmployees = async (req, res) => {
  
    try {
      const {rol, page, search} = req.query
      // Obtener empleados con el rol específico
      if (rol) {
        const queryEmployees = "SELECT * FROM users WHERE rol_fk = ? LIMIT 10 OFFSET ?;";
        const [employeesSearch] = await connection.promise().query(queryEmployees, [rol, (page - 1) * 10]);
        return res.json({
          data: employeesSearch
        })
      }

      if (search) {
        const searchTerm = `%${search}%`
        const queryEmployees = "SELECT * FROM users WHERE username LIKE ? LIMIT 10"
        const [employeesSearch] = await connection.promise().query(queryEmployees, searchTerm)
        return res.json({
          data: employeesSearch
        })
      }

      const queryEmployees = "SELECT * FROM users LIMIT 10 OFFSET ?"
      const [employeesSearch] = await connection.promise().query(queryEmployees, (page - 1) * 10)
      // Devolver la lista de empleados
      return res.json({
        data: employeesSearch
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };