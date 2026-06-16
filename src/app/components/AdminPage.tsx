import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

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
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [user, setUser] = useState<UserProfile | null>(null);
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [period, setPeriod] = useState<FilterPeriod>("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftValues, setDraftValues] = useState({
    name: "",
    phone: "",
    email: "",
    preferredService: "",
    healthConcern: "",
  });

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = (data as any)?.session;
      const currentUser = session?.user || null;

      if (currentUser) {
        // try to read role from users table
        try {
          const { data: profile, error } = await supabase
            .from("users")
            .select("role, name, email")
            .eq("id", currentUser.id)
            .maybeSingle();

          const role = profile?.role || "user";
          setUser({ id: currentUser.id, name: profile?.name || (currentUser.user_metadata?.full_name || ""), email: currentUser.email || "", role });
        } catch (e) {
          setUser({ id: currentUser.id, name: currentUser.user_metadata?.full_name || "", email: currentUser.email || "", role: "user" });
        }
      }
    };

    getSession();
  }, []);

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const fetchContacts = async () => {
      setLoading(true);
      try {
        let query = supabase.from("contact_requests").select("*, created_at").order("created_at", { ascending: false });

        if (startDate) {
          query = query.gte("created_at", startDate);
        }
        if (endDate) {
          query = query.lte("created_at", endDate + "T23:59:59.999Z");
        }

        // period filter: adjust client-side
        const { data: rows, error } = await query;
        if (error) throw error;

        const filtered = (rows || []).filter((r: any) => {
          if (!startDate && !endDate) {
            const now = new Date();
            const from = new Date(now);
            if (period === "week") from.setDate(now.getDate() - 7);
            else if (period === "month") from.setMonth(now.getMonth() - 1);
            else if (period === "year") from.setFullYear(now.getFullYear() - 1);
            return new Date(r.created_at) >= from;
          }
          return true;
        });

        // map to ContactRecord shape (backwards compat)
        setContacts((filtered as any[]).map((item) => ({
          _id: item.id || item._id,
          name: item.name,
          phone: item.phone,
          email: item.email,
          preferredService: item.preferred_service || item.preferredService,
          healthConcern: item.health_concern || item.healthConcern,
          createdAt: item.created_at || item.createdAt,
        })));
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load contacts");
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [user, period, startDate, endDate]);

  // keep session in sync
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        setUser(null);
        return;
      }

      (async () => {
        const currentUser = session.user;
        try {
          const { data: profile } = await supabase.from("users").select("role, name, email").eq("id", currentUser.id).maybeSingle();
          const role = profile?.role || "user";
          setUser({ id: currentUser.id, name: profile?.name || (currentUser.user_metadata?.full_name || ""), email: currentUser.email || "", role });
        } catch (e) {
          setUser({ id: currentUser.id, name: currentUser.user_metadata?.full_name || "", email: currentUser.email || "", role: "user" });
        }
      })();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setContacts([]);
    setMessage("Signed out.");
  };

  const startEditing = (contact: ContactRecord) => {
    setEditingId(contact._id);
    setDraftValues({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || "",
      preferredService: contact.preferredService || "",
      healthConcern: contact.healthConcern || "",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraftValues({ name: "", phone: "", email: "", preferredService: "", healthConcern: "" });
  };

  const handleSaveEdit = async (contactId: string) => {
    setLoading(true);
    try {
      const updates: any = {
        name: draftValues.name,
        phone: draftValues.phone,
        email: draftValues.email,
        preferred_service: draftValues.preferredService,
        health_concern: draftValues.healthConcern,
      };

      const { data: updated, error } = await supabase
        .from("contact_requests")
        .update(updates)
        .eq("id", contactId)
        .select()
        .single();

      if (error) throw error;

      setContacts((prev) => prev.map((contact) => (contact._id === contactId ? { ...contact, ...updated } : contact)));
      setMessage("Contact request updated.");
      cancelEditing();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update contact");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!window.confirm("Delete this contact request?")) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("contact_requests").delete().eq("id", contactId);
      if (error) throw error;
      setContacts((prev) => prev.filter((contact) => contact._id !== contactId));
      setMessage("Contact request deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete contact");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (authMode === "register") {
        const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { full_name: form.name } } });
        if (error) throw error;

        // create a users profile row with role using a secure Edge Function (recommended)
        try {
          const functionsUrl = (import.meta as any).env.VITE_SUPABASE_FUNCTIONS_URL || "";
          if (functionsUrl) {
            await fetch(`${functionsUrl}/set-user-role`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: data.user?.id, role: "user", name: form.name, email: form.email }),
            });
          } else {
            // fallback: attempt client-side insert (may be blocked by RLS)
            await supabase.from("users").insert([{ id: data.user?.id, name: form.name, email: form.email, role: "user" }]);
          }
        } catch (e) {
          // ignore profile creation errors
        }

        setMessage("Registration complete. Check your email to confirm if required.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) throw error;

        const currentUser = data.user;
        // fetch role from users table
        let role = "user";
        try {
          const { data: profile } = await supabase.from("users").select("role, name").eq("id", currentUser.id).maybeSingle();
          role = profile?.role || "user";
          const name = profile?.name || (currentUser.user_metadata?.full_name || "");
          setUser({ id: currentUser.id, name, email: currentUser.email || "", role });
        } catch (e) {
          setUser({ id: currentUser.id, name: currentUser.user_metadata?.full_name || "", email: currentUser.email || "", role: "user" });
        }

        if (role !== "admin") throw new Error("Admin access is required.");

        setMessage("Signed in successfully.");
      }

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
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#1e88e5] hover:text-[#1e88e5]"
            >
              Logout
            </button>
          ) : null}
        </div>

        {!user ? (
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
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#0a2744]">Incoming contact requests</h2>
                <p className="text-sm text-slate-600">Filter by calendar range or by the selected period.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
                  />
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
                      <th className="px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => {
                      const isEditing = editingId === contact._id;
                      return (
                        <tr key={contact._id} className="border-b border-slate-100 last:border-none align-top">
                          <td className="px-4 py-3 font-semibold text-[#0a2744]">
                            {isEditing ? (
                              <input
                                value={draftValues.name}
                                onChange={(event) => setDraftValues((prev) => ({ ...prev, name: event.target.value }))}
                                className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                              />
                            ) : (
                              contact.name
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <input
                                value={draftValues.phone}
                                onChange={(event) => setDraftValues((prev) => ({ ...prev, phone: event.target.value }))}
                                className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                              />
                            ) : (
                              contact.phone
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <input
                                value={draftValues.email}
                                onChange={(event) => setDraftValues((prev) => ({ ...prev, email: event.target.value }))}
                                className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                              />
                            ) : (
                              contact.email || "—"
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <input
                                value={draftValues.preferredService}
                                onChange={(event) => setDraftValues((prev) => ({ ...prev, preferredService: event.target.value }))}
                                className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                              />
                            ) : (
                              contact.preferredService || "—"
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <textarea
                                rows={2}
                                value={draftValues.healthConcern}
                                onChange={(event) => setDraftValues((prev) => ({ ...prev, healthConcern: event.target.value }))}
                                className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                              />
                            ) : (
                              contact.healthConcern || "—"
                            )}
                          </td>
                          <td className="px-4 py-3">{new Date(contact.createdAt).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(contact._id)}
                                  className="rounded-full bg-[#1e88e5] px-3 py-1.5 text-xs font-semibold text-white"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditing}
                                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditing(contact)}
                                  className="rounded-full border border-slate-200 p-2 text-slate-700 transition hover:border-[#1e88e5] hover:text-[#1e88e5]"
                                  aria-label="Edit contact"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteContact(contact._id)}
                                  className="rounded-full border border-slate-200 p-2 text-slate-700 transition hover:border-red-400 hover:text-red-500"
                                  aria-label="Delete contact"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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
