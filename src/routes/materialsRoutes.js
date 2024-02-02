import express from "express"
import { body, query, param } from "express-validator"
import { createMaterial, deleteMaterial, getMaterials, updateMaterial } from "../controllers/materials.js"
import { verifyToken } from "../middleware/validateToken.js"
import {  assignPermissions } from "../middleware/assignPermissions.js"

const materialsRouter = express.Router()

// VALIDATIONS HERE
// const createMaterialChain = [
//     body("materialName").trim().isString().isLength({min: 3, max: 255}).withMessage("name must be greater than 3 and lower than 255"),
//     body("quantity").isNumeric().withMessage("minimun 1 item must be added"),
//     body("measure").trim().isString().isLength({min: 1, max: 255}).withMessage("invalid unit of measurement")
// ]

// const getMaterialsChain = [
//     query("page").isInt({min: 1}).withMessage("invalid page"),
//     query("search").trim().isString().isLength({min:3, max:255}).optional().withMessage("minimun 3 chars to search")    
// ]

// const updateMaterialChain = [
//     param("id").isNumeric({no_symbols: true}).withMessage("invalid id format"),
//     body("materialName").trim().isString().isLength({min: 3,  max: 255}).optional().withMessage("invalid name length"),
//     body("quantity").trim().isInt({min: 1}).optional().withMessage("minimun 1 item must be added"),
//     body("measure").trim().isString().isLength({min: 1, max: 255}).optional().withMessage("invalid unit of measurement")
// ]

// const deleteMaterialChain = [
//     param("id").isNumeric({no_symbols: true}).withMessage("invalid id format"),
// ]

// ROUTES HERE
materialsRouter.post("/warehouse",verifyToken,assignPermissions(['administrator','warehouse admin']) , createMaterial)
// materialsRouter.get("/warehouse",verifyToken,assignPermissions(['administator','team leader','warehouse admin']) , getMaterials)
materialsRouter.get("/warehouse", getMaterials)
materialsRouter.put("/warehouse/:id", updateMaterial)
materialsRouter.delete("/warehouse/:id",verifyToken,assignPermissions(['administrator','warehouse admin']) , deleteMaterial)

export default materialsRouter