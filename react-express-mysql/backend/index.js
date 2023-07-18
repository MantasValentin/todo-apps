const express = require("express");
const cors = require("cors");
const app = express();
const fs = require("fs");
const mysql = require("mysql2");

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

// creating a connection to mysql
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "mysql",
  user: process.env.MYSQL_USER || "root",
  database: process.env.MYSQL_DB || "todos",
  password:
    fs.readFileSync(process.env.MYSQL_PASSWORD_FILE, "utf8") || "secret",
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// creates a database if it doesnt exist
pool.query("CREATE DATABASE IF NOT EXISTS todos", (error) => {
  if (error) {
    console.error("Error creating database:", error);
    return;
  }
  // focuses on the todos database to perform commands
  pool.query("USE todos", (error) => {
    if (error) {
      console.error("Error using database:", error);
      return;
    }
    // creates a table if it doesnt exist in the todos tabase
    pool.query(
      "CREATE TABLE IF NOT EXISTS todos (id INT PRIMARY KEY, todo VARCHAR(255) NOT NULL)",
      (error) => {
        if (error) {
          console.error("Error creating table:", error);
          return;
        }

        console.log(
          "Schema and table created successfully! Or already existed."
        );
      }
    );
  });
});

module.exports = pool;

// routing
const todosRouter = require("./routes/todos");
app.use("/api/todos", todosRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
