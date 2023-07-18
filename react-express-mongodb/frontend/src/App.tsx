import { useEffect, useState } from "react";
import axios from "axios";
import TodoItem from "./TodoItem";

export interface Todo {
  id: number;
  todo: string;
}

function App() {
  const [todos, setTodos] = useState<Array<Todo>>([]);
  const [todo, setTodo] = useState("");

  const addTodo = async (todo: string) => {
    // makes sure that todo is not empty
    if (todo.length == 0) {
      alert("Todo is empty");
      return;
    }
    try {
      // creates id for the todo
      const id: number = Math.floor(Math.random() * 1000000000);
      // adds todo to todos
      setTodos([...(todos as any), { id: id, todo: todo }]);
      // resets todo to be empty
      setTodo("");
      // sends todo to server
      await axios.post("http://localhost:80/api/todos/add", {
        id: id,
        todo: todo,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      // removes todo from todos
      setTodos(todos.filter((item) => item.id !== id));
      // sends todo id to server
      await axios.delete(`http://localhost:80/api/todos/delete/${id}`);
    } catch (err) {
      console.log(err);
    }
  };

  const updateTodo = async (editTodo: string, id: number) => {
    try {
      // updates todo in todos
      setTodos(
        todos.map((item) =>
          item.id === id ? { todo: editTodo, id: id } : item
        )
      );
      // sends todo to server
      await axios.put(`http://localhost:80/api/todos/update`, {
        id: id,
        todo: editTodo,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const getTodos = async () => {
    try {
      // request todos from server
      const res = await axios.get("http://localhost:80/api/todos/get");
      // sets todos as respons
      console.log(res.data);
      setTodos(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addTodo(todo);
  };

  useEffect(() => {
    getTodos();
  }, []);

  return (
    <div className="flex items-center justify-center py-20 text-2xl">
      <div className="flex flex-1 flex-col max-w-3xl px-12">
        <form
          className="flex flex-row mb-6"
          onSubmit={(e) => {
            handleAdd(e);
          }}
        >
          <input
            className="flex-1 border border-gray-300 rounded-md shadow-md opacity-60 focus:outline-none focus:opacity-100 hover:opacity-100 py-1 px-2 transition duration-200"
            type="text"
            name="text"
            placeholder="Enter Todo"
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
            minLength={1}
            required
          />
          <button
            type="submit"
            className="flex-none ml-2 w-12 h-12 rounded-full border border-gray-300 duration-200 opacity-60 hover:opacity-100 active:scale-90 hover:scale-105 bg-white text-black shadow-md text-lg transition"
          >
            Add
          </button>
        </form>
        {todos ? (
          <div className="flex flex-col gap-2">
            {todos.map((item) => {
              return (
                <TodoItem
                  key={item.id}
                  id={item.id}
                  todo={item.todo}
                  deleteTodo={deleteTodo}
                  updateTodo={updateTodo}
                />
              );
            })}
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default App;
