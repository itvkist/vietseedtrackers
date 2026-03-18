import React, { useContext, useEffect, useState } from "react";
import { css } from "styled-components/macro"; //eslint-disable-line
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import { Button, Col, List, Row, Select, Typography } from "antd";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { compareStringPro } from "services/helper";
import Context from "services/context";
import { ReloadOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { getMergedAreaDiseaseData } from "services/axios/map";

var iconLibs = [
  { icon: "marker_blue.png", meaning: "Các quận / huyện" },
  { icon: "marker_yellow.png", meaning: "Các phường / xã" },
  { icon: "marker_red.png", meaning: "Nơi có dịch bệnh" },
];

var CustomIcon = (iconName = "marker_blue", degree = 0) => {
  degree *= 4;
  var iconSize = 2 * (16 + degree);
  var shadowSize = 2 * (14 + degree);
  var shadowAnchor = 2 * 5 + degree;
  return new L.Icon({
    iconUrl: require(`../../public/assets/icons/${iconName}.png`),
    shadowUrl: require("../../public/assets/icons/marker_shadow.png"),
    iconSize: [iconSize, iconSize],
    shadowSize: [shadowSize, shadowSize],
    iconAnchor: [iconSize / 2, iconSize],
    shadowAnchor: [shadowAnchor, shadowSize],
    popupAnchor: [0, -iconSize - 2],
  });
};

export const DEFAULT_AREA_DATA = {
  districts: null,
  selectedData: {
    district: null,
    ward: null,
    disease: null,
    degree: null,
    cassava: null,
  },
};

const convertDegree = (degree) => {
  degree = Number.parseInt(degree);
  return degree === 3
    ? "Rất nghiêm trọng"
    : degree === 2
    ? "Nghiêm trọng"
    : "Chưa nghiêm trọng";
};

export default () => {
  const context = useContext(Context);

  const [areaData, setAreaData] = useState(DEFAULT_AREA_DATA);
  const [diseaseData, setDiseaseData] = useState(null);
  const [cassavaData, setCassavaData] = useState(null);
  const [areaDiseaseData, setAreaDiseaseData] = useState([]);

  const getAreaDiseaseData = async () => {
    await getMergedAreaDiseaseData(diseaseData, cassavaData).then(
      (areaDisease) => {
        setAreaDiseaseData([...areaDisease]);
      }
    );
  };

  useEffect(() => {
    diseaseData && cassavaData && getAreaDiseaseData();
    // eslint-disable-next-line
  }, [diseaseData, cassavaData]);

  // set map for diseases
  useEffect(() => {
    if (context.disease && context.cassava) {
      if (!cassavaData) setCassavaData(context.cassava);
      if (!diseaseData) setDiseaseData(context.disease);
    }
    if (context.mapData) {
      setAreaData({ ...areaData, districts: context.mapData });
    }
    // eslint-disable-next-line
  }, [context?.disease, context?.cassava]);

  const reset = () => {
    setAreaData({
      ...areaData,
      selectedData: { ...DEFAULT_AREA_DATA.selectedData },
    });
  };

  const setAreaDataState = (label, value) => {
    // eslint-disable-next-line
    switch (label) {
      case "degree":
        setAreaData({
          ...areaData,
          selectedData: {
            ...areaData.selectedData,
            degree: Number.parseInt(value),
          },
        });
        break;
      case "disease":
        setAreaData({
          ...areaData,
          selectedData: {
            ...areaData.selectedData,
            disease: diseaseData.find((i) => i.label === value),
          },
        });
        break;
      case "district":
        setAreaData({
          ...areaData,
          selectedData: {
            ...areaData.selectedData,
            district: areaData.districts.find((i) => i.code === value),
            ward: null,
          },
        });
        break;
      case "ward":
        setAreaData({
          ...areaData,
          selectedData: {
            ...areaData.selectedData,
            ward: areaData.selectedData.district.wards.find(
              (i) => i.code === value
            ),
          },
        });
        break;
      case "cassava":
        setAreaData({
          ...areaData,
          selectedData: {
            ...areaData.selectedData,
            cassava: cassavaData.find((i) => i.label === value),
          },
        });
        break;
    }
  };

  const checkDiseaseInArea = (area_code) =>
    areaData.selectedData.district.wards?.find(
      (i) => Number.parseInt(i.code) === Number.parseInt(area_code)
    )
      ? true
      : false;

  const filteredDiseases = () => {
    return (
      areaDiseaseData?.filter((i) => {
        var bool = true;
        if (bool && areaData.selectedData.cassava) {
          bool = i.cassava_label === areaData.selectedData.cassava.label;
        }
        if (bool && areaData.selectedData.disease) {
          bool = i.disease_label === areaData.selectedData.disease.label;
        }
        if (bool && areaData.selectedData.degree) {
          bool =
            Number.parseInt(i.degree) ===
            Number.parseInt(areaData.selectedData.degree);
        }
        if (bool && areaData.selectedData.ward) {
          bool =
            Number.parseInt(i.area_code) ===
            Number.parseInt(areaData.selectedData.ward.code);
        } else if (bool && areaData.selectedData.district) {
          const parse = Number.parseInt(i.area_code);
          bool =
            parse === Number.parseInt(areaData.selectedData.district.code) ||
            checkDiseaseInArea(parse);
        }
        return bool;
      }) || []
    );
  };

  return (
    <AnimationRevealPage>
      <div className="flex flex-col justify-center items-center">
        <Typography.Title>Bản đồ theo dõi nguồn giống</Typography.Title>
      </div>
      <div className="flex justify-evenly items-center pb-4 w-full flex-col sm:flex-row">
        <div className="flex justify-center flex-col items-center">
          {/* z-index = 1000 */}
          <Row
            gutter={16}
            className="pb-8 !flex-col space-y-4 sm:!flex-row sm:space-y-0"
          >
            {iconLibs.map((i, index) => (
              <Col span={8} key={index}>
                <div className="p-2 border border-solid w-44 flex items-center">
                  <img
                    src={`assets/icons/${i.icon}`}
                    alt={i.icon}
                    className="h-5 w-5"
                  />{" "}
                  : {i.meaning}
                </div>
              </Col>
            ))}
          </Row>
          {MapDiv({ areaData: areaData, filteredDiseases: filteredDiseases })}
        </div>
        <div className="flex justify-center">
          <div className="sm:mt-[70px]">
            <List
              className="sm:h-[700px] overflow-y-auto"
              header={
                <>
                  <div className="space-y-4 hidden sm:block">
                    <div className="space-x-4">
                      {
                        <Select
                          className="w-[448px]"
                          showSearch
                          placeholder="Chọn một loại sắn"
                          optionFilterProp="children"
                          value={
                            areaData.selectedData.cassava?.original_name ||
                            areaData.selectedData.cassava?.label
                          }
                          onChange={(value) => {
                            setAreaDataState("cassava", value);
                          }}
                          filterOption={(input, option) =>
                            compareStringPro(option?.label, input)
                          }
                          options={
                            cassavaData && cassavaData.length > 0
                              ? cassavaData.map((i) => ({
                                  value: i.label,
                                  label: i.original_name || i.label,
                                }))
                              : []
                          }
                        />
                      }
                      <Button icon={<ReloadOutlined />} onClick={reset} />
                    </div>
                    <div className="space-x-4">
                      {
                        <Select
                          className="w-[240px]"
                          showSearch
                          placeholder="Chọn một loại bệnh"
                          optionFilterProp="children"
                          value={
                            areaData.selectedData.disease?.vn_name ||
                            areaData.selectedData.disease?.name
                          }
                          onChange={(value) => {
                            setAreaDataState("disease", value);
                          }}
                          filterOption={(input, option) =>
                            compareStringPro(option?.label, input)
                          }
                          options={
                            diseaseData && diseaseData.length > 0
                              ? diseaseData.map((i) => ({
                                  value: i.label,
                                  label: i.vn_name || i.name,
                                }))
                              : []
                          }
                        />
                      }
                      {
                        <Select
                          className="w-[240px]"
                          showSearch
                          placeholder="Chọn một mức độ"
                          optionFilterProp="children"
                          value={
                            areaData?.selectedData.degree
                              ? convertDegree(areaData.selectedData.degree)
                              : null
                          }
                          onChange={(value) => {
                            setAreaDataState("degree", value);
                          }}
                          filterOption={(input, option) =>
                            compareStringPro(option?.label, input)
                          }
                          options={
                            [1, 2, 3].map((i) => ({
                              value: i,
                              label: convertDegree(i.degree),
                            })) || []
                          }
                        />
                      }
                    </div>
                    <div className="space-x-4">
                      {
                        <Select
                          className="w-[240px]"
                          showSearch
                          placeholder="Chọn một thành phố / quận"
                          optionFilterProp="children"
                          value={areaData.selectedData.district?.code}
                          onChange={(value) => {
                            setAreaDataState("district", value);
                          }}
                          filterOption={(input, option) =>
                            compareStringPro(option?.label, input)
                          }
                          options={
                            areaData.districts && areaData.districts.length > 0
                              ? areaData.districts.map((i) => ({
                                  value: i.code,
                                  label: i.name,
                                }))
                              : []
                          }
                        />
                      }
                      {
                        <Select
                          className="w-[240px]"
                          showSearch
                          placeholder="Chọn một huyện / phường"
                          optionFilterProp="children"
                          value={areaData.selectedData.ward?.code}
                          onChange={(value) => {
                            setAreaDataState("ward", value);
                          }}
                          filterOption={(input, option) =>
                            compareStringPro(option?.label, input)
                          }
                          options={
                            areaData.selectedData.district &&
                            areaData.selectedData.district.wards &&
                            areaData.selectedData.district.wards.length > 0
                              ? areaData.selectedData.district.wards.map(
                                  (i) => ({
                                    value: i.code,
                                    label: i.name,
                                  })
                                )
                              : []
                          }
                        />
                      }
                    </div>
                  </div>
                  <div className="w-full flex flex-col space-y-4 sm:hidden">
                    <Button icon={<ReloadOutlined />} onClick={reset} />
                    <Select
                      className="w-full"
                      showSearch
                      placeholder="Chọn một loại sắn"
                      optionFilterProp="children"
                      value={
                        areaData.selectedData.cassava?.original_name ||
                        areaData.selectedData.cassava?.label
                      }
                      onChange={(value) => {
                        setAreaDataState("cassava", value);
                      }}
                      filterOption={(input, option) =>
                        compareStringPro(option?.label, input)
                      }
                      options={
                        cassavaData && cassavaData.length > 0
                          ? cassavaData.map((i) => ({
                              value: i.label,
                              label: i.original_name || i.label,
                            }))
                          : []
                      }
                    />
                    <Select
                      className="w-full"
                      showSearch
                      placeholder="Chọn một loại bệnh"
                      optionFilterProp="children"
                      value={
                        areaData.selectedData.disease?.vn_name ||
                        areaData.selectedData.disease?.name
                      }
                      onChange={(value) => {
                        setAreaDataState("disease", value);
                      }}
                      filterOption={(input, option) =>
                        compareStringPro(option?.label, input)
                      }
                      options={
                        diseaseData && diseaseData.length > 0
                          ? diseaseData.map((i) => ({
                              value: i.label,
                              label: i.vn_name || i.name,
                            }))
                          : []
                      }
                    />
                    <Select
                      className="w-full"
                      showSearch
                      placeholder="Chọn một mức độ"
                      optionFilterProp="children"
                      value={
                        areaData?.selectedData.degree
                          ? convertDegree(areaData.selectedData.degree)
                          : null
                      }
                      onChange={(value) => {
                        setAreaDataState("degree", value);
                      }}
                      filterOption={(input, option) =>
                        compareStringPro(option?.label, input)
                      }
                      options={
                        [1, 2, 3].map((i) => ({
                          value: i,
                          label: convertDegree(i.degree),
                        })) || []
                      }
                    />
                    <Select
                      className="w-full"
                      showSearch
                      placeholder="Chọn một thành phố / quận"
                      optionFilterProp="children"
                      value={areaData.selectedData.district?.code}
                      onChange={(value) => {
                        setAreaDataState("district", value);
                      }}
                      filterOption={(input, option) =>
                        compareStringPro(option?.label, input)
                      }
                      options={
                        areaData.districts && areaData.districts.length > 0
                          ? areaData.districts.map((i) => ({
                              value: i.code,
                              label: i.name,
                            }))
                          : []
                      }
                    />
                    <Select
                      className="w-full"
                      showSearch
                      placeholder="Chọn một huyện / phường"
                      optionFilterProp="children"
                      value={areaData.selectedData.ward?.code}
                      onChange={(value) => {
                        setAreaDataState("ward", value);
                      }}
                      filterOption={(input, option) =>
                        compareStringPro(option?.label, input)
                      }
                      options={
                        areaData.selectedData.district &&
                        areaData.selectedData.district.wards &&
                        areaData.selectedData.district.wards.length > 0
                          ? areaData.selectedData.district.wards.map((i) => ({
                              value: i.code,
                              label: i.name,
                            }))
                          : []
                      }
                    />
                  </div>
                </>
              }
              bordered
              dataSource={filteredDiseases()}
              renderItem={(item) => (
                <List.Item>
                  <div className="flex justify-between items-center w-full space-x-4">
                    <div>
                      <Link
                        to={
                          "/diseases/" +
                          (item.disease_id ? item.disease_id : "")
                        }
                        className="text-indigo-500 underline hover:text-indigo-700 hover:underline"
                      >
                        {item.disease_name}
                      </Link>
                      {" - "}
                      <Link
                        to={
                          "/cassavas/" +
                          (item.cassava_id ? item.cassava_id : "")
                        }
                        className="text-indigo-500 underline hover:text-indigo-700 hover:underline"
                      >
                        {item.cassava_name}
                      </Link>
                    </div>
                    <Typography.Text>
                      Mức độ:{" "}
                      {Number.parseInt(item.degree) === 1 ? (
                        <span className="text-green-600">
                          {convertDegree(item.degree)}
                        </span>
                      ) : Number.parseInt(item.degree) === 2 ? (
                        <span className="text-yellow-600">
                          {convertDegree(item.degree)}
                        </span>
                      ) : (
                        <span className="text-red-600">
                          {convertDegree(item.degree)}
                        </span>
                      )}
                    </Typography.Text>
                  </div>
                </List.Item>
              )}
            />
          </div>
        </div>
      </div>
    </AnimationRevealPage>
  );
};

// areaData.districts , filteredDiseases() || areaData.selectedData.district , areaData.selectedData.district.wards ,
export function MapDiv({ areaData, filteredDiseases }) {
  return (
    <MapContainer
      className="lg:h-[700px] lg:w-[1000px] w-[80vw] h-[70vw]"
      center={[11.375, 106.1313]}
      zoom={12}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {areaData.selectedData.district && (
        <Marker
          key={areaData.selectedData.district.code}
          position={[
            areaData.selectedData.district.lat,
            areaData.selectedData.district.lon,
          ]}
          icon={CustomIcon()}
        >
          <Popup>{areaData.selectedData.district.name}</Popup>
        </Marker>
      )}
      {areaData.selectedData.ward && (
        <Marker
          key={areaData.selectedData.ward.code}
          position={[
            areaData.selectedData.ward.lat,
            areaData.selectedData.ward.lon,
          ]}
          icon={CustomIcon("marker_yellow")}
        >
          <Popup>{areaData.selectedData.ward.name}</Popup>
        </Marker>
      )}
      {filteredDiseases().map((i, index) => (
        <Marker
          key={index}
          position={[i.lat, i.lon]}
          icon={CustomIcon("marker_red", parseInt(i.degree))}
        >
          <Popup>
            {"Bệnh: " + i.disease_name}
            <br />
            {"Giống sắn: " + i.cassava_name}
            <br />
            Mức độ: {convertDegree(i.degree)}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
