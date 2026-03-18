import axiosInstance, { newAbortSignal } from "services/axios";

export const getDiseases = async () => {
  const res = await axiosInstance.get("/items/disease?fields=*,images.*", {
    signal: newAbortSignal(),
  });
  if (res.status === 200)
    localStorage.setItem("disease", JSON.stringify(res.data.data));
  return res;
};

export const getDiseaseDetail = async (props) =>
  await axiosInstance.get(
    "/items/disease?fields=*,images.*" +
      (props ? "&filter[id][_eq]=" + props : ""),
    {
      signal: newAbortSignal(),
    }
  );
