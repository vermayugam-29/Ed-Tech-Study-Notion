const mongoose = require('mongoose');
require('dotenv').config();

exports.connect = () => {
    mongoose.connect(process.env.MONGO_URL , {
        useNewurlParser : true,
        useUnifiedTopology : true
    })
    .then(() => {
        console.log('Connected to Database Successfully');
    })
    .catch((error) => {
        console.log('Error connecting to Database');
        console.error(error);
        process.exit(1);
    })
}