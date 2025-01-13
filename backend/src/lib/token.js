import dotenv from "dotenv"
import jwt from "jsonwebtoken"

dotenv.config()

const createToken = async (userId, res) => {

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });

    res.cookie("jwt", token, {
        maxAge: 7*24*60*60*1000,
        httpOnly: true, // prevent XSS attacks cross-site scripting attacks
        sameSite: "strict", // CSRF attacks cross-site request forgery attacks
    })

    return token;
}

export { createToken }