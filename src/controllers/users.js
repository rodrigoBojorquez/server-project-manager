import connection from "../database.js"
import { validationResult } from "express-validator"
import bcrypt  from "bcrypt"
import dotenv from "dotenv"
import nodemailer from "nodemailer"

dotenv.config()

// CREATE USER ENDPOINT
export const createUser  = async (req, res) =>  {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()
        })
    }

    // FIRST VALIDATE THE ROL
    const { rol } = req.query
    
    try {
        const querySearch = "SELECT id_rol, title FROM rols;"
        const [ rols ] = await connection.promise().query({sql: querySearch})
        const rolsArr = rols.map(obj => obj.title)

        if (!rolsArr.includes(rol)) {
            return res.status(400).json({
                error: "invalid user rol"
            })
        }
        const rolObj = rols.find(obj => obj.title == rol)
        const idRol = rolObj.id_rol

        const { username, email, speciality } = req.body

        const isEmailUsed = await validateEmail(email)
        if (isEmailUsed) {
            return res.status(403).json({
                error: "the email has already been used"
            })
        }

        // GENERATE TOKEN
        const activationToken = generateActivationToken()

        // INSERT USER
        const queryInsert = "INSERT INTO users (username, email, speciality, rol_fk, activation_token, is_activate) VALUES (?, ?, ?, ?, ?, ?);"
        const [ response ] = await connection.promise().query({sql: queryInsert, values: [username, email, speciality, rol_fk, activationToken, 0]})

        // SEND EMAIL
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Activate project-manager account",
            text: `Hello ${username}, to activate your project-manager account you have to click on the following link and set your secret password: \n\n ${process.env.FRONTEND_LOCATION}/${activationToken}`
        }

        transporter.sendMail(mailOptions, (err, resp) => {
            if (err) {
                return res.status(500).json({
                    error: "there was an error sending the email"
                })
            }
            else {
                return res.json({
                    message: resp
                })
            }
        })

        return res.json({
            message: "user added successfully, now activate",
            data: response
        })
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}


// ACTIVATE USER ENDPOINT
export const activateUser = async (req, res) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()
        })
    }

    const { token, password } = req.body

    try {
        const querySearch = "SELECT id_user FROM users WHERE activation_token = ?"
        const [ row ] = await connection.promise().query(querySearch, [token])
        if (row.length == 0) {
            return res.status(400).json({
                error: "invalid activate token"
            })
        }
        const idUser = row[0].id_user

        // HASH PASSWORD
        const hashedPassword = await hashPass(password)

        const queryUpdate = "UPDATE users SET password = ?, is_activate = 1, activation_token = NULL WHERE id_user = ?"
        const [ response ] = await connection.promise().query({sql: queryUpdate, values: [hashedPassword, idUser]})

        return res.json({
            message: "the user has been activate",
            data: response
        })
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}

// DELETE USER ENDPOINT
export const deleteUser = async (req, res) => {

    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()
        })
    }
    try {
        const { id } = req.params

        // VALIDATE THE id
        const querySearch = "SELECT * FROM users WHERE id_user = ?"
        const [ user ] = await connection.promise().query({sql: querySearch, values: [id]})
    
        if (user.length == 0) {
            return res.status(404).json({
                error: "the provided id isn't valid"
            })
        }
    
        if (user[0].rol_fk == 1) {
            return res.status(403).json({
                error: "cannot eliminate an administrator"
            })
        }
    
        const idUser = user[0].id_user

        const queryDelete = "DELETE FROM users WHERE id_user = ?"
        const [ response ] = await connection.promise().query({sql: queryDelete, values: [idUser]})
    
        return res.json({
            message: "the user has been deleted successfully",
            data: response
        })
    }
    catch (err) {
        return res.status(500).json({
            error: err
        })
    }
}

// VALIDATE EMAIL
const validateEmail = async (email) => {
    try {
        const [response] = await connection.promise().query("SELECT * FROM users WHERE email = ?", [email])

        return response.length > 0
    } catch (err) {
        throw new Error(err.message)
    }
}

//CREATE A RANDOM TOKEN FOR ACTIVATION
const generateActivationToken = () => {
    const validChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-"
    let token = ""
    for (let i = 0; i<20; i++) {
        const aleatoryChar = validChars.charAt(Math.floor(Math.random() * validChars.length))
        token += aleatoryChar
    }
    return token
}

// HASH THE USERPASSWORD
const hashPass = (rawPass) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(rawPass, 10, (err, hash) => {
            if (err) {
                reject(err)
            } else {
                resolve(hash)
            }
        })
    })
} 

// TODO: PUT USERS