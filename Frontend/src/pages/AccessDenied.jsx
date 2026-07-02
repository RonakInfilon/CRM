import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/AccessDenied.css";

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="access-denied-container">
      <div className="access-denied-card">
        <div className="icon-badge">
          <ShieldAlert size={48} className="alert-icon" />
        </div>
        <h1>Access Denied</h1>
        <p>
          You do not have the required permissions to view this module. If you believe this is an error, please contact your System Administrator.
        </p>
        <button onClick={() => navigate("/dashboard")} className="back-home-btn">
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AccessDenied;
