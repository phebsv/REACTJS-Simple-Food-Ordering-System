type ApiError = {
  message?: string;
};

export type AuthUser = {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: string;
  agreeToTerms?: boolean;
  createdAt?: string;
  role?: "admin" | "user";
  isAdmin?: boolean;
};

export type AuthResponse = {
  message: string;
  user: AuthUser;
  token: string;
};

const JSON_SERVER_BASE = "http://localhost:3001";

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }

  let errorMessage = "Request failed";
  try {
    const data = (await response.json()) as ApiError;
    if (data?.message) {
      errorMessage = data.message;
    }
  } catch {
    // Ignore json parse errors
  }

  throw new Error(errorMessage);
}

export async function registerUser(payload: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  agreeToTerms: boolean;
}): Promise<AuthResponse> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<AuthResponse>(response);
}

export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<AuthResponse>(response);
}

export async function loginCustomer(email: string, password: string) {
  const data = await loginUser({ email, password });
  return { data };
}

export async function registerCustomer(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}) {
  const [firstName, ...rest] = String(data.name || "")
    .trim()
    .split(" ");
  const lastName = rest.join(" ");
  const payload = {
    firstName: firstName || "Customer",
    lastName: lastName || "User",
    email: data.email,
    phoneNumber: data.phone || "",
    password: data.password,
    agreeToTerms: true,
  };

  const res = await registerUser(payload);
  return { data: res };
}

export async function loginAdmin(email: string, password: string) {
  const candidates = await fetch(
    `${JSON_SERVER_BASE}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
  ).then((res) => res.json());

  if (!Array.isArray(candidates) || candidates.length === 0) {
    const fallback = await fetch(
      `${JSON_SERVER_BASE}/users?username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    ).then((res) => res.json());

    if (!Array.isArray(fallback) || fallback.length === 0) {
      throw new Error("Invalid admin credentials.");
    }

    const user = fallback[0];
    return {
      data: {
        token: String(user.id || "admin-token"),
        admin: {
          admin_id: Number(user.id || 1),
          name: user.username || user.name || "Admin",
          email: user.email || "",
        },
      },
    };
  }

  const user = candidates[0];
  return {
    data: {
      token: String(user.id || "admin-token"),
      admin: {
        admin_id: Number(user.id || 1),
        name: user.username || user.name || "Admin",
        email: user.email || "",
      },
    },
  };
}

export async function adminGetMenuItems() {
  const response = await fetch(`${JSON_SERVER_BASE}/menu`);
  return handleResponse<any[]>(response);
}

export async function adminAddMenuItem(data: any) {
  const response = await fetch(`${JSON_SERVER_BASE}/menu`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse<any>(response);
}

export async function adminUpdateMenuItem(id: number, data: any) {
  const response = await fetch(`${JSON_SERVER_BASE}/menu/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse<any>(response);
}

export async function adminDeleteMenuItem(id: number) {
  const response = await fetch(`${JSON_SERVER_BASE}/menu/${id}`, {
    method: "DELETE",
  });

  return handleResponse<any>(response);
}

export async function adminGetOrders() {
  const response = await fetch(`${JSON_SERVER_BASE}/orders`);
  return handleResponse<any[]>(response);
}

export async function adminUpdateOrderStatus(id: number, status: string) {
  const response = await fetch(`${JSON_SERVER_BASE}/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  return handleResponse<any>(response);
}
