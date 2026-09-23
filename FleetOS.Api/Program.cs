
using FleetOS.Api.Models;
using FleetOS.Api.Services;

namespace FleetOS.Api;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddOpenApi();
        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy.AllowAnyOrigin()
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });

        builder.Services.AddScoped<FleetAnalyticsService>();

        var app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }

        app.UseCors();
        app.UseHttpsRedirection();

        app.MapGet("/api/health", () => new { status = "ok", service = "FleetOS.Api" });

        app.MapGet("/api/dashboard", (FleetAnalyticsService service) => Results.Ok(service.GetDashboard()));

        app.MapGet("/api/vehicles", (FleetAnalyticsService service) => Results.Ok(service.GetVehicles()));

        app.MapGet("/api/trips", (FleetAnalyticsService service) => Results.Ok(service.GetTrips()));

        app.MapGet("/api/maintenance", (FleetAnalyticsService service) => Results.Ok(service.GetMaintenanceItems()));

        app.MapGet("/api/drivers", (FleetAnalyticsService service) => Results.Ok(service.GetDrivers()));

        app.MapGet("/api/alerts", (FleetAnalyticsService service) => Results.Ok(service.GetAlerts()));

        app.MapGet("/api/analytics", (FleetAnalyticsService service) => Results.Ok(service.GetAnalytics()));

        app.MapPost("/api/vehicles", (CreateVehicleRequest request, FleetAnalyticsService service) =>
        {
            if (string.IsNullOrWhiteSpace(request.Plate) || string.IsNullOrWhiteSpace(request.Type))
            {
                return Results.BadRequest(new { error = "Plate and type are required." });
            }

            var vehicle = service.CreateVehicle(request);
            return Results.Ok(vehicle);
        });

        app.MapPost("/api/trips", (CreateTripRequest request, FleetAnalyticsService service) =>
        {
            if (string.IsNullOrWhiteSpace(request.VehicleId) || string.IsNullOrWhiteSpace(request.Origin))
            {
                return Results.BadRequest(new { error = "Vehicle and origin are required." });
            }

            var trip = service.CreateTrip(request);
            return Results.Ok(trip);
        });

        app.MapDelete("/api/trips/{id}", (string id, FleetAnalyticsService service) =>
        {
            return service.DeleteTrip(id) ? Results.NoContent() : Results.NotFound(new { error = "Trip not found." });
        });

        app.MapPost("/api/maintenance", (CreateMaintenanceRequest request, FleetAnalyticsService service) =>
        {
            if (string.IsNullOrWhiteSpace(request.VehicleId) || string.IsNullOrWhiteSpace(request.Title))
            {
                return Results.BadRequest(new { error = "Vehicle and title are required." });
            }

            var item = service.CreateMaintenanceItem(request);
            return Results.Ok(item);
        });

        app.MapGet("/api/ai/fleet-summary", (FleetAnalyticsService service) => Results.Ok(new
        {
            summary = service.GetDashboard().FleetSummary,
            insight = service.GetDashboard().AIInsight
        }));

        app.MapPost("/api/ai/chat", (AIChatRequest request, FleetAnalyticsService service) =>
        {
            if (string.IsNullOrWhiteSpace(request.Question))
            {
                return Results.BadRequest(new { error = "Question is required." });
            }

            var response = service.AnswerQuestion(request.Question);
            return Results.Ok(response);
        });

        app.Run();
    }
}
