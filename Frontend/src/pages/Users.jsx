import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { useRole } from "../context/RoleContext";
import {
  User,
  Mail,
  Phone,
  Key,
  Shield,
  Building2,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Users as GroupIcon
} from "lucide-react";
import "../styles/Users.css";

export default function Users() {
  const { isSuperAdmin, isCompanyAdmin, company } = useRole();
  
  // Lists
  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Company Employee",
    org_id: "",
    phone: "",
    bio: ""
  });
  
  // Notifications
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch Users List
  const fetchUsers = async () => {
    try {
      setListLoading(true);
      const res = await API.get("/auth/users");
      if (res.data && res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setListLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      // /tenant returns a flat array: { success: true, data: [...] }
      const res = await API.get("/tenant");
      if (res.data && res.data.success) {
        setTenants(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (err) {
      console.error("Failed to load tenants:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    if (isSuperAdmin) {
      fetchTenants(); 
    }
  }, [isSuperAdmin]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone || null,
        bio: formData.bio || null,
        org_id: isSuperAdmin ? (formData.org_id ? Number(formData.org_id) : null) : null
      };

      const res = await API.post("/auth/tenant", payload);
      
      if (res.status === 201) {
        setSuccessMsg("User created successfully!");
        
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "Company Employee",
          org_id: "",
          phone: "",
          bio: ""
        });
        
        fetchUsers();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleClass = (roleStr) => {
    switch (roleStr) {
      case "Super Admin": return "superadmin";
      case "Company Admin": return "compadmin";
      case "Manager": return "manager";
      case "Company Employee": return "employee";
      default: return "";
    }
    console.log(fetchTenants)
  };

  return (
    <div className="users-page">
      <div className="users-header">
        <div>
          <h1>User Management</h1>
          <p>
            {isSuperAdmin
              ? "Manage system-wide administrator profiles and assign users to company tenants."
              : `Manage employees and managers for the ${company} organization.`}
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="alert-banner success animate-fade-in">
          <CheckCircle2 size={18} />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="alert-banner error animate-fade-in">
          <AlertCircle size={18} />
          {errorMsg}
        </div>
      )}

      <div className="users-layout">
        
        <div className="users-list-card">
          <h2>
            <GroupIcon size={20} /> Registered Users
          </h2>
          
          {listLoading ? (
            <p>Loading user list...</p>
          ) : users.length === 0 ? (
            <div className="no-users">
              <p>No users registered yet under this context.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th>Role</th>
                    <th>Company</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="user-name-cell">
                          <div className="user-avatar-circle">
                            {u.name ? u.name[0].toUpperCase() : "U"}
                          </div>
                          <div className="user-details">
                            <span>{u.name}</span>
                            <small>{u.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge-role ${getRoleClass(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {u.role === "Super Admin" ? (
                          <span style={{ color: "#e5e7eb", fontWeight: "500" }}>Master Admin</span>
                        ) : u.company ? (
                          <Link 
                            to={`/companies?search=${encodeURIComponent(u.company)}`}
                            style={{ color: "#3b82f6", fontWeight: "500", textDecoration: "underline" }}
                          >
                            {u.company}
                          </Link>
                        ) : (
                          <span style={{ color: "#e5e7eb", fontWeight: "500" }}>N/A</span>
                        )}
                      </td>
                      <td style={{ color: "#9ca3af" }}>
                        {u.phone || "Not provided"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="user-form-card">
          <h2>
            <PlusCircle size={20} /> Add User Profile
          </h2>
          
          <form onSubmit={handleSubmit} className="user-form">
            
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
             
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Initial Password</label>
              <div className="input-with-icon">
                
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number (Optional)</label>
              <div className="input-with-icon">
            
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Assign Account Role</label>
              <div className="input-with-icon">
                <Shield size={16} />
                <select name="role" value={formData.role} onChange={handleChange}>
                  {isSuperAdmin && <option value="Super Admin">Super Admin</option>}
                  {isSuperAdmin && <option value="Company Admin">Company Admin</option>}
                  <option value="Manager">Manager</option>
                  <option value="Company Employee">Company Employee</option>
                </select>
              </div>
            </div>

            {isSuperAdmin && (
              <div className="form-group">
                <label>Company Association</label>
                <div className="input-with-icon">
                  <Building2 size={16} />
                  <select
                    name="org_id"
                    value={formData.org_id}
                    onChange={handleChange}
                    required={formData.role !== "Super Admin"}
                  >
                    <option value="">-- Choose Tenant Company --</option>
                    {Array.isArray(tenants) && tenants.map((t) => (
                      <option key={t.tenant_id} value={t.tenant_id}>
                        {t.company_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {isCompanyAdmin && (
              <div className="form-group">
                <label>Company Association</label>
                <div className="input-with-icon" style={{ opacity: 0.7 }}>
                  <Building2 size={16} />
                  <input
                    type="text"
                    value={company}
                    readOnly
                    style={{ cursor: "not-allowed", background: "rgba(255,255,255,0.05)" }}
                    title="Users you create are automatically assigned to your company"
                  />
                </div>
                <small style={{ color: "#6b7280", marginTop: "4px", display: "block" }}>
                  New users are automatically assigned to <strong>{company}</strong>.
                </small>
              </div>
            )}

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Creating Profile..." : "Create Account"}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}
