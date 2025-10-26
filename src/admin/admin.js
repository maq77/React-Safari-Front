const API_URL = "http://localhost:7179/api";

export const login = async (username, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
};

export const getTrips = async (token) => {
  const res = await fetch(`${API_URL}/trips`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const createTrip = async (trip, token) => {
  const res = await fetch(`${API_URL}/admin/trips`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(trip),
  });
  return res.json();
};
