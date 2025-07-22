import { Calendar, Clock } from "lucide-react";

const eventsData = [
  {
    id: 1,
    title: "Monthly portfolio review meeting",
    time: "09:10",
    date: "Today",
    type: "meeting"
  },
  {
    id: 2,
    title: "Real estate investment opportunity",
    time: "14:30",
    date: "Tomorrow",
    type: "opportunity"
  },
  {
    id: 3,
    title: "Q1 earnings distribution",
    time: "10:00",
    date: "Mar 15",
    type: "earnings"
  }
];

const getEventIcon = (type: string) => {
  const baseClasses = "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm";
  switch (type) {
    case "meeting":
      return `${baseClasses} bg-blue-100`;
    case "opportunity":
      return `${baseClasses} bg-gradient-to-r from-primary to-orange-600`;
    case "earnings":
      return `${baseClasses} bg-green-100`;
    default:
      return `${baseClasses} bg-gray-100`;
  }
};

const getIconColor = (type: string) => {
  switch (type) {
    case "meeting":
      return "text-blue-600";
    case "opportunity":
      return "text-white";
    case "earnings":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
};

export default function UpcomingEvents() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
        <div className="w-8 h-8 bg-gradient-to-r from-primary to-orange-600 rounded-lg flex items-center justify-center">
          <Calendar size={16} className="text-white" />
        </div>
      </div>

      <div className="space-y-4">
        {eventsData.map((event) => (
          <div key={event.id} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-xl transition-colors group">
            <div className={getEventIcon(event.type)}>
              <Calendar size={20} className={getIconColor(event.type)} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                {event.title}
              </p>
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <Clock size={12} className="mr-1" />
                <span>{event.time}</span>
                <span className="mx-2">•</span>
                <span className="px-2 py-1 bg-gray-100 rounded-full">{event.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 text-sm font-medium bg-gradient-to-r from-primary to-orange-600 text-white py-2 px-4 rounded-lg hover:from-primary/90 hover:to-orange-600/90 transition-all shadow-md hover:shadow-lg">
        View all events
      </button>
    </div>
  );
}