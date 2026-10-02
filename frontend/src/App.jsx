import { useEffect, useState } from "react";
import TaskForm from "./components/TaskForm";
import TaskFilters from "./components/TaskFilters";
import KanbanBoard from "./components/KanbanBoard";
import TaskEditForm from "./components/TaskEditForm";
import FileManagement from "./components/FileManagement";
import Login from "./components/Login";
import MeetingScheduler from "./components/MeetingScheduler";
import Reports from "./components/Reports";
import InvoiceList from "./components/InvoiceList";
import './App.css'
function App() {
  const API_BASE_URL = "http://localhost:5001/api";
  const API_URL = `${API_BASE_URL}/tasks`;

  const emptyForm = {
    title: "",
    description: "",
    project: "",
    assignedEmployee: "",
    priority: "Medium",
    dueDate: "",
    status: "To Do",
  };
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const clearFilters = () => {
    setSearch("");
    setProjectFilter("");
    setEmployeeFilter("");
    setPriorityFilter("");
    setStatusFilter("");
  };
  const [editingTask, setEditingTask] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("token") !== null
  );
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activePage, setActivePage] = useState("dashboard");

  // Get authentication token
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const token = getToken();

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTasks(data.tasks);
      } else {
        alert(data.message || "Failed to fetch tasks.");
      }
    } catch (error) {

      alert("Unable to connect to the backend server.");
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    fetchTasks();
    fetchProjectsAndEmployees();
  }, [isLoggedIn]);
  const fetchProjectsAndEmployees = async () => {
    try {
      const token = getToken();

      const [projectsResponse, employeesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch(`${API_BASE_URL}/auth/employees`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const projectsData = await projectsResponse.json();
      const employeesData = await employeesResponse.json();

      if (projectsResponse.ok) {
        setProjects(projectsData.projects);
      } else {
        alert(projectsData.message || "Failed to fetch projects.");
      }

      if (employeesResponse.ok) {
        setEmployees(employeesData.employees);
      } else {
        alert(employeesData.message || "Failed to fetch employees.");
      }
    } catch (error) {

      alert("Unable to load projects and employees.");
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Create or update task
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = getToken();

      const url = editingTask
        ? `${API_URL}/${editingTask._id}`
        : API_URL;

      const method = editingTask ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          editingTask
            ? "Task updated successfully."
            : "Task created successfully."
        );

        setFormData(emptyForm);
        setEditingTask(null);
        fetchTasks();
      } else {
        alert(data.message || "Operation failed.");
      }
    } catch (error) {

      alert("Unable to connect to the backend server.");
    }
  };

  // Edit task
  const handleEdit = (task) => {
    setEditingTask(task);

    setFormData({
      title: task.title,
      description: task.description,
      project: task.project?._id || "",
      assignedEmployee: task.assignedEmployee?._id || "",
      priority: task.priority,
      dueDate: task.dueDate
        ? task.dueDate.substring(0, 10)
        : "",
      status: task.status,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingTask(null);
    setFormData(emptyForm);
  };

  // Delete task
  const handleDelete = async (taskId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert("Task deleted successfully.");
        fetchTasks();
      } else {
        alert(data.message || "Failed to delete task.");
      }
    } catch (error) {

      alert("Unable to connect to the backend server.");
    }
  };
  // Update task status from Kanban Board
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/${taskId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTasks((previousTasks) =>
          previousTasks.map((task) =>
            task._id === taskId
              ? { ...task, status: newStatus }
              : task
          )
        );
      } else {
        alert(data.message || "Failed to update task status.");
      }
    } catch (error) {

      alert("Unable to connect to the backend server.");
    }
  };

  // Filter tasks on frontend
  const filteredTasks = tasks
    .filter((task) =>
      task.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter(
      (task) =>
        !projectFilter ||
        task.project?._id === projectFilter
    )
    .filter(
      (task) =>
        !employeeFilter ||
        task.assignedEmployee?._id === employeeFilter
    )
    .filter(
      (task) =>
        !priorityFilter ||
        task.priority === priorityFilter
    )
    .filter(
      (task) =>
        !statusFilter ||
        task.status === statusFilter
    );

  const handleLogin = (data) => {
    localStorage.setItem("user", JSON.stringify(data.user));
    setCurrentUser(data.user);
    setIsLoggedIn(true);
    setActivePage("dashboard");
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setIsLoggedIn(false);
  };
  return (


    <div className="min-h-screen bg-gray-100 flex">

      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0">

        {/* Sidebar Header */}
        <div className="px-6 py-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">
            Task Management
          </h1>

          <p className="text-xs text-gray-500 mt-1">
            Task management system
          </p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">

          {/* Dashboard */}
          <button
            onClick={() => {
              setActivePage("dashboard");
              setEditingTask(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${activePage === "dashboard"
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <span>🏠</span>
            <span className="font-medium">Dashboard</span>
          </button>
          {/*meeting schedule */}
          <button
            onClick={() => setActivePage("meetings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${activePage === "meetings"
              ? "bg-blue-600 text-white font-semibold"
              : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <span>🗓️</span>
            <span>Meetings</span>
          </button>

          {/* Create Task */}
          <button
            onClick={() => {
              setActivePage("create");
              setEditingTask(null);
              setFormData(emptyForm);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${activePage === "create"
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <span>➕</span>
            <span className="font-medium">Create Task</span>
          </button>


          {/* Filters */}
          <button
            onClick={() => {
              setActivePage("filters");
              setEditingTask(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${activePage === "filters"
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <span>🔍</span>
            <span className="font-medium">Filters</span>
          </button>

          {/* Kanban Board */}
          <button
            onClick={() => {
              setActivePage("kanban");
              setEditingTask(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${activePage === "kanban"
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <span>📋</span>
            <span className="font-medium">Kanban Board</span>
          </button>
          <button
            onClick={() => {
              setActivePage("files");
              setEditingTask(null);
              setFormData(emptyForm);
            }}
            className={`w-full text-left px-4 py-3 rounded-lg ${activePage === "files"
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            📁 File Management
          </button>
          <button
            onClick={() => setActivePage("reports")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${activePage === "reports"
              ? "bg-blue-600 text-white font-semibold"
              : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <span>📊</span>
            <span>Reports</span>
          </button>
          {/* Invoices */}
          <button
            onClick={() => {
              setActivePage("invoices");
              setEditingTask(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${activePage === "invoices"
              ? "bg-blue-600 text-white font-semibold"
              : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <span>🧾</span>
            <span>Invoices</span>
          </button>

        </nav>
        {/* Sidebar Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-gray-200">

          {currentUser && (
            <div className="mb-4">
              <p className="text-lg font-bold text-gray-800">
                {currentUser.username}
              </p>

              <p className="text-sm font-medium text-gray-600 mt-1">
                Role: {currentUser.role}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition"
          >
            <span>🚪</span>
            <span className="font-medium">Logout</span>
          </button>

        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 flex-1 p-8">

        {/* Dashboard */}
        {activePage === "dashboard" && (
          <div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Dashboard
              </h2>

              <p className="text-gray-500 mt-1">
                Overview of your tasks and progress
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

              {/* Total */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <p className="text-sm text-gray-500">
                  Total Tasks
                </p>

                <h3 className="text-3xl font-bold text-gray-800 mt-2">
                  {tasks.length}
                </h3>
              </div>

              {/* To Do */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <p className="text-sm text-gray-500">
                  To Do
                </p>

                <h3 className="text-3xl font-bold text-gray-800 mt-2">
                  {tasks.filter(
                    (task) => task.status === "To Do"
                  ).length}
                </h3>
              </div>

              {/* In Progress */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <p className="text-sm text-gray-500">
                  In Progress
                </p>

                <h3 className="text-3xl font-bold text-gray-800 mt-2">
                  {tasks.filter(
                    (task) => task.status === "In Progress"
                  ).length}
                </h3>
              </div>

              {/* Review */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <p className="text-sm text-gray-500">
                  In Review
                </p>

                <h3 className="text-3xl font-bold text-gray-800 mt-2">
                  {tasks.filter(
                    (task) => task.status === "Review"
                  ).length}
                </h3>
              </div>

              {/* Completed */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <p className="text-sm text-gray-500">
                  Completed
                </p>


                <h3 className="text-3xl font-bold text-gray-800 mt-2">
                  {tasks.filter(
                    (task) => task.status === "Completed"
                  ).length}
                </h3>
              </div>

            </div>

          </div>
        )}

        {/* FILE MANAGEMENT PAGE */}
        {activePage === "files" && !editingTask && (
          <div>
            <FileManagement />
          </div>
        )}

        {/* Meeting Scheduler */}
        {activePage === "meetings" && (
          <MeetingScheduler />
        )}
        {activePage === "reports" && (
          <Reports />
        )}
        {activePage === "invoices" && (
          <InvoiceList />
        )}
        {/* CREATE TASK */}
        {activePage === "create" && !editingTask && (
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Create Task
              </h2>

              <p className="text-gray-500 mt-1">
                Create a new task and assign it to an employee.
              </p>
            </div>

            <TaskForm
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              projects={projects}
              employees={employees}
            />
          </div>
        )}


        {/* UPDATE TASK */}
        {editingTask && (
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Update Task
              </h2>

              <p className="text-gray-500 mt-1">
                Modify the selected task.
              </p>
            </div>

            <TaskEditForm
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              handleCancel={handleCancel}
              projects={projects}
              employees={employees}
            />
          </div>
        )}


        {/* FILTERS PAGE */}
        {activePage === "filters" && !editingTask && (
          <div>

            {/* Page Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Search & Filter Tasks
              </h2>

              <p className="text-gray-500 mt-1">
                Find tasks using different filters.
              </p>
            </div>

            {/* Search & Filters */}
            <TaskFilters
              search={search}
              setSearch={setSearch}
              projectFilter={projectFilter}
              setProjectFilter={setProjectFilter}
              employeeFilter={employeeFilter}
              setEmployeeFilter={setEmployeeFilter}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              projects={projects}
              employees={employees}
            />

            {/* Matching Tasks */}
            <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-5">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    Matching Tasks
                  </p>

                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {filteredTasks.length}
                  </p>
                </div>

                <button
                  onClick={clearFilters}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700"
                >
                  Clear Filters
                </button>

              </div>

            </div>

            {/* Task Results */}
            <div className="mt-6">

              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Task Results
              </h3>

              {filteredTasks.length === 0 ? (

                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <p className="text-gray-500">
                    No tasks match your filters.
                  </p>
                </div>

              ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                  {filteredTasks.map((task) => (

                    <div
                      key={task._id}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition"
                    >

                      {/* Title */}
                      <h3 className="font-semibold text-gray-800">
                        {task.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {task.description}
                      </p>

                      {/* Priority */}
                      <div className="mt-4">

                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${task.priority === "High"
                            ? "bg-red-100 text-red-700"
                            : task.priority === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                            }`}
                        >
                          {task.priority}
                        </span>

                      </div>

                      {/* Status */}
                      <div className="mt-3 text-sm">
                        <span className="text-gray-500">
                          Status:
                        </span>{" "}
                        <span className="font-medium text-gray-700">
                          {task.status}
                        </span>
                      </div>

                      {/* Employee */}
                      <div className="mt-3 text-sm">
                        <span className="text-gray-500">
                          Employee:
                        </span>{" "}
                        <span className="font-medium text-gray-700">
                          {task.assignedEmployee?.username || "Unassigned"}
                        </span>
                      </div>

                      {/* Due Date */}
                      <div className="mt-3 text-sm text-gray-500">
                        📅{" "}
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : "No due date"}
                      </div>


                    </div>

                  ))}

                </div>

              )}

            </div>

          </div>
        )}


        {/* KANBAN */}
        {activePage === "kanban" && !editingTask && (
          <div>

            <KanbanBoard
              tasks={tasks}
              onStatusChange={handleStatusChange}
              onEdit={(task) => {
                handleEdit(task);
                setActivePage("kanban");
              }}
              onDelete={handleDelete}
            />

          </div>
        )}

      </main>
    </div>
  );
}
export default App;