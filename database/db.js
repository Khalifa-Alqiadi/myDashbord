const mongoose = require("mongoose")

var MONGODB_URI = "mongodb://localhost:27017/dashbord";

mongoose.connect(MONGODB_URI);
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB @ 27017');
});