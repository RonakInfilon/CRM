import API from "../../services/api";

export const getDashboardData = () => {
  return API.get("/dashboard");
};
