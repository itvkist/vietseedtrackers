import React, { useContext, useEffect, useState } from "react";
import tw from "twin.macro";
import styled from "styled-components";
import { css } from "styled-components/macro"; //eslint-disable-line
import "./style.css";

import logo from "../images/logo.svg";
import Context from "services/context.js";
import axiosInstance, { handleLogout } from "services/axios.js";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Drawer, message } from "antd";
import { getUser } from "services/axios/user";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  MenuOutlined,
} from "@ant-design/icons";

export const NavLink = tw(Link)`
  text-sm mx-6 my-0
  font-semibold tracking-wide transition duration-300
  py-2 border-b border-transparent hocus:border-primary-500 hocus:text-primary-500
`;

export const PrimaryLink = tw(NavLink)`
  lg:mx-0
  px-8 py-3 rounded bg-primary-500 text-gray-100
  hocus:bg-primary-700 hocus:text-gray-200 focus:shadow-outline
  border-b-0
`;

export const LogoLink = styled(NavLink)`
  ${tw`flex items-center font-black border-b-0 text-2xl`};

  img {
    ${tw`w-10`}
  }
`;

export default () => {
  const navigate = useNavigate();
  const location = useLocation();
  const context = useContext(Context);
  const user = context.user;
  const [drawer, setDrawer] = useState(false);
  const [opening, setOpening] = useState(-1);

  useEffect(() => {
    setDrawer(false);
    setOpening(-1);
  }, [location.pathname]);

  useEffect(() => {
    const access_token = localStorage.getItem("access_token") || null;
    const refresh_token = localStorage.getItem("refresh_token") || null;
    if (access_token && refresh_token) {
      context.setUser({
        ...user,
        access_token: access_token,
        refresh_token: refresh_token,
      });
      axiosInstance.defaults.headers.common["Authorization"] =
        "Bearer " + localStorage.getItem("access_token");
    } else {
      context.setUser(null);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    user?.access_token &&
      getUser()
        .then((res) => {
          context.setUser({
            ...user,
            ...res.data.data,
          });
        })
        .catch((err) => {
          handleLogout().then((res) => {});
        });
    // eslint-disable-next-line
  }, [user?.access_token]);

  const handleLogoutClick = async () => {
    const res = await handleLogout();
    if (res?.status) {
      message.success("Đăng xuất thành công");
      context.setUser(null);
      navigate("/");
    } else {
      context.setUser(null);
      message.error("Đăng xuất không thành công");
    }
  };

  return (
    <>
      <header
        className="flex justify-between items-center w-full mx-auto px-[10%] py-4 sticky top-0 bg-white"
        style={{ zIndex: drawer ? 0 : 1001 }}
      >
        <nav className="hidden md:flex flex-1 justify-between items-center">
          <LogoLink to="/">
            <img src={logo} alt="logo" />
            Koica
          </LogoLink>
          <div className="inline-block space-x-8">
            <NavLink to="/">Trang chủ</NavLink>
            <span className="dropdownTrigger">
              <NavLink to="/">Tài nguyên</NavLink>
              <div className="dropdownContent">
                <NavLink to="/cassavas">Các giống sắn</NavLink>
                <NavLink to="/diseases">Các bệnh về sắn</NavLink>
                <NavLink to="/diagnostics">Chẩn đoán bệnh</NavLink>
                <NavLink to="/market">Thương mại sắn</NavLink>
                <NavLink to="/suppliers">Danh sách nguồn cung</NavLink>
                <NavLink to="/maps">
                  Bản đồ theo dõi
                  <br />
                  nguồn giống
                </NavLink>
              </div>
            </span>
            <span className="dropdownTrigger">
              <NavLink to="/">Diễn đàn</NavLink>
              <div className="dropdownContent">
                <NavLink to="/blogs">Tổng hợp</NavLink>
                <NavLink to="/blog_create">Tạo blog</NavLink>
              </div>
            </span>
            {user ? (
              <span className="dropdownTrigger">
                <NavLink to="/">Tài khoản</NavLink>
                <div className="dropdownContent">
                  <NavLink to="/market_user">Quản lý đề xuất</NavLink>
                  <NavLink to="/profile">Thông tin tài khoản</NavLink>
                  <NavLink onClick={handleLogoutClick}>Đăng xuất</NavLink>
                </div>
              </span>
            ) : (
              <>
                <PrimaryLink to={"/signin"}>Đăng nhập</PrimaryLink>
              </>
            )}
          </div>
        </nav>
        <div className="md:hidden flex w-full justify-between items-center">
          <LogoLink to="/">
            <img src={logo} alt="logo" />
            Koica
          </LogoLink>
          <MenuOutlined onClick={() => setDrawer(true)} />
        </div>
      </header>
      <Drawer
        className="sm:hidden"
        title={""}
        placement="right"
        onClose={() => setDrawer(false)}
        open={drawer}
      >
        <nav className="flex flex-col space-y-4">
          <NavLink className="" to="/">
            Trang chủ
          </NavLink>
          <span>
            <NavLink
              className="flex justify-between"
              onClick={() => {
                if (opening !== 1) setOpening(1);
                else setOpening(-1);
              }}
            >
              Tài nguyên
              {opening === 1 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            </NavLink>

            <div
              className={`${
                opening === 1 ? "flex " : "hidden "
              } flex flex-col space-y-2`}
            >
              <NavLink to="/cassavas">Các giống sắn</NavLink>
              <NavLink to="/diseases">Các bệnh về sắn</NavLink>
              <NavLink to="/diagnostics">Chẩn đoán bệnh</NavLink>
              <NavLink to="/market">Thương mại sắn</NavLink>
              <NavLink to="/suppliers">Danh sách nguồn cung</NavLink>
              <NavLink to="/maps">
                Bản đồ theo dõi <br className="hidden sm:block" />
                nguồn giống
              </NavLink>
            </div>
          </span>
          {user ? (
            <span>
              <NavLink
                className="flex justify-between"
                onClick={() => {
                  if (opening !== 2) setOpening(2);
                  else setOpening(-1);
                }}
              >
                Tài khoản
                {opening === 2 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              </NavLink>
              <div
                className={`${
                  opening === 2 ? "flex " : "hidden "
                } flex flex-col space-y-2`}
              >
                <NavLink to="/market_user">Quản lý đề xuất</NavLink>
                <NavLink to="/profile">Thông tin tài khoản</NavLink>
                <NavLink onClick={handleLogoutClick}>Đăng xuất</NavLink>
              </div>
            </span>
          ) : (
            <>
              <PrimaryLink to={"/signin"}>Đăng nhập</PrimaryLink>
            </>
          )}
        </nav>
      </Drawer>
    </>
  );
};
