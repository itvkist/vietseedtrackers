import axiosInstance, { newAbortSignal } from "services/axios";

export const getMapData = async (type = "district", parent_code = null) =>
  await axiosInstance.get(
    "/items/area?limit=-1" +
      `&filter[type][_eq]=${type}` +
      (parent_code ? `&filter[parent_code][_eq]=${parent_code}` : ""),
    {
      signal: newAbortSignal(),
    }
  );

export const getAreaDisease = async () =>
  await axiosInstance.get("/items/area_disease?limit=-1", {
    signal: newAbortSignal(),
  });

export const getAllMapData = async () => {
  const area = localStorage.getItem("area");
  if (area) return JSON.parse(area);
  else {
    let allMapData = null;
    await getMapData().then(async (response) => {
      if (response.status === 200) {
        allMapData = response.data.data;
        allMapData = await Promise.all(
          allMapData.map(async (district) => {
            return await getMapData("ward", district.code).then((wardsRes) =>
              wardsRes.status === 200
                ? { ...district, wards: wardsRes.data.data }
                : { ...district }
            );
          })
        );
      }
    });
    localStorage.setItem("area", JSON.stringify(allMapData));
    return allMapData;
  }
};

export const getMergedAreaDiseaseData = async (
  diseaseData = [],
  cassavaData = []
) => {
  var areaDisease = [];
  await getAreaDisease().then(async (response) => {
    if (response.status === 200) {
      areaDisease = response.data.data;
      areaDisease = areaDisease.map((i) => {
        const findingDisease = diseaseData.find(
          (e) => e.label === i.disease_label
        );
        const findingCassava = cassavaData.find(
          (e) => e.label === i.cassava_label
        );

        return {
          ...i,
          disease_id: findingDisease?.id || null,
          disease_name: findingDisease?.vn_name || i.disease_label,
          cassava_id: findingCassava?.id || null,
          cassava_name: findingCassava?.original_name || i.cassava_label,
        };
      });
    }
  });
  return areaDisease;
};
