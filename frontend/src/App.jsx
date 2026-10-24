import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api.js";
import { Users, CalendarCheck, ClipboardList, Megaphone, GraduationCap, LayoutDashboard, LogOut, Menu, Plus, RefreshCw } from "lucide-react";
import { Bell } from "lucide-react";

const navItems = [
  ["Dashboard", LayoutDashboard],
  ["Employees", Users],
  ["Attendance", CalendarCheck],
  ["Leave Requests", ClipboardList],
  ["Personal Records", Users],
  ["My Profile", Users],
  ["Announcements", Megaphone],
  ["Training", GraduationCap],
  ["Performance", Users],
  ["User Management", Users],
 
];
console.log(
  "NAV ITEMS:",
  navItems.map(item => Array.isArray(item) ? item[0] : item)
);
function Login({ onLogin, onSignup }) {
  const [email, setEmail] = useState("admin@staffsync.demo");
  const [password, setPassword] = useState("StaffSync123!");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try { onLogin(await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) })); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <main className="login-shell">
    <div className="login-card">
      <div className="brand-mark">S</div>
      <p className="eyebrow">PEOPLE • PROCESSES • PROGRESS</p>
      <h1>Welcome to StaffSync</h1>
      <p className="muted">Sign in to your HR workspace.</p>
      <form onSubmit={submit} className="mt-4">
        <label className="form-label">Email address</label>
        <input className="form-control mb-3" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <label className="form-label">Password</label>
        <input className="form-control mb-3" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <button className="btn btn-primary w-100 py-2" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        <p className="text-center mt-3 mb-0">
          Don't have an account?{" "}
          <button
            type="button"
            className="btn btn-link p-0"
            onClick={onSignup}
          >
            Sign up
          </button>
        </p>
      </form>
      <div className="demo-note"><strong>Demo administrator</strong><br />admin@staffsync.demo<br />StaffSync123!</div>
    </div>
  </main>;
}
function Signup({ onLogin, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("General");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const result = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, department })
      });
      onLogin(result);
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-shell">
      <div className="login-card">
        <div className="brand-mark">S</div>
        <p className="eyebrow">PEOPLE • PROCESSES • PROGRESS</p>
        <h1>Create your account</h1>
        <p className="muted">Join your StaffSync workspace.</p>

        <form onSubmit={submit} className="mt-4">
          <label className="form-label">Full name</label>
          <input
            className="form-control mb-3"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          <label className="form-label">Email address</label>
          <input
            className="form-control mb-3"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label className="form-label">Department</label>
          <select
            className="form-select mb-3"
            value={department}
            onChange={e => setDepartment(e.target.value)}
          >
            <option>General</option>
            <option>Engineering</option>
            <option>Human Resources</option>
            <option>Finance</option>
            <option>Marketing</option>
            <option>Sales</option>
            <option>Operations</option>
          </select>

          <label className="form-label">Password (minimum 8 characters)</label>
          <input
            className="form-control mb-3"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={8}
            required
          />

          <label className="form-label">Confirm password</label>
          <input
            className="form-control mb-3"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <button
            className="btn btn-primary w-100 py-2"
            disabled={busy}
          >
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Already have an account?{" "}
          <button
            type="button"
            className="btn btn-link p-0"
            onClick={onBack}
          >
            Sign in
          </button>
        </p>
      </div>
    </main>
  );
}

