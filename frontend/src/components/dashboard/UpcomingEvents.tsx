import { Calendar, Clock } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";

export default function UpcomingEvents() {
  const { investments, user: userProfile } = useUser();
  const { user: authUser } = useAuth();

  // Generate dynamic events based on user's investments and profile
  const generateUserEvents = () => {
    const events = [];
    let eventId = 1;

    // Portfolio review event (always show)
    const userName = userProfile?.firstName || authUser?.email?.split('@')[0] || 'User';
    events.push({
      id: eventId++,
      title: `${userName}'s portfolio review meeting`,
      time: "09:00",
      date: "Today",
      type: "meeting"
    });

    // If user has investments, show earnings distribution
    if (investments && investments.length > 0) {
      const activeInvestments = investments.filter(inv => inv.status === 'active');
      if (activeInvestments.length > 0) {
        // Customize event based on user's investment goal
        const eventTitle = userProfile?.investmentGoal === 'income'
          ? "Income distribution event"
          : "Quarterly earnings distribution";

        events.push({
          id: eventId++,
          title: eventTitle,
          time: "14:30",
          date: "Mar 15",
          type: "earnings"
        });
      }
    }

    // Show investment opportunity based on user profile
    let opportunityTitle = "New investment opportunity";

    if (userProfile?.investmentGoal) {
      switch (userProfile.investmentGoal) {
        case 'diversification':
          opportunityTitle = "Portfolio diversification opportunity";
          break;
        case 'fixed_income':
          opportunityTitle = "Fixed income investment opportunity";
          break;
        case 'venture_capital':
          opportunityTitle = "Venture capital opportunity";
          break;
        case 'growth':
          opportunityTitle = "Growth investment opportunity";
          break;
        case 'income':
          opportunityTitle = "Income generating opportunity";
          break;
      }
    } else if (userProfile?.accountType === 'retirement') {
      opportunityTitle = "Retirement portfolio opportunity";
    }

    events.push({
      id: eventId++,
      title: opportunityTitle,
      time: "16:00",
      date: "Tomorrow",
      type: "opportunity"
    });

    return events;
  };

  const eventsData = generateUserEvents();

  const getEventIcon = (type: string) => {
    const baseClasses = "w-10 h-10 rounded-lg flex items-center justify-center shadow-sm";
    switch (type) {
      case "meeting":
        return `${baseClasses} bg-blue-100`;
      case "opportunity":
        return `${baseClasses} bg-primary`;
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Calendar size={16} className="text-white" />
        </div>
      </div>

      <div className="space-y-4">
        {eventsData.map((event) => (
          <div key={event.id} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors group">
            <div className={getEventIcon(event.type)}>
              <Calendar size={20} className={getIconColor(event.type)} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                {event.title}
              </p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <Clock size={12} className="mr-1" />
                <span>{event.time}</span>
                <span className="mx-2">•</span>
                <span className="px-2 py-1 bg-gray-100 rounded-full">{event.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 text-sm font-medium bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors">
        View all events
      </button>
    </div>
  );
}