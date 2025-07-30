import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import rout from './Routes/routes.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'


const PORT=process.env.PORT
const app = express()

app.use(cors({origin:'http://localhost:5173',credentials:true}))
app.use(express.json())
app.use(cookieParser())
app.use(rout)


app.listen(PORT, () => {
    console.log(`Server Running At ${PORT} PORT`);
})