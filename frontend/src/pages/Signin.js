import React, { useContext, useEffect, useState } from "react";
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import { css } from "styled-components/macro"; //eslint-disable-line
import logo from "images/logo.svg";
import { ReactComponent as LoginIcon } from "feather-icons/dist/icons/log-in.svg";
import { login } from "services/axios";
import { useNavigate } from "react-router-dom";
import { message, Typography, Form, Input, Button, Modal } from "antd";
import Context from "services/context";
import { LogoLink } from "components/Header";
import { PrimaryButton, SecondaryButton } from "components/misc/Buttons";
import { postForgotPassword, postResquest } from "services/axios/user";
import {
  validateEmail,
  validatePassword,
  validatePhone,
} from "services/helper";

const layout = {
  labelCol: {
    span: 6,
  },
  // wrapperCol: {
  //   offset: 2,
  //   span: 18,
  // },
};

export default () => {
  const navigate = useNavigate();
  const context = useContext(Context);
  const [form] = Form.useForm();
  const [signup] = Form.useForm();
  const [forgotEmail, setForgotEmail] = useState("");
  const [requestModal, setRequestModal] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const [disableForgot, setDisableForgot] = useState(false);

  useEffect(() => {
    if (context?.cassava && context?.user?.id) navigate("/");
    // eslint-disable-next-line
  }, [context?.cassava, context?.user]);

  const handleLogin = async () => {
    try {
      let loginResponse = await login({
        ...form.getFieldsValue(),
      });
      if (loginResponse.status) {
        navigate("/");
        context.setUser(loginResponse);
      } else {
        message.error(loginResponse.message);
      }
    } catch (err) { }
  };

  const handleRequestModal = () => {
    if (forgotModal) handleForgetModal();
    setRequestModal(!requestModal);
  };

  const handleForgetModal = () => {
    if (requestModal) handleRequestModal();
    setForgotModal(!forgotModal);
  };

  const postResquestToServer = async () => {
    const params = { ...signup.getFieldsValue() };
    delete params.repassword;
    try {
      const response = await postResquest(params);
      if (200 <= response.status && response.status <= 300) {
        message.success("Đăng ký thành công");
        handleRequestModal();
      } else {
        message.error(
          <div className="flex justify-center items-center">
            {response?.response?.data?.errors?.length > 0 ? (
              <>
                Email đã được đăng ký, vui lòng nhập lại email khác hoặc
                <Button
                  type="link"
                  onClick={() => {
                    handleRequestModal();
                    handleForgetModal();
                  }}
                  className="!p-0 !pl-1"
                >
                  quên mật khẩu
                </Button>
              </>
            ) : (
              "Đăng ký thất bại!"
            )}
          </div>,
          1000
        );
      }
    } catch (err) { }
  };

  const postForgotPasswordToServer = async () => {
    if (!disableForgot)
      try {
        if (!validateEmail(forgotEmail)) {
          message.error("Email không hợp lệ!");
          return;
        } else {
          setDisableForgot(true);
          const response = await postForgotPassword({ email: forgotEmail });
          if (response.status === 204) {
            message.success(
              `Gửi yêu cầu thành công! Vui lòng kiểm tra hòm thư ${forgotEmail}!`
            );
            setDisableForgot(false);
            handleForgetModal();
            setForgotEmail("");
          } else {
            setDisableForgot(false);
            message.error("Gửi yêu cầu thất bại!");
          }
        }
      } catch (err) {
        message.error(err.message);
      }
  };

  useEffect(() => {
    if (localStorage.getItem("access_token") != null) navigate("/");
    // eslint-disable-next-line
  }, []);

  return (
    <AnimationRevealPage>
      <div
        className="hidden sm:flex max-lg:flex-col px-12 xl:px-[280px] justify-center items-center w-full"
        style={{ height: "calc(100vh - 128px - 88px - 44px)" }}
      >
        <div className=" overflow-auto w-2/5 max-lg:w-4/5 lg:rounded-r-none rounded-b-none h-full flex flex-col justify-center items-center border-4 border-purple-100 rounded-2xl">
          <LogoLink href={""}>
            <img src={logo} alt="logo" />
          </LogoLink>
          <Typography.Title level={2} className="pb-14">
            Đăng nhập vào Koica
          </Typography.Title>

          <Form
            id="login-form"
            className="space-y-8 text-base"
            {...layout}
            form={form}
            onFinish={handleLogin}
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập Email!",
                },
              ]}
            >
              <Input type="email" placeholder="minhhuong@gmail.com" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập Mật khẩu!",
                },
              ]}
            >
              <Input type="password" placeholder="********" />
            </Form.Item>

            <Form.Item className="flex justify-center">
              <PrimaryButton
                className="space-x-4 flex m-auto mb-4"
                htmlType="submit"
              >
                <LoginIcon className="icon" />
                <span className="text">Đăng nhập</span>
              </PrimaryButton>
              <div className="flex justify-center">
                <Button type="link" onClick={handleRequestModal}>
                  <span className="underline">Yêu cầu tạo tài khoản</span>
                </Button>
                •
                <Button
                  type="link"
                  onClick={() => {
                    handleForgetModal();
                  }}
                >
                  <span className="underline">Quên mật khẩu</span>
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>
        <div className="w-3/5 max-lg:w-4/5 lg:rounded-l-none rounded-t-none bg-purple-100 h-full p-14 border-4 border-purple-100 rounded-2xl">
          <div
            className="h-full"
            style={{
              backgroundImage: `url("assets/login.jpg")`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
            alt="login_img"
          />
        </div>
      </div>

      <div className="sm:hidden mx-4 h-full flex flex-col justify-center items-center px-14 py-8 border-4 border-purple-100 rounded-2xl overflow-auto">
        <LogoLink href={""}>
          <img src={logo} alt="logo" />
        </LogoLink>
        <Typography.Title level={2} className="pb-4">
          Đăng nhập
        </Typography.Title>

        <Form
          id="login-form"
          className="w-full space-y-4"
          {...layout}
          form={form}
          onFinish={handleLogin}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập email!",
              },
            ]}
          >
            <Input type="email" placeholder="minhhuong@gmail.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu!",
              },
            ]}
          >
            <Input type="password" placeholder="Password" />
          </Form.Item>

          <Form.Item className="flex justify-center">
            <PrimaryButton className="flex space-x-4 w-full" htmlType="submit">
              <LoginIcon className="icon" />
              <span className="text">Đăng nhập</span>
            </PrimaryButton>
            <div className="flex justify-center">
              <Button type="link" onClick={handleRequestModal}>
                Yêu cầu tạo tài khoản
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>

      {requestModal && (
        <Modal
          open={requestModal}
          title="Yêu cầu tạo tài khoản"
          onCancel={handleRequestModal}
          footer={false}
        >
          <div className="max-h-[60vh] overflow-auto">
            <Form
              id="signup-form"
              className="space-y-8 text-base"
              layout="vertical"
              form={signup}
              onFinish={postResquestToServer}
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập email!",
                  },
                  {
                    validator: () => {
                      return validateEmail(signup.getFieldValue("email"))
                        ? Promise.resolve()
                        : Promise.reject("Email không hợp lệ!");
                    },
                  },
                ]}
              >
                <Input type="email" placeholder="minhhuong@gmail.com" />
              </Form.Item>
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
                      return validatePassword(signup.getFieldValue("password"))
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
                      return signup.getFieldValue("password") !==
                        signup.getFieldValue("repassword")
                        ? Promise.reject("Mật khẩu không khớp!")
                        : Promise.resolve();
                    },
                  },
                ]}
              >
                <Input type="password" placeholder="********" />
              </Form.Item>
              <Form.Item
                name="first_name"
                label="Tài khoản"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tài khoản!",
                  },
                ]}
              >
                <Input placeholder="huonglm" />
              </Form.Item>
              <Form.Item
                name="title"
                label="Họ và tên"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập họ và tên!",
                  },
                ]}
              >
                <Input placeholder="Lê Minh Hương" />
              </Form.Item>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số điện thoại!",
                  },
                  {
                    validator: () => {
                      if (
                        !signup.getFieldValue("phone") ||
                        signup.getFieldValue("phone").trim() === ""
                      )
                        return Promise.resolve();
                      return validatePhone(signup.getFieldValue("phone"))
                        ? Promise.resolve()
                        : Promise.reject("Số điện thoại không hợp lệ");
                    },
                  },
                ]}
              >
                <Input placeholder="0987654321" />
              </Form.Item>
              <Form.Item>
                <div className="flex justify-center items-center space-x-4 max-lg:flex-col max-lg:space-y-4">
                  <SecondaryButton type="reset">Làm mới</SecondaryButton>
                  <PrimaryButton className="flex space-x-4" htmlType="submit">
                    <LoginIcon className="icon" />
                    <span className="text">Gửi yêu cầu</span>
                  </PrimaryButton>
                </div>
              </Form.Item>
            </Form>
          </div>
        </Modal>
      )}

      {forgotModal && (
        <Modal
          open={forgotModal}
          title="Quên mật khẩu"
          onCancel={handleForgetModal}
          footer={false}
        >
          <div className="flex space-x-4">
            <Input
              placeholder="Nhập email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              onPressEnter={postForgotPasswordToServer}
            />
            <PrimaryButton
              disabled={disableForgot}
              onClick={postForgotPasswordToServer}
            >
              Gửi
            </PrimaryButton>
          </div>
        </Modal>
      )}
    </AnimationRevealPage>
  );
};
