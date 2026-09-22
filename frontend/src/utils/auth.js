export function getSession() {
  try {
    return JSON.parse(localStorage.getItem("fleetos-session") || "null");
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem("fleetos-session");
}
