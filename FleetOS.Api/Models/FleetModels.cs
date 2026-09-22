namespace FleetOS.Api.Models;

public record KpiCard(string Label, string Value, string Change, string Note, string Tone);

public record FleetVehicle(
    string Id,
    string Plate,
    string Type,
    string Status,
    string Driver,
    int Speed,
    int FuelLevel,
    string Color,
    int MaintenanceDueDays,
    double Latitude,
    double Longitude);

public record FleetAlert(
    string Id,
    string Title,
    string Detail,
    string Severity,
    string Status,
    string VehicleId,
    string Driver,
    string Timestamp);

public record FleetTrip(
    string Id,
    string VehicleId,
    string Driver,
    string Origin,
    string Destination,
    string Status,
    int DistanceKm,
    int DurationMinutes);

public record FleetMaintenanceItem(
    string Id,
    string VehicleId,
    string Title,
    string Status,
    string Severity,
    string DueDate,
    string Notes);

public record FleetDriver(
    string Id,
    string Name,
    string Status,
    string Phone,
    string AssignedVehicle,
    int TripsCompleted,
    double SafetyScore,
    int HoursThisWeek,
    string Region);

public record FleetAnalytics(
    double Utilization,
    double FuelEfficiency,
    double FuelBaseline,
    int ActiveTrips,
    int OpenAlerts,
    int MaintenanceDue,
    List<ChartPoint> UtilizationTrend,
    List<ChartPoint> FuelTrend,
    List<StatusBreakdown> VehicleStatus);

public record DashboardResponse(
    List<KpiCard> Kpis,
    List<ChartPoint> Utilization,
    List<ChartPoint> FuelTrend,
    List<StatusBreakdown> StatusBreakdown,
    List<FleetVehicle> LiveVehicles,
    List<FleetAlert> Alerts,
    List<ActivityItem> RecentActivity,
    string FleetSummary,
    string AIInsight);

public record ChartPoint(string Day, double Trips, double Idle, double Value);

public record StatusBreakdown(string Name, int Value, string Color);

public record ActivityItem(string Title, string Detail, string Time, string Tone);

public record AIChatRequest(string Question);

public record AIChatResponse(string Question, string Answer, List<string> SuggestedActions);

public record CreateVehicleRequest(
    string Plate,
    string Type,
    string Status,
    string Driver,
    int Speed,
    int FuelLevel,
    string? Color,
    int MaintenanceDueDays,
    double Latitude,
    double Longitude);

public record CreateTripRequest(
    string VehicleId,
    string Driver,
    string Origin,
    string Destination,
    string Status,
    int DistanceKm,
    int DurationMinutes);

public record CreateMaintenanceRequest(
    string VehicleId,
    string Title,
    string Status,
    string Severity,
    string DueDate,
    string Notes);
