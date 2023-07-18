const router = require("express").Router();
const pool = require("../index.js");

// gets the todos
router.route("/get").get(async (req, res) => {
  try {
    const client = await pool.connect();
    const todos = await client.query("SELECT * FROM todos");
    client.release();
    res.status(200).json(todos.rows);
  } catch (err) {
    res.status(500).json("Failed to get todos: " + err);
  }
});

// adds a todo
router.route("/add").post(async (req, res) => {
  try {
    const todo = req.body.todo;
    const id = req.body.id;
    const client = await pool.connect();
    await client.query("INSERT INTO todos (id, todo) VALUES ($1,$2)", [
      id,
      todo,
    ]);
    client.release();
    res.status(200);
  } catch (err) {
    res.status(500).json("Failed to add todo: " + err);
  }
});

// deletes a todo with the specified id
router.route("/delete/:id").delete(async (req, res) => {
  try {
    const id = req.params.id;
    const client = await pool.connect();
    await client.query("DELETE FROM todos WHERE id = $1", [id]);
    client.release();
    res.status(200);
  } catch (err) {
    res.status(500).json("Failed to delete todo: " + err);
  }
});

// updates a todo with the specified id
router.route("/update").put(async (req, res) => {
  try {
    const todo = req.body.todo;
    const id = req.body.id;
    const client = await pool.connect();
    await client.query("UPDATE todos SET todo = $1 WHERE id = $2", [todo, id]);
    client.release();
    res.status(200);
  } catch (err) {
    res.status(500).json("Failed to update todo: " + err);
  }
});

module.exports = router;
