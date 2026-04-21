const API = process.env.NEXT_PUBLIC_API_URL!;

export async function apiFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Ralat tidak diketahui." }));
    throw new Error(err.message || "Ralat pelayan.");
  }
  return res.json();
}
