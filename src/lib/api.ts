import axios from "axios";

export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && !envUrl.includes("credtrust-api-176626350005.us-central1.run.app") && envUrl !== "http://localhost:3000/api/v1") {
    return envUrl;
  }
  return "https://credtrust-launchpad-git-176626350005.asia-south1.run.app/api/v1";
};

export const getDocUrl = (url: string | null | undefined): string => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/storage/view?path=${encodeURIComponent(url)}`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  // File uploads + cold-start can exceed 30s; keep UX responsive via UI state instead.
  timeout: 120_000,
});

const getMessageText = (value: unknown): string | null => {
  if (Array.isArray(value)) {
    const joined = value.filter(Boolean).join(", ").trim();
    return joined || null;
  }

  if (typeof value === "string") {
    return value.trim() || null;
  }

  return null;
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Request failed. Please try again.",
) => {
  if (axios.isAxiosError(error)) {
    const responseMessage =
      getMessageText(error.response?.data?.message) ||
      getMessageText(error.response?.data?.error);

    if (responseMessage) {
      return responseMessage;
    }

    if (error.code === "ECONNABORTED") {
      return "Upload timed out after 120 seconds. Please try again with smaller files.";
    }

    if (error.response?.status === 413) {
      return "File too large. Max 20 MB per file.";
    }

    if (error.response?.status === 401) {
      return "Your session expired. Please log in again.";
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  // Never allow stale mock tokens to poison API auth.
  if (token?.startsWith("mock-token-")) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const provider = import.meta.env.VITE_AUTH_PROVIDER || "api";
      if (provider === "firebase") {
        // If 401 with Firebase, let the Auth provider handle it
        return Promise.reject(error);
      }
      
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const { data } = await api.post("/auth/refresh", { refreshToken });
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
          error.config.headers = error.config.headers ?? {};
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return api.request(error.config);
        } catch (err) {
          localStorage.clear();
          window.location.href = "/login";
        }
      } else {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
