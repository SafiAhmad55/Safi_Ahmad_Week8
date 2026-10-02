import { useEffect, useState } from "react";
import MeetingForm from "./MeetingForm";
import MeetingList from "./MeetingList";

function MeetingScheduler() {
  const [meetings, setMeetings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = async () => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
         "http://localhost:5001/api/meetings",
       {
          headers: {
           Authorization: `Bearer ${token}`,
         },
         }
      );

      const data = await response.json();

      if (response.ok) {
        setMeetings(data);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  const fetchProjects = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:5001/api/projects",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log("Projects from API:", data);

    if (response.ok) {
  setProjects(data.projects);
   } else {
      console.error("Failed to fetch projects:", data);
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
};

  const fetchEmployees = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:5001/api/auth/employees",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log("Employees from API:", data);

    if (response.ok) {
      setEmployees(data.employees);
    } else {
      console.error("Failed to fetch employees:", data);
    }
  } catch (error) {
    console.error("Error fetching employees:", error);
  }
};

  const loadData = async () => {
    setLoading(true);

    await Promise.all([
      fetchMeetings(),
      fetchProjects(),
      fetchEmployees(),
    ]);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMeetingSaved = async () => {
    setEditingMeeting(null);
    await fetchMeetings();
  };

  const handleEdit = (meeting) => {
    setEditingMeeting(meeting);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this meeting?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
      `http://localhost:5001/api/meetings/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );


      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete meeting");
        return;
      }

      alert("Meeting deleted successfully");

      await fetchMeetings();
    } catch (error) {
      console.error("Error deleting meeting:", error);
      
    }
  };

  const handleCancelEdit = () => {
    setEditingMeeting(null);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">
          Loading Meeting Scheduler...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Meeting Scheduler
        </h1>

        <p className="text-gray-500 mt-1">
          Schedule and manage project meetings.
        </p>
      </div>

      {/* Meeting Form */}
      <MeetingForm
        projects={projects}
        employees={employees}
        onMeetingSaved={handleMeetingSaved}
        editingMeeting={editingMeeting}
        onCancelEdit={handleCancelEdit}
      />

      {/* Meeting List */}
      <MeetingList
        meetings={meetings}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

    </div>
  );
}

export default MeetingScheduler;