import jwt from 'jsonwebtoken'
import UserModel from '../schemas/userSchema.js';


export default async function AuthMiddleware(req, res, next) {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Unuthorised or invalid token" })
        }
        const decode = jwt.verify(token,process.env.JWT_SECRET_KEY);
        const userid = decode.id;
        const user = await UserModel.findById(userid)
        if (!user) {
            return res.status(401).json({ message: "Unuthorised or invalid token" })
        }
        req.user = user;
        next()
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Unuthorised or invalid token" })
    }
}