import React, { useEffect, useState } from "react";
import { css } from "styled-components/macro"; //eslint-disable-line
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import Eyes from "components/eyes";
import { Form, Input, Modal, Typography } from "antd";
import { validatePassword } from "services/helper";
import { PrimaryButton, SecondaryButton } from "components/misc/Buttons";
import {
  CheckCircleTwoTone,
  ExclamationCircleTwoTone,
  HomeOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { postResetPassword } from "services/axios/user";

// http://localhost:3000/forgot_password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxtaHVvbmc3MTFAZ21haWwuY29tIiwic2NvcGUiOiJpbnZpdGUiLCJpYXQiOjE2NzE3OTY4MzMsImV4cCI6MTY3MjQwMTYzMywiaXNzIjoiZGlyZWN0dXMifQ.Tpi7TH2ftkANfykaXnvRxrjuxJ4QC4V7fQuU4bWCwjo=

export default () => {
  const [secondsToGo, setSecondsToGo] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [token, setToken] = useState(null);
  const [form] = Form.useForm();
  const [success, setSuccess] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (secondsToGo > 0) {
      const timer = setInterval(() => {
        if (secondsToGo <= 0) {
          clearInterval(timer);
        } else {
          setSecondsToGo(secondsToGo - 1);
        }
      }, 1000);
    }
  }, [secondsToGo]);

  useEffect(() => {
    const tk = searchParams.get("token");
    if (tk) {
      setToken(tk);
      setSearchParams();
    }
    // eslint-disable-next-line
  }, []);

  const onFinish = async (values) => {
    postResetPassword({ token: token, password: values.password }).then(
      (res) => {
        const timer = 5;
        if (res.status === 204) setSuccess(1);
        else setSuccess(-1);
        setSecondsToGo(timer);
        setTimeout(() => {
          navigate("/");
        }, timer * 1000 + 500);
      }
    );
  };

  return (
    <AnimationRevealPage>
      {token ? (
        <>
          <div className="flex flex-col justify-center items-center">
            <Typography.Title>Thay đổi mật khẩu</Typography.Title>
          </div>
          <Eyes />
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:px-24">
            <div className="md:w-[760px] w-4/5">
              <Form
                form={form}
                layout="vertical"
                onFinish={(v) => onFinish(v)}
                onReset={() => {
                  navigate("/");
                }}
              >
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập mật khẩu!",
                    },
                    {
                      validator: () => {
                        return !form.getFieldValue("password") ||
                          validatePassword(form.getFieldValue("password"))
                          ? Promise.resolve()
                          : Promise.reject(
                              "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số!"
                            );
                      },
                    },
                  ]}
                >
                  <Input type="password" placeholder="********" />
                </Form.Item>
                <Form.Item
                  name="repassword"
                  label="Nhập lại mật khẩu"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập lại mật khẩu!",
                    },
                    {
                      validator: () => {
                        return form.getFieldValue("password") !==
                          form.getFieldValue("repassword")
                          ? Promise.reject("Mật khẩu không khớp!")
                          : Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input type="password" placeholder="********" />
                </Form.Item>

                <Form.Item>
                  <div className="flex justify-center items-center space-x-4 max-lg:flex-col max-lg:space-y-4">
                    <PrimaryButton
                      className="flex items-center space-x-2"
                      htmlType="submit"
                    >
                      <SaveOutlined className="icon" />
                      <span className="text">Cập nhật mật khẩu</span>
                    </PrimaryButton>
                    <SecondaryButton
                      type="reset"
                      className="flex items-center space-x-2"
                    >
                      <HomeOutlined className="icon" />
                      <span className="text">Về trang chủ</span>
                    </SecondaryButton>
                  </div>
                </Form.Item>
              </Form>
            </div>
          </div>
        </>
      ) : (
        <Navigate to="/not_found" />
      )}
      <Modal
        open={success !== 0}
        afterClose={() => navigate("/")}
        closable={false}
        footer={[
          <PrimaryButton key={"submit"} onClick={() => navigate("/")}>
            Về trang chủ
          </PrimaryButton>,
        ]}
        title={
          success === 1 ? (
            <span>
              <CheckCircleTwoTone
                style={{ fontSize: "2rem" }}
                twoToneColor="#52c41a"
              />
              Đổi mật khẩu thành công!
            </span>
          ) : (
            <span>
              <ExclamationCircleTwoTone
                style={{ fontSize: "2rem" }}
                twoToneColor="#eb2f96"
              />
              Có lỗi xảy ra!
            </span>
          )
        }
      >
        {`Bạn sẽ được đưa về trang chủ sau ${secondsToGo} giây!`}
      </Modal>
    </AnimationRevealPage>
  );
};
