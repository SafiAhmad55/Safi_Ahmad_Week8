import { useEffect, useState } from "react";

const API_URL = "http://localhost:5001/api/files";
const PROJECTS_URL = "http://localhost:5001/api/projects";

function FileManagement() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // Fetch projects
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(PROJECTS_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setProjects(data.projects || []);
      } else {
        setMessage(data.message || "Failed to fetch projects.");
      }
    } catch (error) {
      setMessage("Failed to connect to the server.");
    }
  };

  // Fetch files for selected project
  const fetchFiles = async (projectId) => {
    if (!projectId) {
      setFiles([]);
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/project/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setFiles(data.files || []);
      } else {
        setMessage(data.message || "Failed to fetch files.");
      }
    } catch (error) {
      setMessage("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (e) => {
    const projectId = e.target.value;

    setSelectedProject(projectId);
    setSelectedFile(null);
    fetchFiles(projectId);
  };
  const handleFileChange = (e) => {
  const file = e.target.files[0];

  if (!file) {
    setSelectedFile(null);
    return;
  }

  const allowedExtensions = [
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".jpg",
    ".jpeg",
    ".png",
    ".zip",
  ];

  const extension =
    "." + file.name.split(".").pop().toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    setSelectedFile(null);

    setMessage(
      "Invalid file type. Please select PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, or ZIP."
    );

    e.target.value = "";
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    setSelectedFile(null);

    setMessage("File size cannot exceed 10 MB.");

    e.target.value = "";
    return;
  }

  setMessage("");
  setSelectedFile(file);
};

  // Upload file
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedProject) {
      setMessage("Please select a project.");
      return;
    }

    if (!selectedFile) {
      setMessage("Please select a file.");
      return;
    }

    const formData = new FormData();

    formData.append("project", selectedProject);
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("File uploaded successfully.");
        setSelectedFile(null);

        document.getElementById("fileInput").value = "";

        fetchFiles(selectedProject);
      } else {
        setMessage(data.message || "Failed to upload file.");
      }
    } catch (error) {
      setMessage("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };
         // View file
         const handleView = async (fileId) => {
         try {
          const response = await fetch(
         `${API_URL}/view/${fileId}`,
        {
           headers: {
          Authorization: `Bearer ${token}`,
           },
         }
        );

          if (!response.ok) {
          const data = await response.json();
          setMessage(data.message || "Failed to view file.");
          return;
          }

         const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);

         window.open(url, "_blank");

         // Release the object URL after opening
         setTimeout(() => {
        window.URL.revokeObjectURL(url);
        }, 1000);
      } catch (error) {
      setMessage("Failed to view file.");
   }
};
  // Download file
  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(
        `${API_URL}/download/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setMessage(data.message || "Failed to download file.");
        return;
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMessage("Failed to download file.");
    }
  };

  // Delete file
  const handleDelete = async (fileId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this file?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_URL}/${fileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("File deleted successfully.");
        fetchFiles(selectedProject);
      } else {
        setMessage(data.message || "Failed to delete file.");
      }
    } catch (error) {
      setMessage("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Project File Management
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Upload, view, download, and delete project files.
        </p>
      </div>

      {/* Project Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Project
        </label>

        <select
          value={selectedProject}
          onChange={handleProjectChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select a Project --</option>

          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* Upload */}
      {selectedProject && (
        <form
          onSubmit={handleUpload}
          className="border border-gray-200 rounded-lg p-5 mb-6 bg-gray-50"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Upload File
          </h3>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
               <label
                htmlFor="fileInput"
                 className="inline-block bg-gray-700 text-white px-5 py-2.5 rounded-lg cursor-pointer hover:bg-gray-800"
                >
              Choose File
               </label>
               <input
               id="fileInput"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"
                onChange={handleFileChange}
                className="hidden"
               />

              <span className="ml-4 text-sm text-gray-600">
               {selectedFile ? selectedFile.name : "No file chosen"}
               </span>
              </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Maximum file size: 10 MB
          </p>
        </form>
      )}

      {/* Message */}
      {message && (
        <div className="mb-5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-3">
          {message}
        </div>
      )}

            {/* Files */}
      {selectedProject && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Project Files
          </h3>

          {loading && files.length === 0 ? (
            <p className="text-gray-500">Loading files...</p>
          ) : files.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
              No files uploaded for this project.
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file._id}
                  className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  {/* File Information */}
                  <div>
                    <p className="font-medium text-gray-800">
                      {file.fileName}
                    </p>

                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-500">
                        Project:{" "}
                        <span className="font-medium text-gray-700">
                          {file.project?.name || "Unknown"}
                        </span>
                      </p>

                      <p className="text-sm text-gray-500">
                        Uploaded by:{" "}
                        <span className="font-medium text-gray-700">
                          {file.uploadedBy?.username || "Unknown"}
                        </span>
                      </p>

                      <p className="text-sm text-gray-500">
                        Upload date:{" "}
                        <span className="font-medium text-gray-700">
                          {new Date(file.uploadDate).toLocaleString()}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* File Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(file._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      View
                    </button>

                    <button
                      onClick={() =>
                        handleDownload(file._id, file.fileName)
                      }
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Download
                    </button>

                    <button
                      onClick={() => handleDelete(file._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
        );
}

export default FileManagement;