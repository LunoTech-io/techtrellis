const API_URL = import.meta.env.VITE_API_URL || "";

export async function fetchMeta() {
  const res = await fetch(`${API_URL}/api/meta`);
  if (!res.ok) throw new Error("Failed to fetch meta");
  return res.json();
}

export async function fetchAllContent() {
  const res = await fetch(`${API_URL}/api/content`);
  if (!res.ok) throw new Error("Failed to fetch content");
  return res.json();
}
