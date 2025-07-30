import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import rout from './Routes/routes.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'


const PORT=process.env.PORT
const app = express()
app.get('/',(req,res)=>{
    res.send("api running")
})

app.use(cors({origin:'https://insta-frontend-kohl.vercel.app',credentials:true}))
app.use(express.json())
app.use(cookieParser())
app.use(rout)


app.listen(PORT ||5000, () => {
    console.log(`Server Running At ${PORT} PORT`);
})