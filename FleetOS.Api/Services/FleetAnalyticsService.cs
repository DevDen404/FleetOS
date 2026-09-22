using FleetOS.Api.Models;

namespace FleetOS.Api.Services;

public class FleetAnalyticsService
{
    private readonly List<FleetVehicle> _vehicles;
    private readonly List<FleetAlert> _alerts;
    private readonly List<FleetTrip> _trips;
    private readonly List<FleetMaintenanceItem> _maintenanceItems;
    private readonly List<FleetDriver> _drivers;

    public FleetAnalyticsService()
    {
        _vehicles =
        [
            new("VH-204", "UP32 AB 1234", "Volvo FH16", "On trip", "Maya Patel", 64, 71, "#f2a93b", 2, 28.6139, 77.2090),
            new("VH-118", "DL01 MJ 7712", "Tata Prima", "Idle", "Noah Williams", 0, 38, "#8b98aa", 5, 28.7041, 77.1025),
            new("VH-087", "MH12 RT 4409", "Ashok Leyland", "On trip", "Arjun Rao", 52, 84, "#f2a93b", 1, 19.0760, 72.8777),
            new("VH-331", "KA05 NK 9081", "BharatBenz 2823", "Attention", "Sofia Chen", 0, 19, "#f05c68", 12, 13.0827, 80.2707),
            new("VH-219", "GJ03 PQ 1189", "Eicher Pro 6048", "Available", "Ravi Sharma", 0, 57, "#4dc4a0", 17, 22.7196, 75.8577),
            new("VH-442", "TN07 SX 2943", "Mahindra Truxo", "On trip", "Priya Nair", 58, 61, "#f2a93b", 4, 13.0674, 80.2376),
            new("VH-510", "AP05 KL 7710", "Ashok Leyland", "Idle", "Daniel Moss", 0, 42, "#8b98aa", 7, 17.3850, 78.4867)
        ];

        _alerts =
        [
            new("AL-301", "Fuel anomaly detected", "VH-204 is 18% above baseline fuel consumption for the week.", "High", "Open", "VH-204", "Maya Patel", "2026-09-22T07:40:00Z"),
            new("AL-204", "Maintenance overdue", "VH-331 service due 3 days ago with repeated fault events.", "Critical", "Open", "VH-331", "Sofia Chen", "2026-09-22T06:15:00Z"),
            new("AL-119", "Idle duration threshold crossed", "VH-118 has been stationary for 2h 14m beyond expected idle window.", "Medium", "Open", "VH-118", "Noah Williams", "2026-09-22T05:45:00Z"),
            new("AL-118", "Overspeed alert", "VH-087 exceeded 80 km/h during city corridor travel.", "High", "Open", "VH-087", "Arjun Rao", "2026-09-22T04:30:00Z")
        ];

        _trips =
        [
            new("TR-4101", "VH-204", "Maya Patel", "Delhi", "Jaipur", "On trip", 610, 390),
            new("TR-4102", "VH-087", "Arjun Rao", "Mumbai", "Pune", "On trip", 160, 160),
            new("TR-4103", "VH-442", "Priya Nair", "Bengaluru", "Hyderabad", "On trip", 570, 360),
            new("TR-4104", "VH-219", "Ravi Sharma", "Lucknow", "Kanpur", "Completed", 190, 130)
        ];

        _maintenanceItems =
        [
            new("MT-801", "VH-331", "Brake inspection overdue", "Scheduled", "Critical", "2026-09-24", "Brake wear and fault event repeating across three trips."),
            new("MT-802", "VH-204", "Fuel system diagnostic", "In progress", "High", "2026-09-23", "Efficiency drift triggered inspection and route review."),
            new("MT-803", "VH-118", "Idle cooling cycle review", "Scheduled", "Medium", "2026-09-25", "Long idle period above operating threshold.")
        ];

        _drivers =
        [
            new("DR-101", "Maya Patel", "On trip", "+91 98765 12041", "VH-204", 128, 96.4, 38, "North corridor"),
            new("DR-102", "Noah Williams", "Idle", "+91 98765 12042", "VH-118", 94, 91.8, 31, "Delhi NCR"),
            new("DR-103", "Arjun Rao", "On trip", "+91 98765 12043", "VH-087", 117, 88.6, 42, "West corridor"),
            new("DR-104", "Sofia Chen", "Attention", "+91 98765 12044", "VH-331", 86, 84.2, 35, "South corridor"),
            new("DR-105", "Ravi Sharma", "Available", "+91 98765 12045", "VH-219", 109, 94.7, 27, "Central corridor"),
            new("DR-106", "Priya Nair", "On trip", "+91 98765 12046", "VH-442", 131, 97.1, 40, "South corridor"),
            new("DR-107", "Daniel Moss", "Idle", "+91 98765 12047", "VH-510", 76, 89.5, 29, "East corridor")
        ];

    }