export default function App() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem("staffsync-session") || "null"); } catch { return null; }
  });
  const [page, setPage] = useState("Dashboard");
  const [showSignup, setShowSignup] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [users, setUsers] = useState([]);
  const [performanceReviews, setPerformanceReviews] = useState([]);
  const [data, setData] = useState({ dashboard: {}, employees: [], leaves: [], attendance: [], announcements: [], trainings: [] });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showTrainingForm, setShowTrainingForm] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({ name: "", email: "", department: "Engineering", jobTitle: "Developer", phone: "" });
  const [leaveForm, setLeaveForm] = useState({ type: "Casual", startDate: "", endDate: "", reason: "" });
  const [announcementForm, setAnnouncementForm] = useState({ title: "", message: "",expiry:"" });
  const [trainingForm, setTrainingForm] = useState({ title: "", description: "", date: "", audience: "All employees" });
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [search, setSearch] = useState("");
  const token = session?.token;
  const user = session?.user;
  const canManage = ["Admin", "HR"].includes(user?.role);
  const canApprove = ["Admin", "HR", "Manager"].includes(user?.role);

  function login(result) {
    localStorage.setItem("staffsync-session", JSON.stringify(result));
   setPage("Dashboard");
    setSession(result);
  }
  function logout() {
  localStorage.removeItem("staffsync-session");
  setSession(null);
  setPage("Dashboard");
  setNotice("");
  setError("");
  setNotifications("");
  setShowNotifications(false);
  setData({
    dashboard: {},
    employees: [],
    leaves: [],
    attendance: [],
    announcements: [],
    trainings: []
  });
  setPerformanceReviews([]);
}
  async function loadAll() {
    if (!token) return;
    setLoading(true); setError("");
    const paths = [
      ["/dashboard", "dashboard"], ["/employees", "employees"], ["/leaves", "leaves"],
      ["/attendance", "attendance"], ["/announcements", "announcements"], ["/trainings", "trainings"]
    ];
    const next = { ...data };
    const results = await Promise.all(paths.map(async ([path, key]) => {
      try { return [key, await api(path, { token })]; }
      catch (err) { setError(err.message); return [key, next[key]]; }
    }));
    results.forEach(([key, value]) => { next[key] = value; });
    setData(next); 

    if (user?.role === "Admin") {
      try {
        const usersList = await api("/users", { token });
        setUsers(usersList);
      } catch (err) {
        setError(err.message);
      }
    }

    setLoading(false);

if (["Manager", "HR", "Admin"].includes(user?.role)) {
  try {
    const reviews = await api("/performance-reviews", { token });
    setPerformanceReviews(reviews);
  } catch (err) {
    setError(err.message);
  }
} else {
  setPerformanceReviews([]);
}
  }
  useEffect(() => { loadAll(); }, [token, refresh]);
  useEffect(() => {
    if (!token) {
      setNotifications([]);
      return;
    }

    let cancelled = false;

    async function loadNotifications() {
      try {
        const result = await api("/notifications", { token });
        if (!cancelled) {
          setNotifications(Array.isArray(result) ? result : []);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    }

    loadNotifications();

    const interval = setInterval(loadNotifications, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [token, refresh]);
  useEffect(() => {
    if (!user?.email || !data.employees.length) return;

    const employee = data.employees.find(
      e => e.email?.toLowerCase() === user.email.toLowerCase()
    );

    if (employee) {
      setProfileForm({
        name: employee.name || "",
        phone: employee.phone || ""
      });
    }
  }, [user?.email, data.employees]);
  async function action(path, options, successMessage) {
    setError(""); setNotice("");
    try {
      await api(path, { token, ...options });
      setNotice(successMessage || "Saved successfully.");
      setRefresh(v => v + 1);
      return true;
    } catch (err) { setError(err.message); return false; }

  }
  async function saveProfile(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setSavingProfile(true);

    try {
      const updatedProfile = await api("/profile", {
        token,
        method: "PUT",
        body: JSON.stringify(profileForm)
      });

      setProfileForm({
        name: updatedProfile.name || "",
        phone: updatedProfile.phone || ""
      });

      setNotice("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProfile(false);
    }
  }
  async function addEmployee(e) {
    e.preventDefault();
    if (await action("/employees", { method: "POST", body: JSON.stringify(employeeForm) }, "Employee added successfully.")) {
      setEmployeeForm({ name: "", email: "", department: "Engineering", jobTitle: "Developer", phone: "" }); setShowEmployeeForm(false);
    }
  }
  async function addLeave(e) {
    e.preventDefault();
    if (await action("/leaves", { method: "POST", body: JSON.stringify(leaveForm) }, "Leave request submitted.")) {
      setLeaveForm({ type: "Casual", startDate: "", endDate: "", reason: "" });
    }
  }
  async function addAnnouncement(e) {
    e.preventDefault();
    if (await action("/announcements", { method: "POST", body: JSON.stringify(announcementForm) }, "Announcement published.")) {
      setAnnouncementForm({ title: "", message: "" }); setShowAnnouncementForm(false);
    }
  }
  async function addTraining(e) {
    e.preventDefault();
    if (await action("/trainings", { method: "POST", body: JSON.stringify(trainingForm) }, "Training added.")) {
      setTrainingForm({ title: "", description: "", date: "", audience: "All employees" }); setShowTrainingForm(false);
    }
  }
  const filteredEmployees = useMemo(() => data.employees.filter(e =>
    `${e.name} ${e.email} ${e.department} ${e.jobTitle}`.toLowerCase().includes(search.toLowerCase())
  ), [data.employees, search]);

  if (!session) {
    return showSignup
      ? <Signup onLogin={login} onBack={() => setShowSignup(false)} />
      : <Login onLogin={login} onSignup={() => setShowSignup(true)} />;
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark small">S</span><span>StaffSync</span></div>
      <div className="workspace-label">WORKSPACE</div>
      
<nav>
  {navItems
    .filter(item => Array.isArray(item) && item.length >= 2)
    .filter(([label]) => {
      const role = user?.role?.trim().toLowerCase();

      if (label === "User Management") {
        return role === "admin";
      }

      if (label === "Performance") {
        return ["manager", "hr", "admin"].includes(role);
      }
      if(label == "Hr Reports"){
        return ["hr","admin"].includes(role);
      }

      return true;
    })
    .map(([label, Icon]) => (
      <button
        key={label}
        className={`nav-link ${page === label ? "active" : ""}`}
        onClick={() => setPage(label)}
      >
        <Icon size={18} />
        <span>{label}</span>
      </button>
    ))}
</nav>

      <div className="sidebar-bottom"><div className="avatar">{user?.name?.slice(0, 1)?.toUpperCase()}</div><div className="user-meta"><strong>{user?.name}</strong><small>{user?.role}</small></div><button className="icon-btn" title="Sign out" onClick={logout}><LogOut size={17} /></button></div>
    </aside>
    <main className="main-panel">
      <header className="topbar"><div><div className="eyebrow">HUMAN RESOURCES PLATFORM</div><h2>{page}</h2></div>

        <div className="top-actions">
          <span className="status-dot"></span>
          <span className="muted small-text">Workspace active</span>

          <button
            type="button"
            className="btn btn-light btn-sm position-relative"
            onClick={() => setShowNotifications(v => !v)}
            aria-label="Notifications"
          >
            <Bell size={17} />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>

          <button
            className="btn btn-light btn-sm"
            onClick={() => setRefresh(v => v + 1)}
          >
            <RefreshCw size={15} className="me-1" /> Refresh
          </button>
        </div>
      </header>
      <div className="content">

        {showNotifications && (
          <div className="panel notification-panel">
            <div className="section-head">
              <div>
                <h3>Notifications</h3>
                <p>Your latest StaffSync updates.</p>
              </div>
              <button
                className="btn btn-light btn-sm"
                onClick={() => setShowNotifications(false)}
              >
                Close
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="empty-state">You're all caught up. No notifications yet.</div>
            ) : (
              <div>
                {notifications.filter(notification => !notification.read).map(notification => (
                  <div
                    key={notification._id}
                    className="notification-item"
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid #e5e7eb",
                      background: notification.read ? "transparent" : "#f0f7ff"
                    }}
                  >
                    <div className="d-flex justify-content-between gap-2">
                      <strong>{notification.title}</strong>
                      {!notification.read && (
                        <span className="badge bg-primary">New</span>
                      )}
                    </div>

                    <p className="mb-1 mt-1">{notification.message}</p>

                    <small className="text-muted">
                      {new Date(notification.createdAt).toLocaleString()}
                    </small>

                    {!notification.read && (
                      <div>
                        <button
                          className="btn btn-sm btn-outline-primary mt-2"
                          onClick={async () => {
                            try {
                              await api(`/notifications/${notification._id}/read`, {
                                method: "PATCH",
                                token
                              });

                              setNotifications(current =>
                                current.map(item =>
                                  item._id === notification._id
                                    ? { ...item, read: true }
                                    : item
                                )
                              );
                            } catch (err) {
                              setError(err.message);
                            }
                          }}
                        >
                          Mark as read
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && <div className="alert alert-danger alert-dismissible">{error}<button className="btn-close" onClick={() => setError("")}></button></div>}
        {notice && <div className="alert alert-success alert-dismissible">{notice}<button className="btn-close" onClick={() => setNotice("")}></button></div>}
        {page === "Dashboard" && (
  loading ? (
    <div className="panel">Loading your dashboard...</div>
  ) : (
    <Dashboard data={data} user={user} setPage={setPage} />
  )
)}
{page === "HR Reports" && ["hr", "admin"].includes(user?.role?.trim().toLowerCase()) && (
  <div>
    <div className="welcome-banner">
      <div>
        <div className="eyebrow">STAFFSYNC ANALYTICS</div>
        <h1>HR Reports</h1>
        <p>A quick overview of your workforce.</p>
      </div>
    </div>

    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-top"><span>Total Employees</span></div>
        <div className="stat-value">{data.employees?.length ?? 0}</div>
      </div>
<div className="stat-card">
  <div className="stat-top"><span>Pending Leave Requests</span></div>
  <div className="stat-value">
    {data.leaves?.filter(leave =>
      leave.status?.toLowerCase() === "pending"
    ).length ?? 0}
  </div>
</div>

      <div className="stat-card">
  <div className="stat-top"><span>Pending Leave Requests</span></div>
  <div className="stat-value">
    {data.leaves?.filter(leave =>
      leave.status?.toLowerCase() === "pending"
    ).length ?? 0}
  </div>
</div>

      <div className="stat-card">
        <div className="stat-top"><span>Training Programs</span></div>
        <div className="stat-value">{data.trainings?.length ?? 0}</div>
      </div>
    </div>
  </div>
)}
        {page === "Employees" && <section className="panel">
          <div className="section-head"><div><h3>Employee directory</h3><p>Manage your people and teams.</p>
          </div>{canManage && <button className="btn btn-primary" onClick={() => setShowEmployeeForm(v => !v)}><Plus size={17} className="me-1" />Add employee</button>}</div>
          {showEmployeeForm && <form className="form-panel" onSubmit={addEmployee}><div className="row g-3">
            {["name", "email", "department", "managerEmail", "jobTitle", "phone"].map(key => <div className="col-md-6" key={key}><label className="form-label text-capitalize">{key === "jobTitle" ? "Job title" : key}</label><input className="form-control" required={["name", "email"].includes(key)} type={key === "email" ? "email" : "text"} value={employeeForm[key]} onChange={e => setEmployeeForm({ ...employeeForm, [key]: e.target.value })} /></div>)}
          </div><div className="mt-3 d-flex gap-2"><button className="btn btn-primary">Save employee</button><button type="button" className="btn btn-light" onClick={() => setShowEmployeeForm(false)}>Cancel</button></div></form>}
          <input className="form-control search-box" placeholder="Search name, email, department…" value={search} onChange={e => setSearch(e.target.value)} />
          <div className="table-responsive"><table className="table align-middle"><thead><tr><th>Employee</th><th>Department</th><th>Job title</th><th>Status</th>{canManage && <th>Action</th>}</tr></thead><tbody>{filteredEmployees.map(emp => <tr key={emp._id}><td><strong>{emp.name}</strong><div className="muted small-text">{emp.email}</div></td><td>{emp.department}</td><td>{emp.jobTitle}</td><td><span className="pill">{emp.status}</span></td>{canManage && <td><button className="btn btn-sm btn-outline-danger" onClick={() => { if (confirm("Delete this employee?")) action(`/employees/${emp._id}`, { method: "DELETE" }, "Employee deleted."); }}>Delete</button></td>}</tr>)}</tbody></table></div>
          {!filteredEmployees.length && <div className="empty-state">No employees yet. Add your first employee to get started.</div>}
        </section>}
        {page === "Attendance" && <section className="panel"><div className="section-head"><div><h3>Attendance</h3><p>Record your daily check-in and check-out.
        </p></div><div className="d-flex gap-2"><button className="btn btn-primary" onClick={() => action("/attendance/check-in", { method: "POST", body: "{}" }, "Checked in successfully.")}>Check in</button>
            <button className="btn btn-outline-primary" onClick={() => action("/attendance/check-out", { method: "POST", body: "{}" }, "Checked out successfully.")}>Check out</button></div></div>
          <DataTable headers={["Date", "Employee", "Check in", "Check out", "Status"]} rows={data.attendance.map(a => [a.date, a.employeeName, a.checkIn || "—", a.checkOut || "—", a.status])} /></section>}
          {page === "Performance" && (
  <section className="panel">
    <div className="section-head">
      <div>
        <h3>Employee Performance</h3>
        <p>Review employee performance and provide feedback.</p>
      </div>
    </div>

    <form
      className="form-panel"
      onSubmit={async (e) => {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);

        const ok = await action(
          "/performance-reviews",
          {
            method: "POST",
            body: JSON.stringify({
              employeeEmail: formData.get("employeeEmail"),
              rating: Number(formData.get("rating")),
              feedback: formData.get("feedback"),
              strengths: formData.get("strengths"),
              improvementAreas: formData.get("improvementAreas")
            })
          },
          "Performance review saved."
        );

        if (ok) {
          form.reset();
        }
      }}
    >
      <div className="mb-3">
        <label className="form-label">Employee email</label>
        <input
          className="form-control"
          name="employeeEmail"
          type="email"
          placeholder="employee@example.com"
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Rating (1–5)</label>
        <select className="form-select" name="rating" required defaultValue="3">
          <option value="1">1 — Needs improvement</option>
          <option value="2">2 — Below expectations</option>
          <option value="3">3 — Meets expectations</option>
          <option value="4">4 — Exceeds expectations</option>
          <option value="5">5 — Outstanding</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Feedback</label>
        <textarea
          className="form-control"
          name="feedback"
          rows="3"
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Strengths</label>
        <textarea
          className="form-control"
          name="strengths"
          rows="2"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Areas for improvement</label>
        <textarea
          className="form-control"
          name="improvementAreas"
          rows="2"
        />
      </div>

      <button className="btn btn-primary" type="submit">
        Save performance review
      </button>
    </form>
    <div className="mt-4">
  <h4>Saved Performance Reviews</h4>

  <div className="table-responsive">
    <table className="table align-middle">
      <thead>
        <tr>
          <th>Employee</th>
          <th>Rating</th>
          <th>Feedback</th>
          <th>Strengths</th>
          <th>Areas to improve</th>
          <th>Review date</th>
        </tr>
      </thead>
      <tbody>
        {performanceReviews.map(review => (
          <tr key={review._id}>
            <td>
              <strong>{review.employeeName}</strong>
              <div className="muted small-text">
                {review.employeeEmail}
              </div>
            </td>
            <td>{review.rating}/5</td>
            <td>{review.feedback}</td>
            <td>{review.strengths || "—"}</td>
            <td>{review.improvementAreas || "—"}</td>
            <td>
              {review.reviewDate
                ? new Date(review.reviewDate).toLocaleDateString()
                : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {!performanceReviews.length && (
    <div className="empty-state">
      No performance reviews found.
    </div>
  )}
</div>
  </section>
)}


        {page === "User Management" && <section className="panel">
          <div className="section-head">
            <div>
              <h3>User Management</h3>
              <p>View registered users and manage their roles.</p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Current role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(account => (
                  <tr key={account._id}>
                    <td>{account.name}</td>
                    <td>{account.email}</td>
                    <td>{account.department || "General"}</td>
                   
<td>
  <select
    className="form-select"
    value={account.role}
    disabled={account._id === user?._id}
    onChange={e => {
      const role = e.target.value;
      if (confirm(`Change ${account.name}'s role to ${role}?`)) {
        action(
          `/users/${account._id}/role`,
          {
            method: "PATCH",
            body: JSON.stringify({ role })
          },
          "User role updated successfully."
        );
      }
    }}
  >
    <option value="Employee">Employee</option>
    <option value="Manager">Manager</option>
    <option value="HR">HR</option>
    {account.role === "Admin" && (
      <option value="Admin">Admin</option>
    )}
  </select>
</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!users.length && (
            <div className="empty-state">No users found.</div>
          )}
        </section>}


        {page === "Leave Requests" && <section className="panel"><div className="section-head"><div><h3>Leave requests</h3><p>Apply for leave and review pending requests.</p></div></div><form className="form-panel mb-4" onSubmit={addLeave}><h5>Apply for leave</h5><div className="row g-3"><div className="col-md-3"><label className="form-label">Type</label><select className="form-select" value={leaveForm.type} onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value })}>{["Casual", "Sick", "Annual", "Other"].map(x => <option key={x}>{x}</option>)}</select></div><div className="col-md-3"><label className="form-label">Start date</label><input className="form-control" type="date" required value={leaveForm.startDate} onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })} /></div><div className="col-md-3"><label className="form-label">End date</label><input className="form-control" type="date" required value={leaveForm.endDate} onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })} /></div><div className="col-md-3"><label className="form-label">Reason</label><input className="form-control" value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })} /></div></div><button className="btn btn-primary mt-3">Submit request</button></form><div className="table-responsive"><table className="table align-middle"><thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Reason</th><th>Status</th>{canApprove && <th>Decision</th>}</tr></thead><tbody>{data.leaves.map(l => <tr key={l._id}><td>{l.employeeName}</td><td>{l.type}</td><td>{String(l.startDate).slice(0, 10)} – {String(l.endDate).slice(0, 10)}</td><td>{l.reason || "—"}</td><td><span className={`pill ${l.status === "Approved" ? "good" : l.status === "Rejected" ? "bad" : ""}`}>{l.status}</span></td>{canApprove && <td>{l.status === "Pending" && <div className="d-flex gap-1"><button className="btn btn-sm btn-success" onClick={() => action(`/leaves/${l._id}`, { method: "PATCH", body: JSON.stringify({ status: "Approved" }) }, "Leave approved.")}>Approve</button><button className="btn btn-sm btn-outline-danger" onClick={() => action(`/leaves/${l._id}`, { method: "PATCH", body: JSON.stringify({ status: "Rejected" }) }, "Leave rejected.")}>Reject</button></div>}</td>}</tr>)}</tbody></table></div>{!data.leaves.length && <div className="empty-state">No leave requests yet.</div>}</section>}
        {page === "Personal Records" && <section className="panel">
          <div className="section-head">
            <div>
              <h3>My Personal Records</h3>
              <p>View your leave requests and attendance history.</p>
            </div>
          </div>

          <h5 className="mt-4">My Leave Requests</h5>
          <DataTable
            headers={["Type", "Start date", "End date", "Reason", "Status"]}
            rows={data.leaves.map(l => [
              l.type,
              String(l.startDate).slice(0, 10),
              String(l.endDate).slice(0, 10),
              l.reason || "—",
              l.status
            ])}
          />

          <h5 className="mt-4">My Attendance History</h5>
          <DataTable
            headers={["Date", "Check in", "Check out", "Status"]}
            rows={data.attendance.map(a => [
              String(a.date).slice(0, 10),
              a.checkIn || "—",
              a.checkOut || "—",
              a.status
            ])}
          />
        </section>}
        {page === "My Profile" && (<section className="panel"> <div className="section-head"><div><h3>My Profile</h3>
          <p>Update your personal contact information.</p></div>
        </div>
          <form onSubmit={saveProfile} className="form-panel">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Full name</label>
                <input
                  className="form-control"
                  type="text"
                  value={profileForm.name}
                  onChange={e =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Email address</label>
                <input
                  className="form-control"
                  type="email"
                  value={user?.email || ""}
                  disabled
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Phone number</label>
                <input
                  className="form-control"
                  type="tel"
                  value={profileForm.phone}
                  onChange={e =>
                    setProfileForm({ ...profileForm, phone: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              className="btn btn-primary mt-3"
              type="submit"
              disabled={savingProfile}
            >
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </section>
        )}
        {page === "Announcements" && <section className="panel"><div className="section-head"><div><h3>Company announcements</h3><p>Keep everyone informed.</p></div>{canManage && <button className="btn btn-primary" onClick={() => setShowAnnouncementForm(v => !v)}><Plus size={17} className="me-1" />New announcement</button>}</div>{showAnnouncementForm && <form className="form-panel mb-4" onSubmit={addAnnouncement}><label className="form-label">Title</label><input className="form-control mb-3" required value={announcementForm.title} onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })} />
        <label className="form-label">Expiry date (optional)</label>
<input
  type="date"
  className="form-control mb-3"
  value={announcementForm.expiryDate}
  min={new Date().toLocaleDateString("en-CA")}
  onChange={e =>
    setAnnouncementForm({
      ...announcementForm,
      expiryDate: e.target.value
    })
  }
/><label className="form-label">Message</label><textarea className="form-control mb-3" required rows="3" value={announcementForm.message} onChange={e => setAnnouncementForm({ ...announcementForm, message: e.target.value })} /><button className="btn btn-primary">Publish</button></form>}<div className="row g-3">{data.announcements.map(a => <div className="col-md-6" key={a._id}><article className="notice-card"><div className="eyebrow">{new Date(a.createdAt).toLocaleDateString()}</div><h5>{a.title}</h5><p>{a.message}</p><small className="muted">Posted by {a.createdBy}</small></article></div>)}</div>{!data.announcements.length && <div className="empty-state">No announcements published yet.</div>}</section>}
        {page === "Training" && <section className="panel"><div className="section-head"><div><h3>Training & development</h3><p>Organize employee learning sessions.</p></div>{canManage && <button className="btn btn-primary" onClick={() => setShowTrainingForm(v => !v)}><Plus size={17} className="me-1" />Add training</button>}</div>{showTrainingForm && <form className="form-panel mb-4" onSubmit={addTraining}><div className="row g-3"><div className="col-md-4"><label className="form-label">Training title</label><input className="form-control" required value={trainingForm.title} onChange={e => setTrainingForm({ ...trainingForm, title: e.target.value })} /></div><div className="col-md-4"><label className="form-label">Date</label><input className="form-control" type="date" value={trainingForm.date} onChange={e => setTrainingForm({ ...trainingForm, date: e.target.value })} /></div><div className="col-md-4"><label className="form-label">Audience</label><input className="form-control" value={trainingForm.audience} onChange={e => setTrainingForm({ ...trainingForm, audience: e.target.value })} /></div><div className="col-12"><label className="form-label">Description</label><textarea className="form-control" rows="2" value={trainingForm.description} onChange={e => setTrainingForm({ ...trainingForm, description: e.target.value })} /></div></div><button className="btn btn-primary mt-3">Save training</button></form>}<div className="row g-3">{data.trainings.map(t => <div className="col-md-6" key={t._id}><article className="notice-card"><span className="pill">Training</span><h5 className="mt-3">{t.title}</h5><p>{t.description}</p><small className="muted">{t.date ? String(t.date).slice(0, 10) : "Date to be announced"} • {t.audience}</small></article></div>)}</div>{!data.trainings.length && <div className="empty-state">No training programs added yet.</div>}</section>}
        <footer className="footer">StaffSync · Modern HR Management · MERN Stack Capstone</footer>
      </div>
    </main>
  </div>;

}

function Dashboard({ data, user, setPage }) {
  const cards = [
    ["Active employees", data.dashboard.employees ?? 0, Users, "People directory"],
    ["Pending leaves", data.dashboard.pendingLeaves ?? 0, ClipboardList, "Review requests"],
    ["Today's attendance", data.dashboard.todayAttendance ?? 0, CalendarCheck, "Daily records"],
    ["Training programs", data.dashboard.trainings ?? 0, GraduationCap, "Learning & growth"]
  ];
  return <div>
    <div className="welcome-banner"><div><div className="eyebrow">YOUR PEOPLE, IN SYNC</div><h1>Good to see you, {user?.name?.split(" ")[0]}.</h1><p>Here's what's happening across your workspace today.</p></div><div className="welcome-icon"><Users size={42} /></div></div>
    <div className="stats-grid">{cards.map(([label, value, Icon, desc]) => <div className="stat-card" key={label}><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={19} /></span></div><div className="stat-value">{value}</div><div className="muted small-text">{desc}</div></div>)}</div>
    <div className="row g-4 mt-1"><div className="col-lg-7"><section className="panel h-100"><div className="section-head"><div><h3>Quick actions</h3><p>Jump into your everyday tasks.</p></div></div><div className="quick-grid"><button onClick={() => setPage("Employees")}><Users /><span>View employees</span></button><button onClick={() => setPage("Attendance")}><CalendarCheck /><span>Attendance</span></button><button onClick={() => setPage("Leave Requests")}><ClipboardList /><span>Leave requests</span></button><button onClick={() => setPage("Announcements")}><Megaphone /><span>Announcements</span></button></div></section></div><div className="col-lg-5"><section className="panel h-100"><div className="section-head"><div><h3>Workspace overview</h3><p>StaffSync at a glance.</p></div></div><div className="overview-line"><span>Announcements</span><strong>{data.dashboard.announcements ?? 0}</strong></div><div className="overview-line"><span>Role</span><strong>{user?.role}</strong></div><div className="overview-line"><span>Department</span><strong>{user?.department || "General"}</strong></div><div className="overview-tip">Tip: Add employees and submit a test leave request to see your dashboard numbers update.</div></section></div></div>
  </div>;
}

function DataTable({ headers, rows }) {
  return <div className="table-responsive"><table className="table align-middle"><thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table>{!rows.length && <div className="empty-state">No records available yet.</div>}</div>;
}
