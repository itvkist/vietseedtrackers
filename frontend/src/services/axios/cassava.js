import axiosInstance, { newAbortSignal } from "services/axios";

export const getCassavas = async () => {
  const res = await axiosInstance.get("/items/cassava?fields=*", {
    signal: newAbortSignal(),
  });
  if (res.status === 200)
    localStorage.setItem("cassava", JSON.stringify(res.data.data));
  return res;
};

export const getCassavaDetail = async (props) =>
  await axiosInstance.get(
    "/items/cassava?fields=*,images.*" +
      (props ? "&filter[id][_eq]=" + props : ""),
    {
      signal: newAbortSignal(),
    }
  );
