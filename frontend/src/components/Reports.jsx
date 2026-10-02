import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const Reports = () => {
  const PROJECT_COLORS = ["#22c55e", "#8b5cf6"];
const TASK_COLORS = ["#14b8a6", "#ef4444"];  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5001/api/reports",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setReport(data);
      } else {
        console.error("Failed to fetch reports:", data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading reports...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <p className="text-red-500">
          Failed to load reports.
        </p>
      </div>
    );
  }

  const projectChartData = [
    {
      name: "Active Projects",
      value: report.projects.active,
    },
    {
      name: "Completed Projects",
      value: report.projects.completed,
    },
  ];

  const taskChartData = [
    {
      name: "Completed",
      value: report.tasks.completed,
    },
    {
      name: "Pending",
      value: report.tasks.pending,
    },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">
          Project Reports
        </h2>

        <p className="text-gray-500 mt-1">
          Overview of projects, tasks, and progress
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">

        <div className="bg-white p-5 rounded-xl shadow-md">
          <p className="text-gray-500 text-sm">
            Total Projects
          </p>
          <h3 className="text-3xl font-bold text-blue-600 mt-2">
            {report.projects.total}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-md">
          <p className="text-gray-500 text-sm">
            Active Projects
          </p>
          <h3 className="text-3xl font-bold text-green-600 mt-2">
            {report.projects.active}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-md">
          <p className="text-gray-500 text-sm">
            Completed Projects
          </p>
          <h3 className="text-3xl font-bold text-purple-600 mt-2">
            {report.projects.completed}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-md">
          <p className="text-gray-500 text-sm">
            Total Tasks
          </p>
          <h3 className="text-3xl font-bold text-orange-600 mt-2">
            {report.tasks.total}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-md">
          <p className="text-gray-500 text-sm">
            Completed Tasks
          </p>
          <h3 className="text-3xl font-bold text-teal-600 mt-2">
            {report.tasks.completed}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-md">
          <p className="text-gray-500 text-sm">
            Pending Tasks
          </p>
          <h3 className="text-3xl font-bold text-red-600 mt-2">
            {report.tasks.pending}
          </h3>
        </div>

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Project Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Project Status
          </h3>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {projectChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PROJECT_COLORS[index]}
                   />
                   ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Task Status
          </h3>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskChartData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Legend />
              <Bar dataKey="value" name="Tasks">
              {taskChartData.map((entry, index) => (
              <Cell
              key={`cell-${index}`}
              fill={TASK_COLORS[index]}
                />
               ))}
              </Bar>
                

              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Project Progress */}
      <div className="bg-white p-6 rounded-xl shadow-md">

        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          Project Progress
        </h3>

        <div className="space-y-6">

          {report.projectProgress.length === 0 ? (
            <p className="text-gray-500">
              No projects available.
            </p>
          ) : (
            report.projectProgress.map((project) => (
              <div key={project.projectId}>

                <div className="flex justify-between items-center mb-2">

                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {project.projectName}
                    </h4>

                    <p className="text-sm text-gray-500">
                      {project.status} •{" "}
                      {project.completedTasks} /{" "}
                      {project.totalTasks} tasks completed
                    </p>
                  </div>

                  <span className="font-semibold text-blue-600">
                    {project.progress}%
                  </span>

                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">

                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{
                      width: `${project.progress}%`,
                    }}
                  ></div>

                </div>

              </div>
            ))
          )}

        </div>

      </div>

    </div>
  );
};

export default Reports;