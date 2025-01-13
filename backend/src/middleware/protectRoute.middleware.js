import User from "../modules/user.module.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const protectRoute = async (req, res, next) => {
    try{
        const token = req.cookies.jwt;

        if(!token){
            return res.status(401).json({
                message: "Unauthorized-no token Provided"
            })
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET)

        if(!decode){
            return res.status(401).json({
                message: "Unauthorized-Invalid token"
            })
        }

        const user = await User.findById(decode.userId).select("-password");

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
    
        req.user = user;
    
        next();

    }catch(error){
        console.log("Error in protectRoute middleware: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export { protectRoute }