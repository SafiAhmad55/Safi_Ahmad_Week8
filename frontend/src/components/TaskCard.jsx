function TaskCard({ task, onEdit, onDelete }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("taskId", task._id);
  };

  const priorityStyle = {
    Low: "bg-gray-200 text-gray-700",
    Medium: "bg-yellow-100 text-yellow-700",
    High: "bg-red-100 text-red-700",
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition"
    >
      {/* Task Title */}
      <h3 className="font-semibold text-gray-800 text-sm leading-5">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Priority */}
      <div className="mt-3">
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
            priorityStyle[task.priority] || priorityStyle.Medium
          }`}
        >
          {task.priority}
        </span>
      </div>

      {/* Employee */}
      <div className="flex items-center gap-2 mt-4">
        <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700">
          {task.assignedEmployee?.username
            ? task.assignedEmployee.username.charAt(0).toUpperCase()
            : "?"}
        </div>

        <span className="text-xs text-gray-600">
          {task.assignedEmployee?.username || "Unassigned"}
        </span>
      </div>

      {/* Due Date */}
      <div className="text-xs text-gray-500 mt-3">
        📅{" "}
        {task.dueDate
          ? new Date(task.dueDate).toLocaleDateString()
          : "No due date"}
      </div>

      {/* Task ID */}
      <div className="text-xs text-gray-400 mt-3">
        TASK-{task._id.slice(-6).toUpperCase()}
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onEdit(task)}
          className="text-xs px-3 py-1 rounded bg-gray-800 text-white hover:bg-gray-700"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(task._id)}
          className="text-xs px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default TaskCard;