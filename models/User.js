const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required: function() { return !this.googleId; }
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true 
      },
      profile: {
        firstName: String,
        lastName: String,
        bio: String,
        avatar: String, 
        location: String,
        website: String,
        socialMedia: {
          twitter: String,
          instagram: String,
          facebook: String
        }
      },
      preferences: {
        theme: { type: String, default: 'light' }, 
        currency: { type: String, default: 'USD' }
      },
      avatar: String
},{timestamps:true})

const User = mongoose.model('user',userSchema)

module.exports = User;