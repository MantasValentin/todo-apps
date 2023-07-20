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
let pool;
const retryConfig = {
  max: 10,
  delay: 1000,
};

// Create a function that waits for a specific duration
const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Function to handle connection retries
const retryConnection = async () => {
  let retries = 0;
  const maxRetries = retryConfig.max;
  const delay = retryConfig.delay;

  while (retries < maxRetries) {
    try {
      // creating a connection to mysql
      pool = mysql.createPool({
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
      // test connection
      let testConnection = await new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
          if (err) {
            reject(err); // Connection failed
          } else {
            console.log("Connected to MySQL successfully");
            connection.release(); // Release the connection back to the pool
            resolve();
          }
        });
      });
      if (testConnection) {
        throw testConnection;
      }
      const setupDatabase = () => {
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
      };
      setupDatabase();
      break; // Exit the loop if connection is successful
    } catch (err) {
      console.error("Failed to connect to MySQL:", err);
      retries += 1;
      await wait(delay * retries); // Increase the delay for each retry
    }
  }

  if (retries === maxRetries) {
    console.error("Connection attempts exhausted. Could not connect to MySQL.");
    process.exit(-1); // Terminate the process if all retries fail
  }
};

// Call the retryConnection function to attempt connecting with retries
retryConnection();

module.exports = pool;

// routing
const todosRouter = require("./routes/todos");
app.use("/api/todos", todosRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
