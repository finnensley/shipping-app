// Centralized API utility for all backend calls
// Determine API URL at runtime: localhost:3000 for local dev, /api for Vercel
import axios from "axios";

function getApiUrl() {
  if (typeof window === "undefined") return ""; // SSR fallback
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return "http://localhost:3000";
  }
  // On Vercel, use /api prefix for all API routes
  return "/api";
}
const API_URL = getApiUrl();
console.log(
  "API_URL initialized:",
  API_URL,
  "hostname:",
  typeof window !== "undefined" ? window.location.hostname : "N/A",
);

// Configure axios to include authorization token in all requests
axios.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Helper to get authorization headers with JWT token
function getAuthHeaders() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export const apiCall = {
  // GET request
  get: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  },

  // POST request
  post: async (endpoint, data) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  },

  // PUT request
  put: async (endpoint, data) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  },

  // DELETE request
  delete: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  },
};

// Public auth endpoints (no /api prefix needed)
export const authCall = {
  post: async (endpoint, data) => {
    const url =
      typeof window !== "undefined" && window.location.hostname !== "localhost"
        ? `/auth${endpoint}` // On Vercel, use /auth directly
        : `http://localhost:3000/auth${endpoint}`; // Locally, use full URL
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Auth Error: ${response.status} - ${error}`);
    }
    return response.json();
  },
};

export default API_URL;
