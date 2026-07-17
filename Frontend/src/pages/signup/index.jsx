import { Link } from "react-router-dom";
import { useSignup } from "./useSignup";
import "../../assets/styles/auth.css";

export default function Signup() {
  const {
    loading,
    handleChange,
    handleSubmit,
  } = useSignup();

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h1>Create Account</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <button type="submit">
            {loading ? "Creating..." : "Signup"}
          </button>
        </form>

        <p>
          Already have an account?
          <Link to="/">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}