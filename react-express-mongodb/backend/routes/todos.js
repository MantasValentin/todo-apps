const router = require("express").Router();
let Todo = require("../models/todo.model");

// gets the todos
router.route("/get").get(async (req, res) => {
  try {
    const todos = await Todo.find({}, { _id: 0, __v: 0 });
    res.status(200).json(todos);
  } catch (err) {
    res.status(500).json("Failed to get todos: " + err);
  }
});

// adds a todo
router.route("/add").post(async (req, res) => {
  try {
    const todo = req.body.todo;
    const id = req.body.id;
    const newTodo = new Todo({ id, todo });
    await newTodo.save();
    res.status(200);
  } catch (err) {
    res.status(500).json("Failed to add todo: " + err);
  }
});

// deletes a todo with the specified id
router.route("/delete/:id").delete(async (req, res) => {
  try {
    const id = req.params.id;
    await Todo.deleteOne({ id: id });
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
    await Todo.updateOne({ id: id }, { $set: { todo: todo } });
    res.status(200);
  } catch (err) {
    res.status(500).json("Failed to update todo: " + err);
  }
});

module.exports = router;