    public List<FleetVehicle> GetVehicles() => _vehicles;

    public List<FleetTrip> GetTrips() => _trips;

    public List<FleetMaintenanceItem> GetMaintenanceItems() => _maintenanceItems;

    public List<FleetAlert> GetAlerts() => _alerts;

    public List<FleetDriver> GetDrivers() => _drivers;

    public FleetAnalytics GetAnalytics()
    {
        var dashboard = GetDashboard();
        return new FleetAnalytics(74.2, 8.1, 7.55, _trips.Count(trip => trip.Status == "On trip"), _alerts.Count(alert => alert.Status == "Open"), _maintenanceItems.Count(item => item.Status != "Completed"), dashboard.Utilization, dashboard.FuelTrend, dashboard.StatusBreakdown);
    }

    public FleetVehicle CreateVehicle(CreateVehicleRequest request)
    {
        var vehicle = new FleetVehicle(
            Id: $"VH-{_vehicles.Count + 200}",
            Plate: request.Plate,
            Type: request.Type,
            Status: request.Status,
            Driver: request.Driver,
            Speed: request.Speed,
            FuelLevel: request.FuelLevel,
            Color: request.Color ?? "#4dc4a0",
            MaintenanceDueDays: request.MaintenanceDueDays,
            Latitude: request.Latitude,
            Longitude: request.Longitude);

        _vehicles.Add(vehicle);
        return vehicle;
    }

    public FleetTrip CreateTrip(CreateTripRequest request)
    {
        var trip = new FleetTrip(
            Id: $"TR-{_trips.Count + 4100}",
            VehicleId: request.VehicleId,
            Driver: request.Driver,
            Origin: request.Origin,
            Destination: request.Destination,
            Status: request.Status,
            DistanceKm: request.DistanceKm,
            DurationMinutes: request.DurationMinutes);

        _trips.Add(trip);
        return trip;
    }

    public FleetMaintenanceItem CreateMaintenanceItem(CreateMaintenanceRequest request)
    {
        var item = new FleetMaintenanceItem(
            Id: $"MT-{_maintenanceItems.Count + 800}",
            VehicleId: request.VehicleId,
            Title: request.Title,
            Status: request.Status,
            Severity: request.Severity,
            DueDate: request.DueDate,
            Notes: request.Notes);

        _maintenanceItems.Add(item);
        return item;
    }

    public DashboardResponse GetDashboard()
    {
        var activeTrips = _trips.Count(t => t.Status == "On trip");
        var openAlerts = _alerts.Count(a => a.Status == "Open");
        var maintenanceDue = _vehicles.Count(v => v.MaintenanceDueDays > 7 || v.FuelLevel < 25 || v.Status == "Attention");
        var totalVehicles = _vehicles.Count;
        var utilization = 74.2;

        return new DashboardResponse(
            Kpis:
            [
                new("Total vehicles", totalVehicles.ToString(), "+4.8%", "vs last month", "blue"),
                new("On active trips", activeTrips.ToString(), "+12.5%", "vs yesterday", "amber"),
                new("Fleet utilization", $"{utilization:F1}%", "+3.1%", "vs last week", "green"),
                new("Open alerts", openAlerts.ToString(), "2 new", "needs attention", "red")
            ],
            Utilization:
            [
                new("Mon", 58, 19, 0),
                new("Tue", 66, 15, 0),
                new("Wed", 62, 22, 0),
                new("Thu", 74, 13, 0),
                new("Fri", 81, 17, 0),
                new("Sat", 71, 12, 0),
                new("Sun", 48, 9, 0)
            ],
            FuelTrend:
            [
                new("01", 0, 0, 7.4),
                new("05", 0, 0, 7.1),
                new("09", 0, 0, 7.5),
                new("13", 0, 0, 7.8),
                new("17", 0, 0, 8.2),
                new("21", 0, 0, 7.9),
                new("25", 0, 0, 8.5),
                new("29", 0, 0, 8.1)
            ],
            StatusBreakdown:
            [
                new("On trip", 24, "#e8a13a"),
                new("Available", 11, "#4dc4a0"),
                new("Idle", 7, "#8391a5"),
                new("Attention", 3, "#e76872")
            ],
            LiveVehicles: _vehicles,
            Alerts: _alerts,
            RecentActivity:
            [
                new("Overspeed alert", "VH-087 exceeded 80 km/h during city corridor travel.", "8 min ago", "red"),
                new("Trip completed", "VH-204 · Delhi to Jaipur completed successfully.", "21 min ago", "green"),
                new("Service scheduled", "VH-119 · Scheduled for tomorrow, 09:30.", "1 hr ago", "amber")
            ],
            FleetSummary: "Fleet utilization is healthy at 74%. 24 vehicles are currently on trips, while 3 vehicles require attention. The main risks are elevated fuel consumption in 2 vehicles and one overdue maintenance record.",
            AIInsight: "The largest operational risk is fuel efficiency drift on VH-204 and VH-087, while VH-331 needs maintenance attention due to low fuel and overdue service intervals."
        );
    }

