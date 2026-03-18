import React, { useContext, useEffect, useState } from "react";
import { InboxOutlined } from "@ant-design/icons";
import { Button, Form, Image, message, Table, Typography, Upload } from "antd";
import AnimationRevealPage from "helpers/AnimationRevealPage";
import { BASE_URL } from "services/url";
import {
  getDiagnosticDetail,
  getDiagnosticImage,
  postDiagnostic,
  postDiagnosticClassify,
} from "services/axios/diagnostics";
import { postFile } from "services/axios/file";
import Context from "services/context";
import { Link } from "react-router-dom";
const { Dragger } = Upload;

const columns = [
  {
    title: "STT",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Tên bệnh",
    dataIndex: "name",
    key: "name",
    render: (text, record) =>
      record.url ? (
        <Link
          className="text-indigo-500 underline hover:text-indigo-700 hover:underline"
          to={record.url ? "/diseases/" + record.url : "#"}
        >
          {text}
        </Link>
      ) : (
        <Typography.Text>
          {text}
        </Typography.Text>
      ),
  },
  {
    title: "Xác suất",
    dataIndex: "probability",
    key: "probability",
  },
];

export const DiagnosticsDetail = (props) => {
  const context = useContext(Context);
  const [data, setData] = useState(props.data);
  const [disease, setDisease] = useState([]);
  useEffect(() => {
    setDisease(context.disease);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setData(props.data || null);
  }, [props.data]);

  const dataSrc = () =>
    data && data.diag
      ? data.diag
          .sort((a, b) => b.probability - a.probability)
          .map((i, index) => ({
            name:
              disease.find((e) => e.label === i.label)?.vn_name ||
              (i.label === "healthy" ? "Khỏe mạnh" : i.label),
            id: index + 1,
            probability: Math.round(i.probability * 10000) / 100 + "%",
            key: index.toString(),
            url: disease.find((e) => e.label === i.label)?.id || null,
          }))
      : [];

  useEffect(() => {
    if (data && data.id) {
      getDiagnosticDetail(data.id).then((res) => {
        const res_data = res?.data?.data;
        getDiagnosticImage(data.id).then((imagesRes) => {
          if (imagesRes.status === 200)
            setData({ ...data, ...res_data, images: [...imagesRes.data.data] });
        });
      });
    }
    // eslint-disable-next-line
  }, [data.id]);

  return (
    <div>
      <div className="flex justify-center w-full px-16 space-x-4">
        {data &&
          data.images &&
          data.images.length > 0 &&
          data.images
            .filter((e) => e.directus_files_id)
            .map((i, index) => (
              <Image
                key={index}
                width={180}
                height={180}
                alt={i.directus_files_id.title || "sos"}
                src={BASE_URL + "/assets/" + i.directus_files_id.id || null}
                preview={false}
              />
            ))}
      </div>
      <div className="flex justify-center w-full sm:px-16 px-4 pt-4">
        <Table
          dataSource={dataSrc()}
          columns={columns}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
        />
      </div>
    </div>
  );
};

const Diagnostics = () => {
  const [fileList, setFileList] = useState([]);
  const [addingList, setAddingList] = useState(false);
  const [submitList, setSubmitList] = useState([]);
  // eslint-disable-next-line
  const [submittingList, setSubmittingList] = useState(false);
  const [diagnostics, setDiagnostics] = useState(null);

  const resetData = () => {
    setDiagnostics(null);
  };

  const beforeUpload = (file) => {
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      message.error(`${file.name} không phải ảnh.`, 2);
      return null;
    }
    return false;
  };
  function onChange({ fileList }) {
    setFileList(fileList.filter((file) => file.status !== "error"));
  }
  const onRemove = async (file) => {
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);

    setFileList(newFileList);
  };

  const handleFinish = async () => {
    if (fileList.length < 1) {
      message.error("Không có ảnh!");
      return;
    } else {
      var submittingList = [];
      var diag = [];

      try {
        setAddingList(true);

        await Promise.all(
          fileList.map(async (file) => {
            const formData = new FormData();
            try {
              formData.append("title", file.name);
              formData.append("file", file.originFileObj);
              await postFile(formData).then((res) => {
                if (res && res.status === 200) {
                  const resData = res.data.data;
                  const submitItem = {
                    diagnostics_id: "+",
                    directus_files_id: {
                      id: resData.id,
                    },
                  };
                  submittingList = [...submittingList, { ...submitItem }];
                }
              });
            } catch (e) {}

            try {
              formData.append("image", file.originFileObj);
              await postDiagnosticClassify(formData).then((response) => {
                if (response.status === 200) {
                  diag = [...response.data] || null;
                }
              });
            } catch (err) {}
          })
        );

        setFileList([]);
        setSubmitList([...submittingList]);
        setDiagnostics({
          ...diagnostics,
          diag: diag,
        });
        message.success(`Thêm ảnh thành công.`, 2);
      } catch (err) {
        message.error(`Thêm ảnh không thành công.`, 2);
      } finally {
        setAddingList(false);
      }
    }
  };

  async function postDiagnostics() {
    try {
      setSubmittingList(true);
      await postDiagnostic({
        images: {
          create: [...submitList],
          delete: [],
          update: [],
        },
      }).then((res) => {
        if (res && res.status === 200) {
          message.success(`Tạo chẩn đoán mới thành công.`, 2);
          setSubmitList([]);
          const resData = res.data.data;
          setDiagnostics({ ...resData, ...diagnostics });
        }
      });
    } catch (err) {
      message.error(`Tạo chẩn đoán mới không thành công.`, 2);
    } finally {
      setSubmittingList(false);
    }
  }

  useEffect(() => {
    if (!addingList && submitList.length > 0) {
      postDiagnostics();
    }
    // eslint-disable-next-line
  }, [submitList, addingList]);

  // token : 1972g9KX-DYPlUROjFD8yZuY9FdWFy83
  return (
    <AnimationRevealPage>
      <div className="content-inside overflow-overlay">
        <div className="flex flex-col justify-center items-center">
          <Typography.Title>Chẩn đoán bệnh</Typography.Title>
        </div>
        {!diagnostics && (
          <div className="flex justify-center p-8">
            <Form onFinish={handleFinish}>
              <div className="uploadContainer">
                <Dragger
                  name="Upload"
                  fileList={[...fileList]}
                  accept="image/*"
                  listType="picture"
                  multiple
                  beforeUpload={beforeUpload}
                  onChange={onChange}
                  onRemove={onRemove}
                  maxCount={1}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text sm:px-36">
                    Bấm hoặc kéo thả để tải ảnh
                  </p>
                  <p className="ant-upload-hint sm:px-36">
                    Chỉ chấp nhận các file .png, .jpg.
                  </p>
                </Dragger>
              </div>
              <Form.Item className="flex justify-center mt-4">
                <Button shape="round" htmlType="submit" className="mt-4">
                  {addingList ? "Đang đăng ảnh" : "Đăng ảnh"}
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
        {diagnostics && (
          <div className="flex flex-col w-full justify-center items-center">
            <Button
              shape="round"
              className="mb-4 bg-indigo-500 hover:bg-indigo-700"
              onClick={resetData}
            >
              Tạo chẩn đoán mới
            </Button>
            <DiagnosticsDetail data={{ ...diagnostics }} />
          </div>
        )}
      </div>
    </AnimationRevealPage>
  );
};
export default Diagnostics;
