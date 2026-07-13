import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Button clicked");
    console.log(formData);

    try {
      setLoading(true);

      const response = await API.post(
        "/auth/login",
        formData
      );
      
      console.log("SUCCESS:", response.data);

      // 1. Store auth token
      localStorage.setItem("token", response.data.token);

      // 2. Store profile and role metadata for RoleContext.jsx to pick up
      if (response.data.user) {
        localStorage.setItem("userRole", response.data.user.role);
        localStorage.setItem("userCompany", response.data.user.company);
        localStorage.setItem("userProfile", JSON.stringify(response.data.user));
      }

      window.location.href = "/dashboard";


    } catch (error) {
      if (error.response) {
        // Backend is online but auth failed
        alert(error.response.data?.message || "Invalid email or password");
      } else {
        // Backend is offline (network error)
        console.warn("Backend API offline. Proceeding with offline demo mock token.", error);

        // Seed default credentials / mock session
        localStorage.setItem("token", "mock-offline-token-12345");

        // Also default userRole to Super Admin if not already set, so they can test immediately
        if (!localStorage.getItem("userRole")) {
          localStorage.setItem("userRole", "Super Admin");
          localStorage.setItem("userCompany", "Google");
          localStorage.setItem("userProfile", JSON.stringify({
            name: "Master Admin",
            email: "admin@crm.com",
            phone: "+1 (555) 019-0000",
            avatar: "",
            role: "Super Admin",
            company: "All"
          }));
        }

        window.location.href = "/dashboard";
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            onChange={handleChange}
            required
          />

          <button type="submit">
            {loading ? "Logging..." : "Login"}
          </button>
        </form>

        <p>
          Don't have an account?
          <Link to="/signup">
            Signup
          </Link>
        </p>

      </div>
    </div>

  );
}