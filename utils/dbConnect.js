const db = require('../config/keys')

const mongoose = require('mongoose')

const mongoDB = async () => {
    return await mongoose
    .connect(db, { useNewUrlParser: true })
    .then((data) => {
        console.log("====== dbConnect: Connected to MongoDB successfully =======")
    })
    .catch(err => console.log("mongo connection error: ", err.message));
}


module.exports = mongoDB;