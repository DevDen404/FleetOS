export const tripFormSchemaVersion = 1;

export const tripFormFields = [
  { id: "vehicleId", label: "Vehicle", type: "select", required: true },
  { id: "driver", label: "Driver", type: "text", required: true },
  { id: "origin", label: "Origin", type: "text", required: true },
  { id: "destination", label: "Destination", type: "text", required: true },
  { id: "status", label: "Status", type: "select", required: true },
  { id: "distanceKm", label: "Distance (km)", type: "number", required: true },
  { id: "durationMinutes", label: "Duration (minutes)", type: "number", required: true },
];

export function getDefaultTripFormVersions() {
  return [{
    id: 1,
    name: "Trip intake v1",
    version: 1,
    status: "Published",
    updated: "Today",
    fields: tripFormFields.map((field) => ({ ...field })),
  }];
}

export function getStoredTripFormVersions() {
  const storedSchemaVersion = Number(localStorage.getItem("fleetos-trip-form-schema-version"));
  if (storedSchemaVersion !== tripFormSchemaVersion) {
    const defaults = getDefaultTripFormVersions();
    localStorage.setItem("fleetos-trip-form-versions", JSON.stringify(defaults));
    localStorage.setItem("fleetos-trip-form-live-version", "1");
    localStorage.setItem("fleetos-trip-form-schema-version", String(tripFormSchemaVersion));
    return defaults;
  }

  try {
    const stored = JSON.parse(localStorage.getItem("fleetos-trip-form-versions") || "null");
    return Array.isArray(stored) && stored.length ? stored : getDefaultTripFormVersions();
  } catch {
    return getDefaultTripFormVersions();
  }
}
