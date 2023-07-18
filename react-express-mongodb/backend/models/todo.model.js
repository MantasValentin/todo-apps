const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const todoSchema = new Schema({
  id: {
    type: Number,
    required: true,
  },
  todo: {
    type: String,
    required: true,
  },
});

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;