    public AIChatResponse AnswerQuestion(string question)
    {
        var normalized = question?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(normalized))
        {
            return new AIChatResponse("", "I can analyze the live fleet data. Try asking about fuel consumption, idle vehicles, fleet health, or vehicles that need attention.", ["Fleet health summary", "Fuel anomalies", "Idle vehicles"]);
        }

        var lower = normalized.ToLowerInvariant();

        if (lower is "hi" or "hello" or "hey" || lower.StartsWith("hi ") || lower.StartsWith("hello "))
        {
            return new AIChatResponse(normalized, "Hello. I can help with live vehicles, open alerts, maintenance schedules, trips, fuel efficiency, and fleet health. What would you like to inspect?", ["Show open alerts", "Review maintenance schedule", "Give me a fleet health summary"]);
        }

        if (lower.Contains("alert") || lower.Contains("maintenance") || lower.Contains("service") || lower.Contains("schedule"))
        {
            var openAlerts = _alerts.Count(alert => alert.Status == "Open");
            var scheduledMaintenance = _maintenanceItems.Count(item => item.Status == "Scheduled");
            var criticalMaintenance = _maintenanceItems.Count(item => item.Severity == "Critical");
            return new AIChatResponse(normalized, $"There are {openAlerts} open alerts and {scheduledMaintenance} scheduled maintenance items. {criticalMaintenance} maintenance item is critical: VH-331 has a brake inspection due on 2026-09-24. The other active work is VH-204's fuel system diagnostic and VH-118's idle cooling review.", ["Open alerts", "Review maintenance queue", "Inspect VH-331"]);
        }

        if (lower.Contains("attention") || lower.Contains("need") && lower.Contains("vehicle"))
        {
            return new AIChatResponse(normalized, "I found 3 vehicles that need attention. VH-331 is low on fuel at 19% and has an overdue service. VH-204 and VH-087 are showing fuel consumption above the fleet baseline.", ["Review VH-331", "Check fuel trend", "Open maintenance queue"]);
        }

        if (lower.Contains("fuel") || lower.Contains("consumption"))
        {
            return new AIChatResponse(normalized, "Fuel efficiency is 8.1 L/100km this month, 7.2% above the fleet baseline. VH-204 is the largest outlier at 9.6 L/100km, followed by VH-087 at 9.1 L/100km.", ["Inspect VH-204", "Review driver behavior", "View fuel report"]);
        }

        if (lower.Contains("idle") || lower.Contains("stationary"))
        {
            return new AIChatResponse(normalized, "7 vehicles are currently idle. VH-118 has been stationary for 2h 14m, making it the longest idle vehicle. Estimated avoidable idle cost today is $184.", ["Review idle vehicles", "Check route plan", "Notify dispatch"]);
        }

        if (lower.Contains("health") || lower.Contains("summary"))
        {
            return new AIChatResponse(normalized, "Fleet utilization is healthy at 74%. 24 vehicles are currently on trips, while 3 vehicles require attention. The main risks are elevated fuel consumption in 2 vehicles and one overdue maintenance record.", ["Open fleet summary", "Review maintenance", "View alerts"]);
        }

        return new AIChatResponse(normalized, "I can analyze the live fleet data. Try asking about fuel consumption, idle vehicles, fleet health, or vehicles that need attention.", ["Fleet health summary", "Fuel anomalies", "Idle vehicles"]);
    }
}
