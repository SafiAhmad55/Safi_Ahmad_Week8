function TaskDetails({ task, onEdit, onDelete }) {
  if (!task) {
    return null;
  }

  return (
    <div className="border rounded-lg p-5 bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {task.title}
          </h3>

          <p className="text-gray-600 mt-1">
            {task.description}
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100">
          {task.priority}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-sm text-gray-600">
        <p>
          <strong>Project:</strong>{" "}
          {task.project?.name || "Not assigned"}
        </p>

        <p>
          <strong>Employee:</strong>{" "}
          {task.assignedEmployee?.username || "Not assigned"}
        </p>

        <p>
          <strong>Status:</strong> {task.status}
        </p>
      </div>

      <p className="text-sm text-gray-500 mt-3">
        <strong>Due:</strong>{" "}
        {new Date(task.dueDate).toLocaleDateString()}
      </p>

      <div className="flex gap-3 mt-4">
        <button
          onClick={() => onEdit(task)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(task._id)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default TaskDetails;