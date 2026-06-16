import API from "../api";

export const loginUser = async (data) => {
  const response = await API.post(
    "/login",
    data
  );

  return response.data;
};

export const signupUser = async (data) => {
  const response = await API.post(
    "/signup",
    data
  );

  return response.data;
};