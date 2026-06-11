import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type ContactRecord = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  preferredService?: string;
  healthConcern?: string;
  createdAt: string;
};

type FilterPeriod = "week" | "month" | "year";

export function AdminPage() {
  const apiBaseUrl = (((import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_API_URL || "") as string).replace(/\/$/, "");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [period, setPeriod] = useState<FilterPeriod>("month");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedToken = window.localStorage.getItem("lifehope_admin_token");
    const storedUser = window.localStorage.getItem("lifehope_admin_user");

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    const fetchContacts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiBaseUrl}/api/contacts?period=${period}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Unable to load contacts");
        }

        setContacts(data.contacts || []);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load contacts");
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [token, period]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const validateSession = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Session expired");
        }

        setUser(data.user);
        window.localStorage.setItem("lifehope_admin_user", JSON.stringify(data.user));
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Session expired");
        handleLogout();
      }
    };

    validateSession();
  }, [token]);

  const handleLogout = () => {
    window.localStorage.removeItem("lifehope_admin_token");
    window.localStorage.removeItem("lifehope_admin_user");
    setToken(null);
    setUser(null);
    setContacts([]);
    setMessage("Signed out.");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/${authMode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          authMode === "register"
            ? { name: form.name, email: form.email, password: form.password }
            : { email: form.email, password: form.password }
        ),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      if (data.user?.role !== "admin") {
        throw new Error("Admin access is required.");
      }

      window.localStorage.setItem("lifehope_admin_token", data.token);
      window.localStorage.setItem("lifehope_admin_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setMessage(authMode === "register" ? "Welcome, admin." : "Signed in successfully.");
      setForm({ name: "", email: "", password: "" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#1e88e5]">
              <ArrowLeft size={16} /> Back to site
            </Link>
            <h1 className="text-3xl font-black text-[#0a2744]">Admin contact dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Review inbound contact requests and filter them by last week, month, or year.
            </p>
          </div>
          {token && user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#1e88e5] hover:text-[#1e88e5]"
            >
              Logout
            </button>
          ) : null}
        </div>

        {!token ? (
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-[#1e88e5]/10 p-3 text-[#1e88e5]">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#0a2744]">Admin access</h2>
                  <p className="text-sm text-slate-600">Use the seeded admin account or register a new admin user.</p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">Default login</p>
                <p>Email: admin@lifehope.com</p>
                <p>Password: Admin@12345</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <button
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${authMode === "login" ? "bg-[#1e88e5] text-white" : "bg-slate-100 text-slate-700"}`}
                  onClick={() => setAuthMode("login")}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${authMode === "register" ? "bg-[#1e88e5] text-white" : "bg-slate-100 text-slate-700"}`}
                  onClick={() => setAuthMode("register")}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {authMode === "register" ? (
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Full name</label>
                    <input
                      required={authMode === "register"}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#1e88e5]"
                      value={form.name}
                      onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="Admin name"
                    />
                  </div>
                ) : null}

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                  <input
                    required
                    type="email"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#1e88e5]"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="admin@example.com"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
                  <input
                    required
                    type="password"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#1e88e5]"
                    value={form.password}
                    onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e88e5] px-4 py-3 font-semibold text-white transition hover:bg-[#1565c0] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                  {authMode === "login" ? "Sign in" : "Create account"}
                </button>
              </form>

              {message ? <p className="mt-4 text-sm text-[#0a2744]">{message}</p> : null}
            </div>
          </div>
        ) : user?.role !== "admin" ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-[#0a2744]">Admin privileges required</h2>
            <p className="mt-3 text-slate-600">The current account does not have admin access.</p>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#0a2744]">Incoming contact requests</h2>
                <p className="text-sm text-slate-600">Showing records from the selected period.</p>
              </div>
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value as FilterPeriod)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 outline-none"
              >
                <option value="week">Last week</option>
                <option value="month">Last month</option>
                <option value="year">Last year</option>
              </select>
            </div>

            {message ? <p className="mb-4 text-sm text-[#0a2744]">{message}</p> : null}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-[#1e88e5]" size={28} />
              </div>
            ) : contacts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                No contact requests found for this period.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold">Phone</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Service</th>
                      <th className="px-4 py-3 font-semibold">Concern</th>
                      <th className="px-4 py-3 font-semibold">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
                      <tr key={contact._id} className="border-b border-slate-100 last:border-none">
                        <td className="px-4 py-3 font-semibold text-[#0a2744]">{contact.name}</td>
                        <td className="px-4 py-3">{contact.phone}</td>
                        <td className="px-4 py-3">{contact.email || "—"}</td>
                        <td className="px-4 py-3">{contact.preferredService || "—"}</td>
                        <td className="px-4 py-3">{contact.healthConcern || "—"}</td>
                        <td className="px-4 py-3">{new Date(contact.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
