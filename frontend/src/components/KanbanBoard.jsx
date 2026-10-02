import KanbanColumn from "./KanbanColumn";

function KanbanBoard({ tasks, onStatusChange, onEdit, onDelete }) {
  const columns = [
    {
      title: "TO DO",
      status: "To Do",
      color: "border-blue-500",
    },
    {
      title: "IN PROGRESS",
      status: "In Progress",
      color: "border-purple-500",
    },
    {
      title: "IN REVIEW",
      status: "Review",
      color: "border-orange-500",
    },
    {
      title: "COMPLETED",
      status: "Completed",
      color: "border-green-500",
    },
  ];

  return (
    <div className="mt-8">
      {/* Board Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Kanban Dashboard
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Drag and drop tasks to update their status
            </p>
          </div>

          <div className="text-sm text-gray-500">
            Total Tasks:{" "}
            <span className="font-semibold text-gray-800">
              {tasks.length}
            </span>
          </div>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 min-w-[1000px]">
          {columns.map((column) => {
            const columnTasks = tasks.filter(
              (task) => task.status === column.status
            );

            return (
              <KanbanColumn
                key={column.status}
                title={column.title}
                status={column.status}
                tasks={columnTasks}
                color={column.color}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default KanbanBoard;