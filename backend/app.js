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
import userRoutes  from "./routes/user.routes.js"
import postRoutes from "./routes/post.routes.js"


//routes
app.use("/api", healthcheck)
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/post", postRoutes)




// ✅ GLOBAL ERROR HANDLER — Add this at the bottom

//basically i made this because of getme funtion was not handling error properly  because of middleware 

app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    statusCode: err.statusCode || 500,
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});


export default app