const express = require("express");
const cors = require("cors");
const redis = require("redis");
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

// connecting to redis database
const client = redis.createClient({
  url: "redis://redis:6379",
});

client.connect();

client.on("connect", () => {
  console.log("Connected to Redis");
});

client.on("error", (error) => {
  console.error("Redis error:", error);
});

module.exports = client;

// routing
const todosRouter = require("./routes/todos");
app.use("/api/todos", todosRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
