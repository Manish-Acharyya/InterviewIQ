const mongo = require("mongoose");


const connectDB = mongo.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("db connect");
  })
  .catch((error) => {
    console.log("not connected", error);
  });
module.exports = connectDB;
