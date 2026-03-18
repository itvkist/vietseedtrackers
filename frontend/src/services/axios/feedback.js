import axiosInstance, { newAbortSignal } from "services/axios";

export const postFeedback = async (data) => {
  const res = await axiosInstance.post("/items/feedback", data, {
    signal: newAbortSignal(),
  });
  return res;
};
