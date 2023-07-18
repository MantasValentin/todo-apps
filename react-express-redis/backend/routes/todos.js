const router = require("express").Router();
const client = require("../index");

// gets the todos
router.route("/get").get(async (req, res) => {
  try {
    let todos = await client.lRange("todos", 0, -1);
    // parses the values in the array to be JSON cause returned data is an array with stringified values
    todos = todos.map((todo) => JSON.parse(todo));
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
    await client.rPush("todos", JSON.stringify({ id, todo }));
    res.status(200);
  } catch (err) {
    res.status(500).json("Failed to add todo: " + err);
  }
});

// deletes a todo with the specified id
router.route("/delete/:id").delete(async (req, res) => {
  try {
    const id = req.params.id;
    let todos = await client.lRange("todos", 0, -1);
    todos = todos.map((todo) => JSON.parse(todo));
    const singelTodo = todos.filter((todo) => id == todo.id)[0];
    await client.lRem("todos", 0, JSON.stringify(singelTodo));
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
    let todos = await client.lRange("todos", 0, -1);
    todos = todos.map((todo) => JSON.parse(todo));
    const singleTodoIndex = todos.findIndex((item) => id == item.id);
    let singleTodo = todos[singleTodoIndex];
    singleTodo = { ...singleTodo, todo: todo };
    await client.lSet("todos", singleTodoIndex, JSON.stringify(singleTodo));
    res.status(200);
  } catch (err) {
    res.status(500).json("Failed to update todo: " + err);
  }
});

module.exports = router;
