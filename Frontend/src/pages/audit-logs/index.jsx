import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
} from "../../components/Table/index.jsx";
import Pagination from "../../components/Pagination";
import {
  useAuditLogs,
  classify,
  typeLabel,
  formatDate,
  initials,
  LIMIT
} from "./useAuditLogs";
import "../../components/LeadTable/LeadTable.styles.css";
import "./audit-logs.styles.css";

export default function AuditLogs() {
  const {
    canView,
    isOffline,
    loading,
    error,
    page,
    totalPages,
    search,
    setSearch,
    typeFilter,
    setType,
    displayed,
    handleSort,
    fetchLogs,
  } = useAuditLogs();

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