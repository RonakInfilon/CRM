import { useState, useEffect, useCallback, useMemo } from "react";
import { getLogs } from "../services/logService";
import { useRole } from "../context/RoleContext";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
} from "../table/index.jsx";
import Pagination from "../components/Pagination.jsx";
import "../styles/LeadTable.css";
import "../styles/AuditLogs.css";

const classify = (action = "") => {
  const a = action.toLowerCase();
  if (a.includes("delete")) return "delete";
  if (a.includes("create") || a.includes("added") || a.includes("add ")) return "create";
  if (a.includes("moved") || a.includes("move")) return "moved";
  if (a.includes("logg") || a.includes("login")) return "login";
  if (a.includes("permission") || a.includes("perm")) return "perm";
  if (a.includes("update") || a.includes("edit") || a.includes("switch") || a.includes("profile")) return "update";
  return "default";
};
//its type lebel use for filtering logs
const typeLabel = {
  create: "Create",
  update: "Update",
  delete: "Delete",
  moved: "Moved",
  login: "Login",
  perm: "Permission",
  default: "Other",
};
//this is use to formateDate
const formatDate = (iso) => {
  if (!iso) return { date: "—", time: "" };
  const d = new Date(iso);  
  return {
    date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
};
//this is used for extract 2 latter from name like Rathwa Ronak it will make RR got it>>??
const initials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "?";
//this is used for limit
const LIMIT = 7;
//this is for static data
const SAMPLE_LOGS = [
  { _id: "1", action: "User login successful",       name: "Ronak Rathwa",   email: "ronak@infilon.com",   time: new Date(Date.now() - 5  * 60000).toISOString() },
  { _id: "2", action: "Lead created: Anjali Sharma", name: "Ronak Rathwa",   email: "ronak@infilon.com",   time: new Date(Date.now() - 15 * 60000).toISOString() },
  { _id: "3", action: "Lead status updated to Qualified", name: "Admin User",email: "admin@crm.com",       time: new Date(Date.now() - 45 * 60000).toISOString() },
  { _id: "4", action: "Lead deleted: John Doe",      name: "Admin User",     email: "admin@crm.com",       time: new Date(Date.now() - 2  * 3600000).toISOString() },
  { _id: "5", action: "Permission updated for Sales Rep", name: "Super Admin",email: "super@crm.com",     time: new Date(Date.now() - 3  * 3600000).toISOString() },
  { _id: "6", action: "Contact moved to Opportunity", name: "Ronak Rathwa",  email: "ronak@infilon.com",   time: new Date(Date.now() - 5  * 3600000).toISOString() },
  { _id: "7", action: "Profile edited by user",      name: "Anjali Sharma",  email: "anjali@athletex.com", time: new Date(Date.now() - 1  * 86400000).toISOString() },
  { _id: "8", action: "Company added: TechCorp",     name: "Admin User",     email: "admin@crm.com",       time: new Date(Date.now() - 2  * 86400000).toISOString() },
];

export default function AuditLogs() {
  //it will check that role is super admin or company admin
  const { isSuperAdmin, isCompanyAdmin } = useRole();
  //onlyi super admin or comapny admin can view this audit logs
  const canView = isSuperAdmin || isCompanyAdmin;
  //this is for logs
  const [logs, setLogs]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [isOffline, setIsOffline]   = useState(false);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);

  // Filters
  const [search, setSearch]     = useState("");
  const [typeFilter, setType]   = useState("all");
  const [sortCol, setSortCol]   = useState("time");
  const [sortDir, setSortDir]   = useState("desc");

  const fetchLogs = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLogs(p, LIMIT);
      if (res.data?.success) {
        setLogs(res.data.data || []);
        const pg = res.data.pagination || {};
        setTotalPages(pg.pages || 1);
        setTotal(pg.total || 0);
        setPage(p);
        setIsOffline(false);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError("You do not have permission to view audit logs.");
      } else {
        // Fallback to sample data when backend is unavailable
        setLogs(SAMPLE_LOGS);
        setTotalPages(1);
        setTotal(SAMPLE_LOGS.length);
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  const displayed = useMemo(() => {
    //make shallow copy of data
    let result = [...logs];

    if (typeFilter !== "all") {
      result = result.filter((l) => classify(l.action) === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          (l.action || "").toLowerCase().includes(q) ||
          (l.name  || "").toLowerCase().includes(q)  ||
          (l.email || "").toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortCol === "time") {
        const ta = new Date(a.time).getTime();
        const tb = new Date(b.time).getTime();
        return sortDir === "desc" ? tb - ta : ta - tb;
      }
      if (sortCol === "name") {
        return sortDir === "desc"
          ? (b.name || "").localeCompare(a.name || "")
          : (a.name || "").localeCompare(b.name || "");
      }
      if (sortCol === "type") {
        const ca = classify(a.action), cb = classify(b.action);
        return sortDir === "desc" ? cb.localeCompare(ca) : ca.localeCompare(cb);
      }
      return 0;
    });

    return result;
  }, [logs, search, typeFilter, sortCol, sortDir]);

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("desc");
    }
  };

  const sortIcon = (col) => {
    if (sortCol !== col) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  };


  if (!canView && !isOffline) {
    return (
      <div className="audit-page">
        <div className="audit-denied">
          <h3>Access Restricted</h3>
          <p>Audit logs are only available to Super Admins and Company Admins.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="audit-page">
      {/* ── Filters bar ── */}
      <div className="audit-filters">
        <div className="audit-search-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="audit-search-input"
            className="audit-search"
            placeholder="Search by action, user name, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          id="audit-type-filter"
          className="audit-filter-select"
          value={typeFilter}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="moved">Moved</option>
          <option value="login">Login</option>
          <option value="perm">Permission</option>
          <option value="default">Other</option>
        </select>
      </div>

      {/* ── Error state ── */}
      {error && (
        <div className="audit-denied">
          <span style={{ fontSize: "2rem" }}>⚠️</span>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}  

      {/* ── Table ── */}
      {!error && (
        <div className="table-wrapper">
          <Table className="crm-table">
            <TableHeader>
              <TableRow>
                <TableCell isHeader style={{ width: 50 }}>No.</TableCell>
                <TableCell isHeader>Action Description</TableCell>
                <TableCell
                  isHeader
                  style={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => handleSort("type")}
                >
                  Type
                </TableCell>
                <TableCell
                  isHeader
                  style={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => handleSort("name")}
                >
                  Performed By
                </TableCell>
                <TableCell
                  isHeader
                  style={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => handleSort("time")}
                >
                  Timestamp
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} style={{ textAlign: "center", padding: "56px 20px", color: "#94a3b8" }}>
                    Loading audit logs…
                  </TableCell>
                </TableRow>
              ) : displayed.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} style={{ textAlign: "center", padding: "56px 20px", color: "#94a3b8" }}>
                    No logs match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                displayed.map((log, i) => {
                  const type = classify(log.action);
                  const { date, time } = formatDate(log.time);
                  return (
                    <TableRow
                      key={log._id || i}
                      style={{ animationDelay: `${Math.min(i * 0.03, 0.3)}s` }}
                    >
                      {/* Index */}
                      <TableCell className="audit-idx">
                        {(page - 1) * LIMIT + i + 1}
                      </TableCell>

                      {/* Action */}
                      <TableCell>
                        <div className="audit-action-cell">
                          <span className="audit-action-text">{log.action}</span>
                        </div>
                      </TableCell>

                      {/* Type badge */}
                      <TableCell>
                        <span className={`audit-type-badge ${type}`}>
                          {typeLabel[type] || "Other"}
                        </span>
                      </TableCell>

                      {/* User */}
                      <TableCell>
                        <div className="audit-user-cell">
                          <div className="audit-avatar">{initials(log.name)}</div>
                          <div>
                            <div className="audit-user-name">{log.name || "—"}</div>
                            <div className="audit-user-email">{log.email || ""}</div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Time */}
                      <TableCell>
                        <div className="audit-time">
                          <div className="audit-time-date">{date}</div>
                          <div className="audit-time-hour">{time}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && !error && totalPages > 1 && !isOffline && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => fetchLogs(p)}
        />
      )}
    </div>
  );
}