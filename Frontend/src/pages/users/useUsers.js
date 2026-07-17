import { useState, useEffect } from "react";
import API from "../../services/api";
import { useRole } from "../../context/RoleContext";

export const useUsers = () => {
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
  };

  return {
    isSuperAdmin,
    isCompanyAdmin,
    company,
    users,
    tenants,
    loading,
    listLoading,
    formData,
    successMsg,
    errorMsg,
    handleChange,
    handleSubmit,
    getRoleClass,
  };
};
