import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser" 
import multer from "multer";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
  })
)

//common middleware
app.use(express.json({limit:"22kb"})) //16kb
app.use(express.urlencoded({extended: true, limit:"22kb"}))
app.use(express.static("public"))
// cooki parser middile ware for cloudinary 
app.use(cookieParser())


//import routes
import healthcheck  from "./routes/healthcheck.routes.js"
import authRoutes  from "./routes/auth.routes.js"


//routes
app.use("/healthcheck", healthcheck)
app.use("/api/auth", authRoutes)



export default app