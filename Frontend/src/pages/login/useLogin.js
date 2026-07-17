import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

export const useLogin = () => {
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

      localStorage.setItem("token", response.data.token);
      window.location.href = "/dashboard";

    } catch (error) {
      if (error.response) {
        alert(error.response.data?.message || "Invalid email or password");
      } else {
        alert("Cannot connect to the server. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    handleChange,
    handleSubmit,
  };
};
