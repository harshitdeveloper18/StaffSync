import React from "react";
import { Users, ClipboardList, CalendarCheck, GraduationCap, Megaphone } from "lucide-react";

export default function Dashboard({ data, user, setPage }) {
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

