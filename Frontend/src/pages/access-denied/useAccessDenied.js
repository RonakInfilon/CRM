import { useNavigate } from "react-router-dom";

export const useAccessDenied = () => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  return {
    handleGoToDashboard,
  };
};
