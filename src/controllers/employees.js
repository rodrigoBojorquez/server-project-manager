import connection from "../database.js";
import dotenv from "dotenv";

dotenv.config();

// TODO: employees general
export const getEmployees = async (req, res) => {
  
    try {
  
      // Obtener empleados con el rol específico
      const queryEmployees = "SELECT * FROM users;";
      const [employeesSearch] = await connection.promise().query(queryEmployees);
  
      // Devolver la lista de empleados
      return res.json(employeesSearch);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };


