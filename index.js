import express from "express";
import https from "https";
import fs from "fs";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
// import swaggerUi from "swagger-ui-express";
import jwt from "jsonwebtoken";

// ROUTES HERE
import employeesRouter from "./src/routes/employeesRoutes.js";
import userRouter from "./src/routes/userRoutes.js";
import teamRouter from "./src/routes/teamsRoutes.js";
import projectRouter from "./src/routes/projectsRoutes.js";
import materialsRouter from "./src/routes/materialsRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import dashboardRouter from "./src/routes/dashboardRoutes.js";

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    origin: "https://localhost:5173",
    credentials: true,
    methods: "GET, POST, PATCH, DELETE, PUT",
    allowedHeaders: "Content-Type",
  })
);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something got wrong");
});

app.use(cookieParser());

app.use(
  "/project-manager",
  employeesRouter,
  userRouter,
  teamRouter,
  projectRouter,
  materialsRouter,
  authRoutes,
  dashboardRouter
);

// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
export const tokenSecret = "your-256-bit-secret";

// TOKEN VALIDATOR FOR THE FRONT
app.post("/project-manager/token", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({
      error: "token not provided",
    });
  }

  try {
    const decoded = jwt.verify(token, tokenSecret);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTimestamp) {
      return res.json({
        isValid: false,
        error: "expired token",
      });
    }

    res.json({
      isValid: true,
      user: decoded,
    });
  } catch (err) {
    res.json({
      isValid: false,
      error: "invalid token",
    });
  }
});

// Configurar servidor HTTPS
const privateKey = fs.readFileSync("C:/Windows/System32/cert.key", "utf8");
const certificate = fs.readFileSync("C:/Windows/System32/cert.crt", "utf8");
const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);

const PORT = 8000;

httpsServer.listen(PORT, () => {
  console.log(`Server running in port ${PORT}`);
});