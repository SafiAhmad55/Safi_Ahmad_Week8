import TaskDetails from "./TaskDetails";

function TaskList({ tasks, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-5">
        Tasks
      </h2>

      {tasks.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No tasks found.
        </p>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskDetails
              key={task._id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskList;