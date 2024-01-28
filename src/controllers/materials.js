import connection from "../database.js"
import { validationResult } from "express-validator"


export const createMaterial = async (req, res) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()
        })
    }

    const { materialName, quantity, measure } = req.body

    try {
        // validate if the material already exist in the db
        const querySearch = "SELECT * FROM materials WHERE material_name = ?"
        const [ validation ] = await connection.promise().query(querySearch, [materialName])
        
        if(validation.length > 0){
            return res.status(400).json({
                error: "the material already exist"
            })
        }

        const queryInsert = "INSERT INTO materials (material_name, create_date, quantity, measure) VALUES (?, NOW(), ?, ?)"
        const [ response ] = await connection.promise().query({sql: queryInsert, values: [materialName, parseInt(quantity), measure]})
 
        return res.json({
            message: "material added successfully",
            data: response
        })
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}


export const getMaterials = async (req, res) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()
        })
    }
    
    try {
        const { page, search } = req.query

        if (search != null) {
            const querySearch = "SELECT * FROM materials  WHERE material_name LIKE ? ORDER BY id_material DESC LIMIT 10 OFFSET ?"
            const searchTerm = `%${search}%`
            const [ results ] = await connection.promise().query(querySearch, [searchTerm, (page - 1) * 15])

            return res.json({
                message: "successful request",
                data: results
            })
        }
        else {
            // search the warehouse 15 by 15
            const queryPage = "SELECT * FROM materials LIMIT 15 OFFSET ?"
            const [ results ] = await connection.promise().query(queryPage, [(page - 1) * 15])

            return res.json({
                message: "successful request",
                data: results
            })
        }
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}


export const updateMaterial = (req, res) => {

}


export const deleteMaterial = (req, res) => { 

}