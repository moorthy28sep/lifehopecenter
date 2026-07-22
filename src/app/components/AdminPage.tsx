import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Loader2, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";


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

type BookingRecord = {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  selected_service?: string;
  notes?: string;
  payment_id?: string;
  amount_paid?: string;
  payment_status?: string;
  booking_date_time?: string;
  created_at?: string;
};

type FilterPeriod = "week" | "month" | "year";

export function AdminPage() {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [user, setUser] = useState<UserProfile | null>(null);
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
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
  setUser({
    id: "admin",
    name: "Administrator",
    email: "admin@lifehopewellness.com",
    role: "admin"
  });
}, []);

  useEffect(() => {
  if (!user || user.role !== "admin") return;

  const fetchContacts = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        "https://lifehopewellness.com/api/get-contacts.php"
      );

      const result = await response.json();

      let rows = result.contacts || [];

      // Date filtering
      if (startDate) {
        rows = rows.filter(
          (r: any) =>
            new Date(r.created_at) >= new Date(startDate)
        );
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        rows = rows.filter(
          (r: any) =>
            new Date(r.created_at) <= end
        );
      }

      // Period filtering
      const filtered = rows.filter((r: any) => {
        if (!startDate && !endDate) {
          const now = new Date();
          const from = new Date(now);

          if (period === "week") {
            from.setDate(now.getDate() - 7);
          } else if (period === "month") {
            from.setMonth(now.getMonth() - 1);
          } else if (period === "year") {
            from.setFullYear(now.getFullYear() - 1);
          }

          return new Date(r.created_at) >= from;
        }

        return true;
      });

      setContacts(
  filtered.map((item: any) => ({
    _id: item.id,
    name: item.name,
    phone: item.phone,
    email: item.email,
    preferredService: item.preferred_service,
    healthConcern: item.health_concern,
    createdAt: item.created_at,
  }))
);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load contacts"
      );
    } finally {
      setLoading(false);
    }
  };

  fetchContacts();
}, [user, period, startDate, endDate]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const fetchBookings = async () => {
      try {
        const response = await fetch("https://lifehopewellness.com/api/get-bookings.php");
        const result = await response.json();
        setBookings(result.bookings || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBookings();
  }, [user]);

  const handleLogout = () => {
  setUser(null);
  setContacts([]);
  setMessage("Logged out");
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
    const response = await fetch(
      "https://lifehopewellness.com/api/update-contact.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: contactId,
          name: draftValues.name,
          phone: draftValues.phone,
          email: draftValues.email,
          preferredService: draftValues.preferredService,
          healthConcern: draftValues.healthConcern,
        }),
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Update failed");
    }

    setContacts((prev) =>
      prev.map((contact) =>
        contact._id === contactId
          ? {
              ...contact,
              name: draftValues.name,
              phone: draftValues.phone,
              email: draftValues.email,
              preferredService: draftValues.preferredService,
              healthConcern: draftValues.healthConcern,
            }
          : contact
      )
    );

    setMessage("Contact request updated.");
    toast.success("Contact request updated.");
    cancelEditing();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update contact";
    setMessage(message);
    toast.error(message);
  } finally {
    setLoading(false);
  }
};

  const handleDeleteContact = async (contactId: string) => {
  if (!window.confirm("Delete this contact request?")) return;

  setLoading(true);

  try {
    const response = await fetch(
      "https://lifehopewellness.com/api/delete-contact.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: contactId,
        }),
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Delete failed");
    }

    setContacts((prev) =>
      prev.filter((contact) => contact._id !== contactId)
    );

    setMessage("Contact request deleted.");
    toast.success("Contact request deleted.");
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to delete contact";
    setMessage(message);
    toast.error(message);
  } finally {
    setLoading(false);
  }
};

  const exportCsv = () => {
  if (contacts.length === 0) {
    setMessage("No records available to export.");
    return;
  }

  const headers = ["Name", "Phone", "Email", "Service", "Concern", "Submitted"];
  const rows = contacts.map((contact) => [
    contact.name,
    contact.phone,
    contact.email || "",
    contact.preferredService || "",
    contact.healthConcern || "",
    new Date(contact.createdAt).toLocaleString(),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `contact-requests-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

  const downloadPdf = async () => {
  if (contacts.length === 0) {
    setMessage("No records available to export.");
    return;
  }

  try {
    const { jsPDF } = await import("jspdf");
    await import("jspdf-autotable");

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const title = "Contact Requests";
    const margin = 40;
    const rowHeight = 20;

    doc.setFontSize(16);
    doc.text(title, margin, 50);

    const headers = [["Name", "Phone", "Email", "Service", "Concern", "Submitted"]];
    const body = contacts.map((contact) => [
      contact.name,
      contact.phone,
      contact.email || "",
      contact.preferredService || "",
      contact.healthConcern || "",
      new Date(contact.createdAt).toLocaleString(),
    ]);

    // @ts-ignore
    doc.autoTable({
      head: headers,
      body,
      startY: 70,
      margin: { left: margin, right: margin },
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [30, 136, 229], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 80 },
        2: { cellWidth: 120 },
        3: { cellWidth: 90 },
        4: { cellWidth: 120 },
        5: { cellWidth: 100 },
      },
    });

    doc.save(`contact-requests-${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (error) {
    setMessage(
      error instanceof Error
        ? error.message
        : "Unable to generate PDF export."
    );
  }
};

  const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  setLoading(true);
  setMessage("");

  try {
    const url =
      authMode === "register"
        ? "https://lifehopewellness.com/api/register.php"
        : "https://lifehopewellness.com/api/login.php";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Authentication failed");
    }

    // ✅ Login success
    if (authMode === "login") {
      const userData = result.user;

      if (userData.role !== "admin") {
        throw new Error("Admin access is required.");
      }

      setUser({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      });

      setMessage("Signed in successfully.");
    } else {
      // ✅ Register success
      setMessage("Registration successful. You can now login.");
      setAuthMode("login");
    }

    setForm({ name: "", email: "", password: "" });

  } catch (error) {
    setMessage(
      error instanceof Error ? error.message : "Authentication failed"
    );
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

            {contacts.length > 0 ? (
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={exportCsv}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#1e88e5] hover:text-[#1e88e5]"
                >
                  <Download size={16} />
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={downloadPdf}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#1e88e5] hover:text-[#1e88e5]"
                >
                  <Download size={16} />
                  Download PDF
                </button>
              </div>
            ) : null}

            <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#0a2744]">Consultation bookings</h3>
                <span className="rounded-full bg-[#1e88e5]/10 px-3 py-1 text-sm font-semibold text-[#1e88e5]">{bookings.length}</span>
              </div>
              {bookings.length === 0 ? (
                <p className="text-sm text-slate-500">No consultation bookings have been recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-700">
                        <th className="px-3 py-2 font-semibold">Name</th>
                        <th className="px-3 py-2 font-semibold">Service</th>
                        <th className="px-3 py-2 font-semibold">Amount</th>
                        <th className="px-3 py-2 font-semibold">Status</th>
                        <th className="px-3 py-2 font-semibold">Booked</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-slate-100 last:border-none">
                          <td className="px-3 py-2 font-semibold text-[#0a2744]">{booking.customer_name}</td>
                          <td className="px-3 py-2">{booking.selected_service || "—"}</td>
                          <td className="px-3 py-2">₹{booking.amount_paid || "1000"}</td>
                          <td className="px-3 py-2">{booking.payment_status || "pending"}</td>
                          <td className="px-3 py-2">{booking.booking_date_time || booking.created_at || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

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
