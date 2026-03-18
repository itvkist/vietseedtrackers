import React, { useContext, useEffect, useState } from "react";
import { css } from "styled-components/macro"; //eslint-disable-line
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import { Button, Input, Select, Table, Typography } from "antd";
import { getSuppliers } from "services/axios/suppliers";
import Context from "services/context";
import { Link } from "react-router-dom";
import { ReloadOutlined } from "@ant-design/icons";
import { compareStringNormal, compareStringPro } from "services/helper";

const api = [
  "key",
  "title",
  "email",
  "phone",
  "desc_cassava",
  "desc_detail",
  "location",
  "description", // insert new api before this line
];

const STATUS_OPTIONS = [
  { value: "active", label: "Đang cung cấp" },
  { value: "inactive", label: "Ngừng cung cấp" },
];

const convertEnToVn = (en) => {
  if (en === api[0]) return "STT";
  if (en === api[1]) return "Tên";
  if (en === api[2]) return "Email";
  if (en === api[3]) return "Số điện thoại";
  if (en === api[4]) return "Các loại giống";
  if (en === api[5]) return "Mô tả chi tiết";
  if (en === api[6]) return "Địa chỉ";
  return en;
};

const DEFAULT_FILTER = { search: null, status: null, cassava: [] };

const renderEmail = (href, val) => (
  <a href={href || "#"} className="text-blue-600">
    {val || "Chưa có thông tin"}
  </a>
);
const renderStatus = (val) =>
  val === STATUS_OPTIONS[0].value ? (
    <span className="text-green-500">{STATUS_OPTIONS[0].label}</span>
  ) : val === STATUS_OPTIONS[1].value ? (
    <span className="text-red-500">{STATUS_OPTIONS[1].label}</span>
  ) : (
    <span>Chưa có thông tin</span>
  );
// eslint-disable-next-line
const renderDescDetail = (val) => {
  if (!val || val.length < 1) return "Chưa có thông tin";
  return (
    <div>
      {val.map((i, index) => {
        return <div key={api[5] + index}>- {i}</div>;
      })}
    </div>
  );
};
const renderLocation = (val) => {
  if (!val || val.length < 1) return "Chưa có thông tin";
  return (
    <a
      className="text-blue-600"
      target={"_blank"}
      rel="noreferrer"
      href={"https://www.google.com/maps/search/" + val}
    >
      {val}
    </a>
  );
};

