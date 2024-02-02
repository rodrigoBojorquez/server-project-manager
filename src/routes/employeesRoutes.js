import express from "express"
import { body, query } from "express-validator"
import { getEmployees } from "../controllers/employees.js";
import { verifyToken } from "../middleware/validateToken.js";
import { assignPermissions } from "../middleware/assignPermissions.js";

const employeesRouter = express.Router()

// VALIDATIONS HERE


// ROUTES HERE

// employeesRouter.get('/employees',verifyToken,assignPermissions(['administrator','team leader','employee']),getEmployees);
employeesRouter.get('/employees',getEmployees);


export default employeesRouter