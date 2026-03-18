import axiosInstance, { publicAxiosInstance } from "services/axios";
import { APP_URL } from "services/url";

export const getUser = async () => {
  const res = await axiosInstance.get("/users/me");
  return res;
};

export const updateUser = async (data) => {
  const res = await axiosInstance.patch("/users/me", data);
  return res;
};

export const postResquest = async (data) => {
  try {
    const res = await publicAxiosInstance.post("/users", data);
    return res;
  } catch (err) {
    return err;
  }
};

export const postForgotPassword = async (data) => {
  try {
    const res = await publicAxiosInstance.post("/auth/password/request", {
      ...data,
      reset_url: APP_URL + "/forgot_password",
    });
    return res;
  } catch (err) {
    return err;
  }
};

export const postResetPassword = async (data) => {
  try {
    const res = await publicAxiosInstance.post("/auth/password/reset", data);
    return res;
  } catch (err) {
    return err;
  }
};
