function TaskForm({
  formData,
  handleChange,
  handleSubmit,
  projects,
  employees,
}) {
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-5">
        Create New Task
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {/* Task Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Title
          </label>

          <input
            type="text"
            name="title"
            placeholder="Enter task title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Project */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project
          </label>

          <select
            name="project"
            value={formData.project}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-3"
          >
            <option value="">Select Project</option>

            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>

          <textarea
            name="description"
            placeholder="Enter task description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Employee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assigned Employee
          </label>

          <select
            name="assignedEmployee"
            value={formData.assignedEmployee}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
          >
            <option value="">Select Employee</option>

            {employees.map((employee) => (
              <option key={employee._id} value={employee._id}>
                {employee.username}
              </option>
            ))}
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due Date
          </label>

          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>

          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Create Button */}
        <div className="md:col-span-2 flex gap-3 mt-2">
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-blue-700"
          >
            Create Task
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskForm;