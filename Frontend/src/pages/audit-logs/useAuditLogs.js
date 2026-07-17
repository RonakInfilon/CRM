import { useState, useEffect, useCallback, useMemo } from "react";
import { getLogs } from "./logService";
import { useRole } from "../../context/RoleContext";

export const classify = (action = "") => {
  const a = action.toLowerCase();
  if (a.includes("delete")) return "delete";
  if (a.includes("create") || a.includes("added") || a.includes("add ")) return "create";
  if (a.includes("moved") || a.includes("move")) return "moved";
  if (a.includes("logg") || a.includes("login")) return "login";
  if (a.includes("permission") || a.includes("perm")) return "perm";
  if (a.includes("update") || a.includes("edit") || a.includes("switch") || a.includes("profile")) return "update";
  return "default";
};

export const typeLabel = {
  create: "Create",
  update: "Update",
  delete: "Delete",
  moved: "Moved",
  login: "Login",
  perm: "Permission",
  default: "Other",
};

export const formatDate = (iso) => {
  if (!iso) return { date: "—", time: "" };
  const d = new Date(iso);  
  return {
    date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
};

export const initials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "?";

export const LIMIT = 7;

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

export const useAuditLogs = () => {
  const { isSuperAdmin, isCompanyAdmin } = useRole();
  const canView = isSuperAdmin || isCompanyAdmin;

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

  return {
    canView,
    isOffline,
    logs,
    loading,
    error,
    page,
    totalPages,
    total,
    search,
    setSearch,
    typeFilter,
    setType,
    displayed,
    handleSort,
    sortIcon,
    fetchLogs,
  };
};
