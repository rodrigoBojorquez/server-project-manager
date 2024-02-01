import express from "express"
import { getPieChartData, getLastMaterialsAdded, getPendingProjects, getCountUsersRol } from "../controllers/dashboard.js"
import { verifyToken } from "../middleware/validateToken.js"
import {  assignPermissions } from "../middleware/assignPermissions.js"

const dashboardRouter = express.Router()

dashboardRouter.get("/dashboard/pie-chart", verifyToken, assignPermissions(["administrator"]), getPieChartData)
dashboardRouter.get("/dashboard/last-materials",verifyToken, assignPermissions(["administrator"]), getLastMaterialsAdded)
dashboardRouter.get("/dashboard/pending", verifyToken, assignPermissions(["administrator"]),getPendingProjects)
dashboardRouter.get("/dashboard/count-users", verifyToken, assignPermissions(["administrator"]),getCountUsersRol)

export default dashboardRouter