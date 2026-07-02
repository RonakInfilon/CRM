import { useLocation } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import AccessDenied from "../pages/AccessDenied";

function RoleGuard({ children }) {
  const { hasPageAccess } = useRole();
  const location = useLocation();

  if (!hasPageAccess(location.pathname)) {
    return <AccessDenied />;
  }

  return children;
}

export default RoleGuard;
