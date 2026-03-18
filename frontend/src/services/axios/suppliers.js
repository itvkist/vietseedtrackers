import axiosInstance, { newAbortSignal } from "services/axios";

export const getSuppliers = async () =>
  await axiosInstance.get("/users", {
    signal: newAbortSignal(),
  });
