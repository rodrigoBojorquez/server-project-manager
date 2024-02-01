import express from "express"
import { getPieChartData, getLastMaterialsAdded, getPendingProjects, getCountUsersRol } from "../controllers/dashboard.js"

const dashboardRouter = express.Router()

dashboardRouter.get("/dashboard/pie-chart", getPieChartData)
dashboardRouter.get("/dashboard/last-materials", getLastMaterialsAdded)
dashboardRouter.get("/dashboard/pending", getPendingProjects)
dashboardRouter.get("/dashboard/count-users", getCountUsersRol)

export default dashboardRouter