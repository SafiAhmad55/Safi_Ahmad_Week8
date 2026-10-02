import TaskCard from "./TaskCard";

function KanbanColumn({
  title,
  status,
  tasks,
  color,
  onStatusChange,
  onEdit,
  onDelete,
}) {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();

    const taskId = e.dataTransfer.getData("taskId");

    if (taskId) {
      onStatusChange(taskId, status);
    }
  };

  return (
    <div
      className="bg-gray-50 rounded-xl border border-gray-200 p-3 min-h-[520px]"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div
        className={`flex items-center justify-between rounded-full bg-white border-l-4 ${color} shadow-sm px-4 py-3 mb-4`}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gray-700">
            {title}
          </h3>

          <span className="text-xs font-semibold text-gray-500 bg-gray-100 rounded-full px-2 py-1">
            {tasks.length}
          </span>
        </div>

        <span className="text-gray-400 text-lg">
          +
        </span>
      </div>

      {/* Task Cards */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

        {tasks.length === 0 && (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
            <p className="text-sm text-gray-400">
              No tasks
            </p>

            <p className="text-xs text-gray-300 mt-1">
              Drop a task here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default KanbanColumn;