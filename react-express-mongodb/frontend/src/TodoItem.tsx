import { useState } from "react";

interface props {
  id: number;
  todo: string;
  updateTodo: (todo: string, id: number) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
}

const TodoItem: React.FC<props> = ({ id, todo, deleteTodo, updateTodo }) => {
  const [edit, setEdit] = useState(false);
  const [editTodo, setEditTodo] = useState<string>(todo);

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateTodo(editTodo, id);
    setEdit(false);
  };

  return (
    <div
      key={id}
      className={`flex flex-row gap-2 items-center max-w-3xl border rounded-md shadow-md focus:outline-none focus:opacity-100 hover:opacity-100 py-1 px-2 transition duration-200 ${
        edit ? "border-gray-900 opacity-100" : "border-gray-300 opacity-80"
      }`}
    >
      {edit ? (
        <form
          className="flex flex-row flex-1"
          onSubmit={(e) => {
            handleEdit(e);
          }}
        >
          <input
            value={editTodo}
            onChange={(e) => setEditTodo(e.target.value)}
            className="flex-1 rounded-xl focus:outline-none"
          />
          <button type="submit" className="hidden">
            Add
          </button>
        </form>
      ) : (
        <div
          className="flex-1 break-all"
          onClick={() => {
            if (!edit) {
              setEdit(!edit);
            }
          }}
        >
          {todo}
        </div>
      )}

      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8 opacity-60 hover:opacity-100 active:scale-90 hover:scale-105 transition duration-200 hover:cursor-pointer"
        onClick={() => {
          deleteTodo(id);
        }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
  );
};

export default TodoItem;
