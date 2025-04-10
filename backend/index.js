import express from 'express'
import connectDB from './db/db.js';
import dotenv from "dotenv"
import path from "path";

dotenv.config({
  path: "./.env" //it is a secrect
})

const app = express();
const PORT = process.env.PORT || 8000


app.use(express.json()); // allows us to accept JSON data in the req.body



app.get("/",(req,res)=>{
  res.send("Server is ready")
})



connectDB()
.then(()=>{
    app.listen(PORT,()=>{
    console.log (` ⚙️ SERVER IS RUNNING ON PORT => ${PORT}`)
  })
})
.catch((err)=>{
  console.log("Mongodb connection error",err)
})
