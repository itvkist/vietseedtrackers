import React, { useContext, useEffect, useState } from "react";
import tw from "twin.macro"; //eslint-disable-line
import { css } from "styled-components/macro"; //eslint-disable-line
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import Context from "services/context";
import { Form, Input, message, Select, Typography } from "antd";
import {
  PrimarySmallButton,
  SecondarySmallButton,
} from "components/misc/Buttons";
import { getUser, updateUser } from "services/axios/user";
import { validatePassword } from "services/helper";
import { ERR_CODE_API } from "services/axios";
const { Option } = Select;

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

const PROFILE_FORM = {
  0: { label: "Họ và tên", name: "title", required: true },
  1: { label: "Số điện thoại", name: "phone", required: true },
  2: { label: "Email", name: "email", required: true },
  3: { label: "Tài khoản", name: "first_name", required: true },
  4: { label: "Địa chỉ", name: "location", required: false },
};

export default () => {
  const context = useContext(Context);
  const [profileFormDisabled, setProfileFormDisabled] = useState(true);
  const [profileForm] = Form.useForm();
  const [renewPassDisplay, setRenewPassDisplay] = useState(false);
  const [user, setUser] = useState(null);
  const [cassavaData, setCassavaData] = useState([]);

  useEffect(() => {
    if (context?.cassava) {
      setCassavaData(context.cassava);
      if (context.user)
        if (context?.user?.id && context.user?.role) setUser(context?.user);
        else message.error(ERR_CODE_API[403].message);
    }
    // eslint-disable-next-line
  }, [context?.cassava, context?.user]);

  useEffect(() => {
    if (user) {
      const formDataConverted = {};
      Object.keys(user).forEach((key) => {
        if (user[key] !== null && user[key] !== undefined) {
          formDataConverted[key] = user[key];
        }
      });
      if (user.description) {
        const desc = JSON.parse(user.description);
        formDataConverted.desc_detail =
          desc.detail.length > 0 ? desc.detail.join("\n") : "";
        if (desc.cassava) {
          const active = [];
          const inactive = [];
          Object.keys(desc.cassava).forEach((key) => {
            if (desc.cassava[key] === "active") active.push(key);
            if (desc.cassava[key] === "inactive") inactive.push(key);
          });
          formDataConverted.desc_cassava_active = active;
          formDataConverted.desc_cassava_inactive = inactive;
        }
      }
      profileForm.setFieldsValue({ ...formDataConverted });
    }
    // eslint-disable-next-line
  }, [user]);

  const CassavaOptions = () => {
    return (
      <>
        {cassavaData.map((cassava) => (
          <Option
            value={cassava.label}
            label={cassava.label}
            key={cassava.label}
          >
            {cassava.label}
          </Option>
        ))}
      </>
    );
  };

  const handleSelect = (value, type) => {
    const active = profileForm.getFieldValue("desc_cassava_active") || [];
    const inactive = profileForm.getFieldValue("desc_cassava_inactive") || [];
    if (type === "active" && inactive.includes(value))
      profileForm.setFieldValue(
        "desc_cassava_inactive",
        inactive.filter((item) => item !== value)
      );

    if (type === "inactive" && active.includes(value))
      profileForm.setFieldValue(
        "desc_cassava_active",
        active.filter((item) => item !== value)
      );
  };

  const submitUpdateProfile = async (formValues) => {
    const formatData = {};
    const desc = {};
    const desc_detail =
      (formValues.desc_detail || "").trim() !== ""
        ? formValues.desc_detail.trim().split("\n")
        : [];
    const desc_cassava = {
      ...(formValues.desc_cassava_active || []).reduce((acc, cur) => {
        acc[cur] = "active";
        return acc;
      }, {}),
      ...(formValues.desc_cassava_inactive || []).reduce((acc, cur) => {
        acc[cur] = "inactive";
        return acc;
      }, {}),
    };
    if (desc_detail.length > 0) desc.detail = desc_detail;
    if (Object.keys(desc_cassava).length > 0) desc.cassava = desc_cassava;
    if (Object.keys(desc).length > 0)
      formatData.description = JSON.stringify(desc);

    Object.keys(PROFILE_FORM).forEach((key) => {
      if (formValues[PROFILE_FORM[key].name])
        formatData[PROFILE_FORM[key].name] = formValues[PROFILE_FORM[key].name];
    });

    if (
      formValues.new_password &&
      formValues.new_password === formValues.renew_password
    ) {
      formatData.password = formValues.new_password;
    }

    try {
      const resUpdateUser = await updateUser(formatData);
      if (resUpdateUser) {
        if (resUpdateUser.status === 200) {
          getUser().then((getUser) => {
            context.setUser({
              ...user,
              ...getUser.data.data,
            });
          });
          message.success("Cập nhật thành công");
          setProfileFormDisabled(true);
        } else message.error("Cập nhật thất bại");
      }
    } catch (e) {}
  };

  return (
    <AnimationRevealPage>
      <div className="flex flex-col justify-center items-center">
        <Typography.Title>Trang cá nhân</Typography.Title>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:px-24">
        <div className="md:w-[760px] w-4/5">
          <Form
            name="profile"
            form={profileForm}
            disabled={profileFormDisabled}
            className="w-full"
            {...formItemLayout}
            onFinish={submitUpdateProfile}
          >
            {Object.keys(PROFILE_FORM).map((key) => (
              <Form.Item
                label={PROFILE_FORM[key].label}
                name={PROFILE_FORM[key].name}
                key={PROFILE_FORM[key].name}
                rules={[
                  {
                    required: PROFILE_FORM[key].required,
                    message: `Vui lòng nhập ${PROFILE_FORM[key].label}!`,
                  },
                ]}
              >
                <Input />
              </Form.Item>
            ))}
            <Form.Item
              label="Các giống sắn đang cung cấp"
              name="desc_cassava_active"
            >
              <Select
                mode="multiple"
                onSelect={(val) => handleSelect(val, "active")}
              >
                {CassavaOptions()}
              </Select>
            </Form.Item>

            <Form.Item
              label="Các giống sắn ngừng cung cấp"
              name="desc_cassava_inactive"
            >
              <Select
                mode="multiple"
                onSelect={(val) => handleSelect(val, "inactive")}
              >
                {CassavaOptions()}
              </Select>
            </Form.Item>
            <Form.Item label="Thông tin chi tiết" name="desc_detail">
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              label="Mật khẩu mới"
              name="new_password"
              rules={[
                {
                  validator: () => {
                    const pass = profileForm.getFieldValue("new_password");
                    if (pass) setRenewPassDisplay(true);
                    else setRenewPassDisplay(false);
                    return !pass || validatePassword(pass)
                      ? Promise.resolve()
                      : Promise.reject(
                          "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số!"
                        );
                  },
                },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              className={renewPassDisplay ? "" : "hidden"}
              label="Nhập lại Mật khẩu mới"
              name="renew_password"
              rules={[
                {
                  validator: () => {
                    const pass = profileForm.getFieldValue("new_password"),
                      repass = profileForm.getFieldValue("renew_password");
                    return pass && pass !== repass
                      ? Promise.reject("Mật khẩu không khớp!")
                      : Promise.resolve();
                  },
                },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item {...tailFormItemLayout}>
              <div className="w-full flex space-x-4 pt-4">
                {profileFormDisabled ? (
                  <PrimarySmallButton
                    onClick={() => setProfileFormDisabled(!profileFormDisabled)}
                  >
                    Chỉnh sửa trang cá nhân
                  </PrimarySmallButton>
                ) : (
                  <>
                    <SecondarySmallButton
                      onClick={() => {
                        setProfileFormDisabled(true);
                        profileForm.setFieldsValue({ ...context.user });
                      }}
                    >
                      Hủy thay đổi
                    </SecondarySmallButton>
                    <PrimarySmallButton htmlType="submit">
                      Lưu thay đổi
                    </PrimarySmallButton>
                  </>
                )}
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>
    </AnimationRevealPage>
  );
};
