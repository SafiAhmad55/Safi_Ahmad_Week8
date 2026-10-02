function MeetingList({ meetings, onEdit, onDelete }) {
  const now = new Date();

  const upcomingMeetings = meetings.filter(
    (meeting) => new Date(meeting.date) >= now
  );

  const previousMeetings = meetings.filter(
    (meeting) => new Date(meeting.date) < now
  );

  const MeetingCard = ({ meeting }) => (
    <div className="bg-white border rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            {meeting.title}
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Project: {meeting.project?.name || "Unknown Project"}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            meeting.status === "Scheduled"
              ? "bg-blue-100 text-blue-700"
              : meeting.status === "Completed"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {meeting.status}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <p>
          📅 <strong>Date:</strong>{" "}
          {new Date(meeting.date).toLocaleDateString()}
        </p>

        <p>
          🕐 <strong>Time:</strong> {meeting.time}
        </p>

        <p>
          👥 <strong>Participants:</strong>{" "}
          {meeting.participants?.length || 0}
        </p>

        {meeting.notes && (
          <p>
            📝 <strong>Notes:</strong> {meeting.notes}
          </p>
        )}
      </div>

      <div className="flex gap-2 mt-5">
        <button
          onClick={() => onEdit(meeting)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(meeting._id)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">

      {/* Upcoming Meetings */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Upcoming Meetings
        </h2>

        {upcomingMeetings.length === 0 ? (
          <p className="text-gray-500">
            No upcoming meetings.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {upcomingMeetings.map((meeting) => (
              <MeetingCard
                key={meeting._id}
                meeting={meeting}
              />
            ))}
          </div>
        )}
      </section>

      {/* Previous Meetings */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Previous Meetings
        </h2>

        {previousMeetings.length === 0 ? (
          <p className="text-gray-500">
            No previous meetings.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {previousMeetings.map((meeting) => (
              <MeetingCard
                key={meeting._id}
                meeting={meeting}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

export default MeetingList;