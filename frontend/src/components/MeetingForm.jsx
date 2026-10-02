import { useEffect, useState } from "react";

function MeetingForm({
  projects,
  employees,
  onMeetingSaved,
  editingMeeting,
  onCancelEdit,
}) {
  const [formData, setFormData] = useState({
    title: "",
    project: "",
    date: "",
    time: "",
    participants: [],
    status: "Scheduled",
    notes: "",
  });

  useEffect(() => {
    if (editingMeeting) {
      setFormData({
        title: editingMeeting.title || "",
        project: editingMeeting.project?._id || editingMeeting.project || "",
        date: editingMeeting.date
          ? new Date(editingMeeting.date).toISOString().split("T")[0]
          : "",
        time: editingMeeting.time || "",
        participants:
          editingMeeting.participants?.map((user) => user._id || user) || [],
        status: editingMeeting.status || "Scheduled",
        notes: editingMeeting.notes || "",
      });
    }
  }, [editingMeeting]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleParticipantsChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );

    setFormData({
      ...formData,
      participants: selectedOptions,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const url = editingMeeting
    ? `http://localhost:5001/api/meetings/${editingMeeting._id}`
    : "http://localhost:5001/api/meetings";

  const method = editingMeeting ? "PUT" : "POST";

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Something went wrong");
      return;
    }

    alert(
      editingMeeting
        ? "Meeting updated successfully"
        : "Meeting created successfully"
    );

    if (onMeetingSaved) {
      onMeetingSaved(data.meeting);
    }

    setFormData({
      title: "",
      project: "",
      date: "",
      time: "",
      participants: [],
      status: "Scheduled",
      notes: "",
    });
  } catch (error) {
    console.error("Error saving meeting:", error);
    alert("Failed to save meeting");
  }
};

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-md space-y-5 max-w-5xl"
    >
      <h2 className="text-xl font-bold">
        {editingMeeting ? "Update Meeting" : "Create Meeting"}
      </h2>
      <div>
       <label className="block text-sm font-medium text-gray-700 mb-1">
           Meeting Title
       </label>

       <input
        type="text"
        name="title"
        placeholder="Enter meeting title"
        value={formData.title}
        onChange={handleChange}
        required
       className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      </div>

     <div>
       <label className="block text-sm font-medium text-gray-700 mb-1">
           projects:
       </label>
      <select
        name="project"
        value={formData.project}
        onChange={handleChange}
        required
        className="w-full border rounded-lg p-2"
      >
        <option value="">Select Project</option>

        {projects.map((project) => (
          <option key={project._id} value={project._id}>
            {project.name}
          </option>
        ))}
      </select>
     </div>

      <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
     Meeting Date
   </label>

   <input
    type="date"
    name="date"
    value={formData.date}
    onChange={handleChange}
    required
    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />


        
    <label className="block text-sm font-medium text-gray-700 mb-1">
     Meeting Time
    </label>

     <input
      type="time"
      name="time"
      value={formData.time}
      onChange={handleChange}
      required
      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
   </div>

  <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Participants
  </label>

  <select
    multiple
    value={formData.participants}
    onChange={handleParticipantsChange}
    className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    {employees.length === 0 ? (
      <option disabled>
        No employees available
      </option>
    ) : (
      employees.map((employee) => (
        <option key={employee._id} value={employee._id}>
          {employee.username} ({employee.email})
        </option>
      ))
    )}
  </select>

  <p className="text-xs text-gray-500 mt-1">
    Hold Ctrl to select multiple team members.
  </p>
</div>

      <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Meeting Status
  </label>

  <select
    name="status"
    value={formData.status}
    onChange={handleChange}
    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="Scheduled">Scheduled</option>
    <option value="Completed">Completed</option>
    <option value="Cancelled">Cancelled</option>
  </select>
  </div>
    <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Meeting Notes
  </label>

  <textarea
    name="notes"
    placeholder="Enter meeting notes..."
    value={formData.notes}
    onChange={handleChange}
    rows="4"
    className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
   </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          {editingMeeting ? "Update Meeting" : "Create Meeting"}
        </button>

        {editingMeeting && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default MeetingForm;