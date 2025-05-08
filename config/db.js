const mongoose = require('mongoose')
require('dotenv').config()


const connectDb = async()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI,{
            useUnifiedTopology:true,
            useNewUrlParser:true
        })
        console.log(`Mongodb connected successfully ${conn.connection.host}`)
    } catch (error) {
        console.error('failed to connect', error)
        process.exit(1)
    }
}

module.exports = connectDb