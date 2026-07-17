import { useLogin } from "./useLogin";
import "../../assets/styles/auth.css";

export default function Login() {
  const {
    loading,
    handleChange,
    handleSubmit,
  } = useLogin();

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
      </div>
    </div>
  );
}