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

      window.location.href = "/dashboard";


    } catch (error) {
      if (error.response) {
        // Backend responded with an error (wrong credentials, etc.)
        alert(error.response.data?.message || "Invalid email or password");
      } else {
        // Backend is unreachable — do NOT grant access
        alert("Cannot connect to the server. Please check your connection and try again.");
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

        {/* <p>
          Don't have an account?
          <Link to="/signup">
            Signup
          </Link>
        </p> */}

      </div>
    </div>

  );
}