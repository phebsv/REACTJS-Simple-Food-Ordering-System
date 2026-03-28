const BASE = "http://localhost:4001";

interface User {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export async function listUsers(): Promise<User[]> {
  const r = await fetch(`${BASE}/users`);
  if (!r.ok) throw new Error("Unable to load users");
  return r.json();
}

export async function createUser(user: User): Promise<User> {
  const r = await fetch(`${BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!r.ok) throw new Error("Unable to create user");
  return r.json();
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const r = await fetch(`${BASE}/users?email=${encodeURIComponent(email)}`);
  if (!r.ok) throw new Error("Unable to search user");
  const users: User[] = await r.json();
  return users[0] || null;
}