import axiosInstance, { newAbortSignal } from "services/axios";

export const getDemands = async (type = "sell") =>
  await axiosInstance.get(`/items/demand?filter[type][_eq]=${type}`, {
    signal: newAbortSignal(),
  });

export const postDemand = async (params) =>
  await axiosInstance.post("/items/demand", params, {
    signal: newAbortSignal(),
  });

export const patchDemand = async (id, params) =>
  await axiosInstance.patch("/items/demand/" + id, params, {
    signal: newAbortSignal(),
  });

export const deleteDemand = async (id) =>
  await axiosInstance.delete("/items/demand/" + id, {
    signal: newAbortSignal(),
  });

export const getUserDemands = async (type = "sell", user_id) =>
  await axiosInstance.get(
    `/items/demand?filter[type][_eq]=${type}&filter[user_id][_eq]=${user_id}`,
    {
      signal: newAbortSignal(),
    }
  );
