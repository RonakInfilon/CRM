import API from "../api";

export const getDashboardData = () => {
  return API.get("/dashboard");
};
