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
import { getCassavas } from "services/axios/cassava";
import {
  deleteDemand,
  getUserDemands,
  patchDemand,
} from "services/axios/market";
import { Link } from "react-router-dom";
import {
  DEFAULT_ERROR,
  DEFAULT_SELECTED_CASSAVAS,
  detailColumns,
  renderDetail,
} from "./Market";
import { ERR_CODE_API } from "services/axios";
import RequireLoginModal from "components/RequireLoginModal";

const default_data = { openModal: false, data: null, openDeleteModal: false };
const errMsg = (name) => `Vui lòng điền ${name}!`;

const CreateForm = (props) => {
  const context = useContext(Context);
  const [form] = Form.useForm();
  const [selectedCassavas, setSelectedCassavas] = useState([
    { ...DEFAULT_SELECTED_CASSAVAS, error: { ...DEFAULT_ERROR } },
  ]);

  useEffect(() => {
    if (props.open) {
      if (!context.cassava) getCassavas();
      if (props.data) {
        const convert = JSON.parse(props.data.details);
        setSelectedCassavas([
          ...Object.keys(convert).map((i) => ({
            cassava_label: i,
            weight: convert[i].weight,
            price: convert[i].price,
            error: { ...DEFAULT_ERROR },
          })),
          { ...DEFAULT_SELECTED_CASSAVAS, error: { ...DEFAULT_ERROR } },
        ]);
        form.setFieldsValue({
          ...props.data,
          time: [
            moment(props.data.start_time, "YYYY-MM-DD"),
            moment(props.data.end_time, "YYYY-MM-DD"),
          ],
        });
      }
    }
    // eslint-disable-next-line
  }, [props.open]);

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
          props.onCreate(
            { ...values, details: JSON.stringify(convert) },
            props.data.id
          );
        } else message.error("Vui lòng điền đủ thông tin!");
      })
      .catch(() => {});
  };

  return (
    <Modal
      open={props.open}
      title="Sửa đề xuất"
      footer={[
        <SecondarySmallButton
          onClick={() => {
            form.resetFields();
            props.onCancel();
          }}
          key={1}
        >
          Đóng
        </SecondarySmallButton>,
        <PrimarySmallButton onClick={onOk} className="mx-4" key={2}>
          Sửa đề xuất
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

const DeleteForm = (props) => {
  return (
    <Modal
      open={props.open}
      title="Xóa đề xuất"
      footer={[
        <SecondarySmallButton onClick={props.onCancel} key={1}>
          Đóng
        </SecondarySmallButton>,
        <PrimarySmallButton onClick={props.onOk} className="mx-4" key={2}>
          Xác nhận xóa
        </PrimarySmallButton>,
      ]}
      onCancel={props.onCancel}
    >
      <Typography.Text>
        Bạn có chắc muốn xóa đề xuất{" "}
        <Typography.Text type="danger">
          {props.data?.title || "này"}
        </Typography.Text>{" "}
        không?
      </Typography.Text>
    </Modal>
  );
};

export default () => {
  const context = useContext(Context);
  const [data, setData] = useState(default_data);
  const [buyData, setBuyData] = useState([]);
  const [sellData, setSellData] = useState([]);

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
    {
      title: "Chỉnh sửa",
      dataIndex: "action_edit",
      render: () => <Button>Chỉnh sửa</Button>,
      onCell: (record) => {
        return {
          onClick: (event) => {
            setData({ ...data, data: { ...record }, openModal: true });
          },
        };
      },
    },
    {
      title: "Xóa",
      dataIndex: "action_delete",
      render: () => <Button danger>Xóa</Button>,
      onCell: (record) => {
        return {
          onClick: (event) => {
            setData({ ...data, data: { ...record }, openDeleteModal: true });
          },
        };
      },
    },
  ];

  const getAllData = async () => {
    getUserDemands("buy", context.user.id).then((res) => {
      if (res?.status === 200) {
        setBuyData(
          res.data.data.map((i, index) => ({ ...i, key: index + 1 })) || []
        );
      }
    });
    getUserDemands("sell", context.user.id).then((res) => {
      if (res?.status === 200) {
        setSellData(
          res.data.data.map((i, index) => ({ ...i, key: index + 1 })) || []
        );
      }
    });
  };

  useEffect(() => {
    if (context?.cassava)
      if (context.user)
        if (context?.user?.id && context.user?.role) getAllData();
        else message.error(ERR_CODE_API[403].message);
    // eslint-disable-next-line
  }, [context?.cassava, context?.user]);

  const onFromCreate = (values, id) => {
    const v_data = {
      ...values,
      start_time: moment(values.time[0]).format("YYYY-MM-DD"),
      end_time: moment(values.time[1]).format("YYYY-MM-DD"),
      cassava_type:
        Array.isArray(values.cassava_type) && values.cassava_type.length > 0
          ? values.cassava_type.join(",")
          : values.cassava_type,
      price: parseFloat(values.price),
      weight: parseFloat(values.weight),
    };
    delete v_data.time;
    setData({
      ...data,
      openModal: false,
      data: null,
    });
    try {
      patchDemand(id, v_data).then((res) => {
        if (res.status === 200) {
          message.success("Sửa đề xuất thành công!");
          getAllData();
        } else message.error("Sửa đề xuất thất bại");
      });
    } catch (e) {
      message.error("Sửa đề xuất thất bại");
    }
  };

  const onDelete = (id) => {
    deleteDemand(id).then((res) => {
      if (res?.status === 204) {
        message.success("Xóa đề xuất thành công!");
        getAllData();
      }
      setData({
        ...data,
        openDeleteModal: false,
        data: null,
      });
    });
  };

  const BuyTab = () => {
    return (
      <div>
        <Table
          columns={mainColumns}
          dataSource={buyData}
          className="lg:w-full w-[100vw] h-4/5 overflow-auto sm:px-16"
        />
      </div>
    );
  };
  const SellTab = () => {
    return (
      <div>
        <Table
          columns={mainColumns}
          dataSource={sellData}
          className="lg:w-full w-[100vw] h-4/5 overflow-auto sm:px-16"
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
        <Typography.Title>Quản lý đề xuất</Typography.Title>
      </div>
      <div className="flex flex-col justify-center items-center">
        <RequireLoginModal pageName="Quản lý đề xuất" />
        {data.openModal && (
          <CreateForm
            open={data.openModal}
            onCreate={onFromCreate}
            onCancel={() => {
              setData({ ...data, openModal: false });
            }}
            data={data.data}
          />
        )}
        {data.openDeleteModal && (
          <DeleteForm
            open={data.openDeleteModal}
            onCancel={() => {
              setData({ ...data, openDeleteModal: false });
            }}
            onOk={() => {
              onDelete(data.data.id);
            }}
            data={data.data}
          />
        )}
        <Tabs
          className="market-user-table"
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
