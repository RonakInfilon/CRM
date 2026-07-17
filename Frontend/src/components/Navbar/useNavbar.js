import { useRole } from "../../context/RoleContext";
import { useNavigate } from "react-router-dom";

export function useNavbar() {
  const { role, setRole, company, setCompany, profile } = useRole();
  const navigate = useNavigate();

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleCompanyChange = (e) => {
    setCompany(e.target.value);
  };

  const getInitials = (fullName) => {
    if (!fullName) return "U";
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return {
    role,
    company,
    profile,
    navigate,
    handleRoleChange,
    handleCompanyChange,
    getInitials,
  };
}
