import React, { useContext, useEffect, useState } from "react";
import { css } from "styled-components/macro"; //eslint-disable-line
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Select,
  Table,
  Tabs,
  Typography,
} from "antd";
import {
  PrimarySmallButton,
  SecondarySmallButton,
} from "components/misc/Buttons";
import moment from "moment";
import Context from "services/context";
import { getDemands, postDemand } from "services/axios/market";
import { Link } from "react-router-dom";
import { ReloadOutlined, PlusOutlined } from "@ant-design/icons";
import { compareStringPro } from "services/helper";
import { ERR_CODE_API } from "services/axios";
import RequireLoginModal from "components/RequireLoginModal";

const default_data = { openModal: false, data: null };
const errMsg = (name) => `Vui lòng điền ${name}!`;

export const detailColumns = [
  { name: "Tiêu đề", api_name: "title" },
  { name: "Họ và tên", api_name: "name" },
  { name: "Số điện thoại", api_name: "phone" },
  { name: "Miêu tả", api_name: "description" },
  {
    name: "Thông tin chi tiết (kg * VNĐ/kg = VNĐ)",
    api_name: "details",
  },
  {
    name: "Thời gian bắt đầu",
    api_name: "start_time",
    sorter: true,
  },
  {
    name: "Thời gian kết thúc",
    api_name: "end_time",
    sorter: true,
  },
  // { name: "Loại", api_name: "type" },
];

export const renderDetail = (data) => {
  return (
    <>
      {data?.weight && data?.price ? (
        <>
          <div style={{ flex: 3 }}>
            {data.weight.toLocaleString("it-IT") +
              " * " +
              data.price.toLocaleString("it-IT")}
          </div>
          <div style={{ flex: 3 }}>
            {" = " + (data.weight * data.price).toLocaleString("it-IT")}
          </div>
        </>
      ) : (
        <>
          <div style={{ flex: 6 }}>Chưa có thông tin cụ thể</div>
        </>
      )}
    </>
  );
};

export const DEFAULT_ERROR = {
  cassava_label: false,
  weight: false,
  price: false,
};

export const DEFAULT_SELECTED_CASSAVAS = {
  cassava_label: null,
  weight: null,
  price: null,
  error: { ...DEFAULT_ERROR },
};

