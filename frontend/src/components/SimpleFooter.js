import React from "react";
import tw from "twin.macro";
import { css } from "styled-components/macro"; //eslint-disable-line

import LogoImage from "images/logo.svg";
const Container = tw.div`relative bg-gray-200 text-gray-700 px-8 py-4 sm:py-12 sm:mt-8 mt-[43px] bottom-0`;
const Content = tw.div`max-w-screen-xl mx-auto relative z-10`;
const ThreeColRow = tw.div`flex flex-col md:flex-row items-center justify-between`;
const LogoContainer = tw.div`flex items-center justify-center md:justify-start`;
const LogoImg = tw.img`w-8`;
const LogoText = tw.h5`ml-2 text-xl font-black tracking-wider text-gray-800`;
const CopywrightNotice = tw.p`text-center text-sm sm:text-base mt-8 md:mt-0 font-medium text-gray-500`;

export default () => {
  return (
    <Container>
      <Content>
        <ThreeColRow>
          <LogoContainer>
            <LogoImg src={LogoImage} />
            <LogoText>KOICA</LogoText>
          </LogoContainer>
          <CopywrightNotice>
            &copy; 2023 KOICA. All Rights Reserved.
          </CopywrightNotice>
        </ThreeColRow>
      </Content>
    </Container>
  );
};
