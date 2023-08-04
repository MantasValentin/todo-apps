const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

// CORS configuration for specified origin
const allowedOrigins = ["http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true); // allow the request if it's in the allowedOrigins array or if origin is not present (local requests)
      } else {
        callback(new Error("Unauthorized: Origin not allowed")); // deny the request for other origins
      }
    },
  })
);

// converts data being sent to the server allowing access to it by using req.body
app.use(express.json());

// used to access environment variables at .env with process.env
require("dotenv").config();

const port = process.env.PORT || 80;
const uri = process.env.URI || "mongodb://mongo:27017/TodoApp";
const options = {
  maxPoolSize: 10,
};

// creating a connection to mongodb
const connectMongoose = async () => {
  try {
    await mongoose.connect(uri, options);
    console.log("Connected to Mongoose");
  } catch (error) {
    console.log("Failed connection to Mongoose", error);
  }
};

connectMongoose();

// routing
const todosRouter = require("./routes/todos");
app.use("/api/todos", todosRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
