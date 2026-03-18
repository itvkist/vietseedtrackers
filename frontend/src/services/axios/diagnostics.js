import axiosInstance, { newAbortSignal } from "services/axios";

export const getDiagnosticDetail = async (props) =>
  await axiosInstance.get("/items/diagnostics/" + (props ? props : ""), {
    signal: newAbortSignal(),
  });

export const getDiagnosticImage = async (props) =>
  await axiosInstance.get(
    `/items/diagnostics_files?fields[]=directus_files_id.id&fields[]=directus_files_id.type&fields[]=directus_files_id.title&fields[]=directus_files_id.filename_download&fields[]=id&filter[_and][0][diagnostics_id]=${props}`
  );

export const postDiagnostic = async (props) =>
  await axiosInstance.post("/items/diagnostics", props, {
    signal: newAbortSignal(),
  });

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

export const postDiagnosticClassify = async (formData) => {
  const response = { status: 200, data: [] };
  const diseases = JSON.parse(localStorage.getItem('disease')) || [];
  if (diseases.length <= 0) return response;
  const total_diseases = getRandom(5, diseases.length);
  response.data = diseases.slice(0, total_diseases).map(d => ({ label: d.label, probability: Math.round(Math.random() * 1000) / 1000 }))
  return response;

  // await axiosInstance.post(
  //   "https://996a-123-16-55-212.ngrok-free.app/classify_image",
  //   formData,
  //   {
  //     headers: { "Content-Type": "multipart/form-data" },
  //   }
  // );
}
