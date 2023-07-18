const router = require("express").Router();
const pool = require("../index.js");

// gets the todos
router.route("/get").get(async (req, res) => {
  try {
    const [rows] = await pool.promise().query("SELECT * FROM todos");
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json("Failed to get todos: " + err);
  }
});

// adds a todo
router.route("/add").post(async (req, res) => {
  try {
    const todo = req.body.todo;
    const id = req.body.id;
    await pool
      .promise()
      .query("INSERT INTO todos (id, todo) VALUES (?,?)", [id, todo]);
    res.status(200);
  } catch (err) {
    res.status(500).json("Failed to add todo: " + err);
  }
});

// deletes a todo with the specified id
router.route("/delete/:id").delete(async (req, res) => {
  try {
    const id = req.params.id;
    await pool.promise().query("DELETE FROM todos WHERE id = ?", id);
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
    await pool
      .promise()
      .query("UPDATE todos SET todo = ? WHERE id = ?", [todo, id]);
    res.status(200);
  } catch (err) {
    res.status(500).json("Failed to update todo: " + err);
  }
});

module.exports = router;
