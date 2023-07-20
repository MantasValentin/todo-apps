const express = require("express");
const cors = require("cors");
const app = express();
const fs = require("fs");
const { Pool } = require("pg");

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

const poolConfig = {
  user: process.env.POSTGRES_USER || "postgres",
  host: process.env.POSTGRES_HOST || "postgres",
  database: process.env.POSTGRES_DB || "todos",
  password: process.env.POSTGRES_PASSWORD || "secret",
  port: 5432, // default PostgreSQL port
  // Retry configuration
  max: 10, // Maximum number of connections in the pool
  connectionTimeoutMillis: 5000, // Time to wait in milliseconds while trying to connect
  idleTimeoutMillis: 10000, // Maximum time in milliseconds that a connection can remain idle

  // Retry configuration - retry connecting for up to 5 times with increasing delays
  retry: {
    max: 5,
    delay: 1000, // Initial delay between retry attempts in milliseconds
  },
};

// creating pool
const pool = new Pool(poolConfig);

// Event listener for connection errors
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1); // Terminate the process on connection errors
});

// Create a function that waits for a specific duration
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to handle connection retries
async function retryConnection() {
  let retries = 0;
  const maxRetries = poolConfig.retry.max;
  const delay = poolConfig.retry.delay;

  while (retries < maxRetries) {
    try {
      await pool.connect();
      console.log("Connected to PostgreSQL successfully");
      // creates the table on connection to postgresql
      async function setupDatabase() {
        try {
          // creates a table if it doesnt exist in the todos tabase
          const client = await pool.connect();
          await client.query(
            "CREATE TABLE IF NOT EXISTS todos (id INT PRIMARY KEY, todo VARCHAR(255) NOT NULL)"
          );
          client.release();
          console.log("Table setup completed successfully!");
        } catch (error) {
          console.error("Error setting up table:", error);
        }
      }
      setupDatabase();
      break; // Exit the loop if connection is successful
    } catch (err) {
      console.error("Failed to connect to PostgreSQL:", err);
      retries += 1;
      await wait(delay * retries); // Increase the delay for each retry
    }
  }

  if (retries === maxRetries) {
    console.error(
      "Connection attempts exhausted. Could not connect to PostgreSQL."
    );
    process.exit(-1); // Terminate the process if all retries fail
  }
}

// Call the retryConnection function to attempt connecting with retries
retryConnection();

module.exports = pool;

// routing
const todosRouter = require("./routes/todos");
app.use("/api/todos", todosRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
