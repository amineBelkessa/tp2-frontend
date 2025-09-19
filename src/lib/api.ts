import axios from "axios";

console.log('BASE_URL =', (import.meta as any).env?.VITE_API_BASE_URL);

export const api = axios.create({
  baseURL:
    (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, "") ||
    "http://localhost:8080",
  timeout: 30000,
});


export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status ?? 0;
    const msg =
      status === 400 ? "Requête invalide (400)."
      : status === 401 ? "Non authentifié (401)."
      : status === 403 ? "Accès interdit (403)."
      : status === 404 ? "Ressource introuvable (404)."
      : status >= 500 ? "Erreur serveur (5xx)."
      : err?.message ?? "Erreur réseau";
    return Promise.reject(new ApiError(status, msg));
  }
);

export type Page<T> = {
  content: T[];
  page?: number;
  number?: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

