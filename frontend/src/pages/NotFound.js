import React from "react";
import { css } from "styled-components/macro"; //eslint-disable-line
import "./bubble.css";
import { Typography } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { PrimaryLink } from "components/Header";
import { randBetween } from "services/helper";

export default () => {
  return (
    <div className="bubbles">
      {new Array(20).fill(0).map((_, i) => {
        const value = {
          opacity: randBetween(4, 9) / 10.0,
          size: randBetween(40, 140) * 0.05 + "rem",
          left: randBetween(10, 110) - 10,
          animationDuration: randBetween(4, 12),
          animationDelay: randBetween(1, 8) - 1,
        };
        return (
          <div
            className="bubble"
            key={i}
            style={{
              opacity: value.opacity,
              width: value.size,
              height: value.size,
              left: value.left + "%",
              animationDuration: value.animationDuration + "s",
              animationDelay: value.animationDelay + "s",
            }}
          ></div>
        );
      })}
      <div className="center-me" style={{ zIndex: 10 }}>
        <div className="flex justify-center items-center mt-10 sm:mt-0 text-9xl sm:text-[10rem]">
          4<QuestionCircleOutlined className="px-4 spin-icon" />4
        </div>
        <div className="flex flex-col justify-center items-center my-16 space-y-8">
          <Typography.Title className="blinking text-center sm:!text-5xl !text-3xl">
            Trang không tồn tại
          </Typography.Title>
          <PrimaryLink to="/" className="!text-xl sm:!text-2xl">
            Về trang chủ
          </PrimaryLink>
        </div>
      </div>
    </div>
  );
};
