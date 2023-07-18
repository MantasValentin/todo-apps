const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

// accepts connections only from a specific ip (localhost or 127.0.0.1) and port (3000)
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(cors());
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
async function connectMongoose() {
  try {
    await mongoose.connect(uri, options);
    console.log("Connected to Mongoose");
  } catch (error) {
    console.log("Failed connection to Mongoose", error);
  }
}

connectMongoose();

// routing
const todosRouter = require("./routes/todos");
app.use("/api/todos", todosRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});