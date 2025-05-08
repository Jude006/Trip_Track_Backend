const jwt = require('jsonwebtoken')
require('dotenv').config()

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) {
    return res.status(401).json({ message: "No token provided" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    
    req.user = { ...decoded, _id: decoded.id }

    if (!req.user._id) {
      return res.status(401).json({ message: "Invalid token pls log in again" })
    }

    next()
  } catch (error) {
    return res.status(401).json({ message: "Invalid token pls log in again", error })
  }
}

module.exports = authMiddleware
