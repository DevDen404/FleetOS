using FleetOS.Api.Services;

namespace FleetOS.Api.Tests;

public class FleetAnalyticsServiceTests
{
    [Fact]
    public void GetDashboard_ContainsOperationalFleetSummary()
    {
        var service = new FleetAnalyticsService();

        var dashboard = service.GetDashboard();

        Assert.NotNull(dashboard);
        Assert.NotEmpty(dashboard.Kpis);
        Assert.NotEmpty(dashboard.LiveVehicles);
        Assert.Contains("Fleet utilization is healthy", dashboard.FleetSummary);
    }

    [Fact]
    public void AnswerQuestion_ForIdleVehicles_RespondsWithIdleContext()
    {
        var service = new FleetAnalyticsService();

        var response = service.AnswerQuestion("Show me idle vehicles");

        Assert.Contains("idle", response.Answer, StringComparison.OrdinalIgnoreCase);
    }
}