export default () => {
  const context = useContext(Context);
  const [cassavaData, setCassavaData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState({ ...DEFAULT_FILTER });

  useEffect(() => {
    if (context.cassava) {
      setCassavaData(context.cassava);
    }
    // eslint-disable-next-line
  }, [context?.cassava]);

  const renderDescCassava = (val) => {
    if (!val || Object.keys(val).length === 0) return "Chưa có thông tin";
    const cassava_labels = Object.keys(val);
    return (
      <div>
        {cassava_labels.map((i) => {
          return (
            <div key={i}>
              {"- "}
              <Link
                to={"/cassavas/" + cassavaData?.find((c) => c.label === i)?.id}
                className="text-blue-600"
              >
                {i}
              </Link>
              : {renderStatus(val[i]) || "Chưa có thông tin"}
            </div>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    if (cassavaData)
      getSuppliers().then((res) => {
        const lastIndex = api.length - 1;
        // filter response data and standardize data to map api
        const resData =
          res?.data?.data
            ?.filter((i) => i[api[1]] && i[api[2]] && i[api[3]])
            .map((i, index) => {
              const json_desc = JSON.parse(i[api[lastIndex]]);
              var ret = {
                key: index.toString(),
                ...i,
                desc_cassava: json_desc?.cassava || {},
                desc_detail: json_desc?.detail,
              };
              delete ret[api[lastIndex]];
              return ret;
            }) || [];

        // create columns
        if (resData && resData.length > 0) {
          setColumns([
            ...Object.keys(resData[0])
              .filter((i) => api.indexOf(i) > -1)
              .map((i) => {
                var ret = {
                  title: convertEnToVn(i),
                  dataIndex: i,
                };

                // STT
                if (i === api[0])
                  ret = {
                    ...ret,
                    render: (_v, _r, index) => index + 1,
                  };

                // email
                if (i === api[2])
                  ret = {
                    ...ret,
                    render: (val) => renderEmail("mailto:" + val, val),
                  };

                // cassava_label: Quantity
                if (i === api[4])
                  ret = {
                    ...ret,
                    render: (val) => renderDescCassava(val),
                  };

                // description detail
                if (i === api[5])
                  ret = {
                    ...ret,
                    render: (val) => renderDescDetail(val),
                  };

                // location
                if (i === api[6])
                  ret = {
                    ...ret,
                    render: (val) => renderLocation(val),
                  };

                return ret;
              }),
          ]);

          // set data
          setData(resData);
        }
      });
    // eslint-disable-next-line
  }, [cassavaData]);

  const CASSAVA_OPTIONS = () =>
    cassavaData?.map((i) => ({ value: i.label, label: i.label })) || [];

  const reset = () => {
    setFilter({ ...DEFAULT_FILTER });
  };

  // filter data
  const dataSrc = () => {
    if (!data || data.length < 1) return [];

    var ret = data;

    if (filter.search)
      ret = ret.filter(
        (i) =>
          compareStringNormal(i[api[3]], filter.search) ||
          compareStringPro(i[api[1]], filter.search)
      );

    // filter by status when no cassava label selected
    if (filter.cassava?.length < 1 && filter.status) {
      ret = ret.filter(
        (row) =>
          row[api[4]] && Object.values(row[api[4]]).includes(filter.status)
      );
    }

    // filter by cassava label and status
    filter.cassava.map(
      (selected_cassava_label) =>
        (ret = ret.filter(
          (row) =>
            row[api[4]] &&
            row[api[4]][selected_cassava_label] &&
            (!filter.status ||
              (filter.status &&
                row[api[4]][selected_cassava_label] === filter.status))
        ))
    );

    return ret;
  };

  return (
    <AnimationRevealPage>
      <div className="flex flex-col justify-center items-center">
        <Typography.Title>Danh sách nguồn cung</Typography.Title>
      </div>
      <div className="flex justify-center items-center sm:space-x-4 pb-4 w-full flex-col sm:flex-row space-y-4 sm:space-y-0">
        <div className="sm:w-1/5 w-[80vw]">
          <Input.Search
            placeholder="Tìm kiếm theo tên, số điện thoại"
            value={filter.search}
            onChange={(v) => {
              setFilter({ ...filter, search: v.target.value });
            }}
          />
        </div>
        <div className="sm:w-1/5 w-[80vw]">
          <Select
            className="w-full"
            placeholder="Lọc theo trạng thái"
            allowClear
            options={STATUS_OPTIONS}
            value={filter.status}
            onChange={(selected_status) => {
              setFilter({ ...filter, status: selected_status || null });
            }}
          />
        </div>
        <div className="sm:w-1/5 w-[80vw]">
          <Select
            mode="tags"
            className="w-full"
            placeholder="Lọc theo loại sắn"
            options={CASSAVA_OPTIONS()}
            value={filter.cassava}
            onChange={(selected_cassava_label) => {
              setFilter({
                ...filter,
                cassava:
                  selected_cassava_label && selected_cassava_label.length > 0
                    ? [...selected_cassava_label]
                    : [],
              });
            }}
          />
        </div>
        <Button icon={<ReloadOutlined />} onClick={reset} />
      </div>
      <div className="flex flex-col justify-center items-center">
        <Table
          className="sm:w-full w-[100vw] h-4/5 overflow-auto sm:px-16 supplier-table"
          dataSource={dataSrc()}
          columns={columns}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
        />
      </div>
    </AnimationRevealPage>
  );
};
