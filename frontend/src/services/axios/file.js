import axiosInstance, { newAbortSignal } from "services/axios";

export const postFile = async (formData) => {
  return await axiosInstance.post("/files", formData, {
    signal: newAbortSignal(),
  });
};
