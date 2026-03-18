import React, { useEffect, useState } from "react";
import { css } from "styled-components/macro"; //eslint-disable-line
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import { Table, Typography, Image, Input, Button, Empty } from "antd";
import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { getDiseaseDetail, getDiseases } from "services/axios/disease";
import { BASE_URL } from "services/url";
import { compareStringPro } from "services/helper";

const cropString = (text) => {
  return text.length > 253 ? text.substring(0, 250) + "..." : text;
};

const mainDetailColumns = [
  {
    title: "STT",
    dataIndex: "key",
    width: "5%",
  },
  {
    title: "Đặc điểm",
    dataIndex: "feature",
    width: "10%",
  },
  {
    title: "Thông tin",
    dataIndex: "info",
    width: "85%",
  },
];

const detailColumns = [
  { name: "Nhãn", api_name: "label" },
  { name: "Tên", api_name: "name" },
  { name: "Tên tiếng Việt", api_name: "vn_name" },
  { name: "Đặc điểm", api_name: "feature" },
  { name: "Ảnh hưởng", api_name: "effect" },
  { name: "Cách chữa", api_name: "cure" },
];

const mainColumns = [
  {
    title: "STT",
    dataIndex: "key",
    sorter: (a, b) => a.key > b.key,
    render: (_v, _r, index) => {
      return index + 1;
    },
    width: "5%",
  },
  ...detailColumns.slice(0, 3).map((i) => ({
    title: i.name,
    dataIndex: i.api_name,
    sorter: (a, b) =>
      a[i.api_name] && b[i.api_name]
        ? a[i.api_name].localeCompare(b[i.api_name])
        : 0,
    render: (v) => {
      return v ? v : "Chưa có dữ liệu";
    },
    width: "8%",
  })),
  ...detailColumns.slice(3).map((i) => ({
    title: i.name,
    dataIndex: i.api_name,
    render: (v) => {
      return v ? cropString(v) : "Chưa có dữ liệu";
    },
    width: "22%",
  })),
  {
    title: "Chi tiết",
    dataIndex: "info",
    render: (_, record) => {
      return (
        <Link
          to={"/diseases/" + record.id}
          className="text-indigo-500 underline hover:text-indigo-700 hover:underline"
          rel="noopener noreferrer"
        >
          Xem thêm
        </Link>
      );
    },
    width: "10%",
  },
];

export const DiseaseDetail = (props) => {
  const navigate = useNavigate();
  const [apiData, setApiData] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    getDiseaseDetail(props.id).then((res) => {
      const res_data = res?.data?.data[0];
      setApiData(res_data);
      const applyData = detailColumns
        .filter((e) => res_data[e.api_name])
        .map((i, index) => ({
          feature: i.name,
          info: res_data[i.api_name],
          key: index + 1,
        }));
      setData(applyData);
    });
  }, [props.id]);

  const renderImage = () => {
    if (apiData?.images && apiData?.images?.length > 0) {
      const urls = apiData.images.map(
        (i) => BASE_URL + "/assets/" + i?.directus_files_id
      );
      return (
        <div className="img-list">
          {urls.map((i, index) => (
            <Image
              key={index}
              width={300}
              height={300}
              className="object-contain"
              src={i}
              preview={false}
              fallback="https://pqm.vn/wp-content/uploads/2021/02/phuong-phap-trong-va-cham-soc-cay-san-cay-san-cay-khoai-mi-neo-nam-viet-1-768x432.jpg"
            />
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <AnimationRevealPage>
      {apiData ? (
        <>
          <div className="flex flex-col justify-center items-center h-[140px] text-lg">
            <div className="flex items-center justify-center sm:py-4">
              <Button
                className="absolute"
                style={{ left: "-280px" }}
                size="large"
                shape="circle"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
              />
              <Typography.Title style={{ margin: 4 }}>
                Loại bệnh {apiData?.name}
              </Typography.Title>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center]">
            {data && (
              <div className="w-full flex flex-col items-center sm:space-x-24">
                <div className="flex h-[300px] w-full overflow-overlay justify-center">
                  {renderImage()}
                  {!apiData?.images && (
                    <Empty description="Không có hình ảnh" />
                  )}
                </div>
                <Table
                  columns={mainDetailColumns}
                  dataSource={data}
                  className="sm:w-4/5 w-full overflow-auto h-full overflow-overlay disease-table-detail"
                  pagination={{ pageSize: 50, hideOnSinglePage: true }}
                />
              </div>
            )}
          </div>
        </>
      ) : (
        <Empty
          className="flex items-center justify-center flex-1 h-full"
          description="Không tìm thấy loại bệnh này"
        />
      )}
    </AnimationRevealPage>
  );
};

export default () => {
  const [diseaseData, setDiseaseData] = useState(null);
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getDiseases().then((res) => {
      const id_res = res.data.data.map((i) => ({ ...i, key: i.id.toString() }));
      setDiseaseData(id_res);
      setData(id_res);
    });
  }, []);

  const onSearch = (v) => {
    const lowerSearch = v.toLowerCase();
    setData(
      [...diseaseData].filter(
        (i) =>
          compareStringPro(i.label || "", lowerSearch) ||
          compareStringPro(i.name || "", lowerSearch) ||
          compareStringPro(i.vn_name || "", lowerSearch)
      )
    );
  };
  const reset = () => {
    setSearch("");
    setData(diseaseData);
  };
  return (
    <AnimationRevealPage>
      <div className="flex flex-col justify-center items-center sm:px-0 px-4 text-center">
        <Typography.Title>Danh sách bệnh trên cây sắn</Typography.Title>
      </div>
      <div className="flex flex-col justify-center items-center">
        <div className="w-96 flex space-x-4 justify-center pb-4 px-4 sm:px-0">
          <Input.Search
            placeholder="Tìm kiếm theo tên"
            value={search}
            onChange={(v) => setSearch(v.target.value)}
            onSearch={onSearch}
          />
          <Button icon={<ReloadOutlined />} onClick={reset} />
        </div>
      </div>
      <div className="flex flex-col justify-center items-center disease-table">
        <Table
          columns={mainColumns}
          dataSource={data}
          className="w-full h-4/5 overflow-auto sm:px-20 px-4"
          pagination={{ hideOnSinglePage: true }}
        />
      </div>
    </AnimationRevealPage>
  );
};