const CreateForm = (props) => {
  const context = useContext(Context);
  const [form] = Form.useForm();
  const [selectedCassavas, setSelectedCassavas] = useState([
    { ...DEFAULT_SELECTED_CASSAVAS, error: { ...DEFAULT_ERROR } },
  ]);
  const [cass_error, setCassError] = useState(false);

  const onSelectCassava = (value, i, type) => {
    var _selectedCassavas = [...selectedCassavas];
    value = !value || value?.length < 1 ? null : value;
    if (
      !value &&
      ((type === "cassava_label" &&
        !selectedCassavas[i].weight &&
        !selectedCassavas[i].price) ||
        (type === "weight" &&
          !selectedCassavas[i].cassava_label &&
          !selectedCassavas[i].price) ||
        (type === "price" &&
          !selectedCassavas[i].cassava_label &&
          !selectedCassavas[i].weight))
    ) {
      _selectedCassavas.splice(i, 1);
    } else _selectedCassavas[i][type] = value;

    const len = _selectedCassavas.length - 1;
    if (
      value &&
      len === i &&
      _selectedCassavas[len].cassava_label &&
      _selectedCassavas[len].weight &&
      _selectedCassavas[len].price
    )
      _selectedCassavas.push({
        ...DEFAULT_SELECTED_CASSAVAS,
        error: { ...DEFAULT_ERROR },
      });

    setSelectedCassavas(_selectedCassavas);
  };

  const validateSelectedCassavas = () => {
    if (selectedCassavas.length <= 1) {
      setCassError(true);
      return false;
    } else setCassError(false);
    var check = true;
    const _selectedCassavas = [...selectedCassavas];
    _selectedCassavas.forEach((i, index) => {
      if (index === _selectedCassavas.length - 1) return;
      if (!i.cassava_label) {
        i.error.cassava_label = true;
        check = false;
      } else i.error.cassava_label = false;
      if (!i.weight) {
        i.error.weight = true;
        check = false;
      } else i.error.weight = false;
      if (!i.price) {
        i.error.price = true;
        check = false;
      } else i.error.price = false;
    });
    setSelectedCassavas(_selectedCassavas);
    return check;
  };

  const onOk = () => {
    const check = validateSelectedCassavas();
    form
      .validateFields()
      .then((values) => {
        if (check) {
          const convert = {};
          selectedCassavas.forEach((i) => {
            if (i.cassava_label)
              convert[i.cassava_label] = {
                weight: i.weight,
                price: i.price,
              };
          });
          form.resetFields();
          props.onCreate({ ...values, details: JSON.stringify(convert) });
        } else message.error("Vui lòng điền đủ thông tin!");
      })
      .catch(() => {});
  };

  return (
    <Modal
      open={props.open}
      title="Tạo mới đề xuất"
      footer={[
        <SecondarySmallButton
          onClick={() => {
            form.resetFields();
            props.onCancel();
          }}
          key={1}
        >
          Hủy tạo
        </SecondarySmallButton>,
        <PrimarySmallButton onClick={onOk} className="mx-4" key={2}>
          Tạo mới
        </PrimarySmallButton>,
      ]}
      onCancel={props.onCancel}
    >
      <Form
        className="sm:h-[60vh] h-[50vh] overflow-overlay"
        style={{ paddingRight: "1rem" }}
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{
          modifier: "public",
        }}
      >
        <Form.Item
          name="type"
          label="Loại đề xuất"
          rules={[
            {
              required: true,
              message: errMsg("Loại đề xuất"),
            },
          ]}
        >
          <Radio.Group>
            <Radio value="buy">Mua</Radio>
            <Radio value="sell">Bán</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[
            {
              required: true,
              message: errMsg("Tiêu đề"),
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="description" label="Miêu tả">
          <Input.TextArea rows={4} />
        </Form.Item>

        <div className="flex justify-between">
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[
              {
                required: true,
                message: errMsg("Họ và tên"),
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              {
                required: true,
                message: errMsg("Số điện thoại"),
              },
            ]}
          >
            <Input type="number" />
          </Form.Item>
        </div>

        <div className="w-full space-y-2 mb-8">
          <label>
            <span className="text-red-500">*</span> Loại sắn
          </label>
          {selectedCassavas.map((c, i) => (
            <div key={i} className="flex justify-between space-x-1">
              <div style={{ flex: 1 }}>
                <Select
                  status={c.error.cassava_label ? "error" : ""}
                  allowClear
                  placeholder="Loại sắn"
                  className="w-full"
                  value={c.cassava_label}
                  onChange={(value) =>
                    onSelectCassava(value, i, "cassava_label")
                  }
                  options={
                    context?.cassava?.map((c) => ({
                      label: c.label,
                      value: c.label,
                    })) || []
                  }
                />
              </div>
              <div style={{ flex: 2 }}>
                <Input
                  status={c.error.weight ? "error" : ""}
                  allowClear
                  value={c.weight}
                  onChange={(e) => onSelectCassava(e.target.value, i, "weight")}
                  type="number"
                  min={1}
                  suffix="kg"
                  placeholder="Khối lượng"
                />
              </div>
              <div style={{ flex: 3 }}>
                <Input
                  status={c.error.price ? "error" : ""}
                  allowClear
                  value={c.price}
                  onChange={(e) => onSelectCassava(e.target.value, i, "price")}
                  type="number"
                  step={500}
                  min={1000}
                  suffix="VND/kg"
                  placeholder="Giá/kg"
                />
              </div>
            </div>
          ))}
          <div className={cass_error ? "text-red-500" : "hidden"}>
            Vui lòng điền đủ thông tin!
          </div>
        </div>

        <Form.Item
          name="time"
          label="Thời gian diễn ra"
          rules={[
            {
              required: true,
              message: errMsg("Thời gian"),
            },
          ]}
        >
          <DatePicker.RangePicker className="w-full" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default () => {
  const context = useContext(Context);
  const [data, setData] = useState(default_data);
  const [buyData, setBuyData] = useState([]);
  const [sellData, setSellData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);

  const mainColumns = [
    {
      title: "STT",
      dataIndex: "key",
      render: (_t, _r, index) => index + 1,
    },
    ...detailColumns.map((i) =>
      i.sorter
        ? {
            title: i.name,
            dataIndex: i.api_name,
            sorter: (a, b) => a[i.api_name].localeCompare(b[i.api_name]),
          }
        : {
            title: i.name,
            dataIndex: i.api_name,
            render: (text) => {
              if (i.api_name !== detailColumns[4].api_name)
                return text || "Chưa có thông tin";
              const val = JSON.parse(text);
              if (!val) return "Chưa có thông tin";
              const cassava_labels = Object.keys(val);
              return (
                <div className="w-[400px]">
                  {cassava_labels.map((i) => {
                    return (
                      <div key={i} className="flex">
                        <div style={{ flex: 2 }}>
                          {"- "}
                          <Link
                            to={
                              "/cassavas/" +
                              context?.cassava?.find((c) => c.label === i)?.id
                            }
                            className="text-blue-600"
                          >
                            {i}
                          </Link>
                        </div>
                        {renderDetail(val[i]) || "Chưa có thông tin"}
                      </div>
                    );
                  })}
                </div>
              );
            },
          }
    ),
  ];

  const getAllData = async () => {
    getDemands("buy").then((res) => {
      if (res.status === 200) {
        setBuyData(
          res.data.data.map((i, index) => ({ ...i, key: index + 1 })) || []
        );
      }
    });
    getDemands("sell").then((res) => {
      if (res.status === 200) {
        setSellData(
          res.data.data.map((i, index) => ({ ...i, key: index + 1 })) || []
        );
      }
    });
  };

  useEffect(() => {
    if (context && context.disease?.length > 0)
      if (context.user)
        if (context?.user?.id && context.user?.role) {
          setUserId(context?.user?.id);
          getAllData();
        } else message.error(ERR_CODE_API[403].message);
    // eslint-disable-next-line
  }, [context]);

  const onSearch = (v) => {
    setSearching(true);
  };
  const reset = () => {
    setSearch("");
    setSearching(false);
  };

  const onFromCreate = (values) => {
    const v_data = {
      ...values,
      start_time: moment(values.time[0]).format("YYYY-MM-DD"),
      end_time: moment(values.time[1]).format("YYYY-MM-DD"),
      user_id: userId,
    };
    delete v_data.time;
    setData({
      openModal: false,
      data: null,
    });
    try {
      postDemand(v_data).then((res) => {
        if (res.status === 200) {
          message.success("Thêm đề xuất thành công!");
          getAllData();
        } else message.error("Thêm đề xuất thất bại");
      });
    } catch (e) {
      message.error("Thêm đề xuất thất bại");
    }
  };

  const filteredData = (type = "buy") => {
    const lowerSearch = search.toLowerCase();
    const ret = type === "buy" ? [...buyData] : [...sellData];
    if (searching) return ret;
    else
      return ret.filter(
        (i) =>
          compareStringPro(i.title, lowerSearch) ||
          compareStringPro(i.name, lowerSearch) ||
          compareStringPro(i.phone, lowerSearch) ||
          compareStringPro(i.details, lowerSearch)
      );
  };

  const BuyTab = () => {
    return (
      <div>
        <Table
          rowClassName={(record) => {
            const today = moment(new Date()).format("YYYY-MM-DD");
            return record.start_time <= today && today <= record.end_time
              ? "table-row-availabel"
              : "table-row-unavailabel";
          }}
          columns={mainColumns}
          dataSource={filteredData("buy")}
          className="sm:w-full w-[100vw] h-4/5 overflow-auto sm:px-16"
        />
      </div>
    );
  };
  const SellTab = () => {
    return (
      <div>
        <Table
          rowClassName={(record) => {
            const today = moment(new Date()).format("YYYY-MM-DD");
            return record.start_time <= today && today <= record.end_time
              ? "table-row-availabel"
              : "table-row-unavailabel";
          }}
          columns={mainColumns}
          dataSource={filteredData("sell")}
          className="sm:w-full w-[100vw] h-4/5 overflow-auto sm:px-16"
        />
      </div>
    );
  };

  const TabItems = [
    { label: "Mua sắn", key: "buy", children: BuyTab },
    { label: "Bán sắn", key: "sell", children: SellTab },
  ];

  return (
    <AnimationRevealPage>
      <div className="flex flex-col justify-center items-center">
        <Typography.Title>Thương mại sắn</Typography.Title>
      </div>
      <div className="flex flex-col justify-center items-center">
        <RequireLoginModal pageName="Thương mại sắn" />
        <div className="flex items-center w-full">
          <div className="flex-1 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center items-center">
            <PrimarySmallButton
              onClick={() => {
                setData({ ...data, openModal: true });
              }}
              className="flex items-center"
              disabled={!userId}
            >
              <PlusOutlined /> Thêm đề xuất
            </PrimarySmallButton>
            <div className="space-x-4">
              <Input.Search
                className="sm:!w-[400px] !w-[70vw]"
                placeholder="Tìm kiếm theo tiêu đề, tên, số điện thoại, nhãn sắn"
                value={search}
                onChange={(v) => {
                  setSearch(v.target.value);
                }}
                onSearch={onSearch}
              />
              <Button icon={<ReloadOutlined />} onClick={reset} />
            </div>
          </div>
        </div>
        {data.openModal && (
          <CreateForm
            open={data.openModal}
            onCreate={onFromCreate}
            onCancel={() => {
              setData({ ...data, openModal: false });
            }}
          />
        )}
        <Tabs
          centered
          defaultActiveKey={TabItems[0].key}
          items={TabItems.map((e) => ({
            label: e.label,
            key: e.key,
            children: e.children(),
          }))}
        />
      </div>
    </AnimationRevealPage>
  );
};
