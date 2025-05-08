const {login,signup} = require('../controllers/authController')
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken')

router.post('/login',login)
router.post('/signup',signup)

router.get('/dashboard', authMiddleware,(req,res)=>{
    return res.status(201).json({message:"Welcome to the dashboard"})
})


router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));
  
  router.get('/google/callback', 
    passport.authenticate('google', { session: false }),
    (req, res) => {
      const token = jwt.sign(
        { id: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      res.redirect(`http://localhost:5173/dashboard?token=${token}`);
    }
  );
  


module.exports = router