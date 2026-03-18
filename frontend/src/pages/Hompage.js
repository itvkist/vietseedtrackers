import React, { useContext, useEffect, useState } from "react";
import tw from "twin.macro";
import { css } from "styled-components/macro"; //eslint-disable-line
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import Hero from "components/hero/TwoColumnWithVideo.js";
import TabGrid from "components/TabCardGrid.js";
import { HighlightedText } from "components/misc/Headings";
import { SectionHeading } from "components/misc/Headings.js";
import styled from "styled-components";
import Context from "services/context";
import { DEFAULT_AREA_DATA, MapDiv } from "./Maps";
import { getMergedAreaDiseaseData } from "services/axios/map";
import { Link } from "react-router-dom";
import FAQs from "components/FAQs";

const Container = styled.div`
  ${tw`flex flex-col items-center md:items-stretch md:flex-row flex-wrap md:justify-center`}
`;
const HeaderRow = tw.div`flex justify-center items-center flex-col xl:flex-row w-full`;
const Header = tw(SectionHeading)`flex`;

const Card = styled.div`
  ${tw`flex flex-col mx-auto items-center sm:p-4 sm:border-2 border-dashed border-primary-500 rounded-lg mt-8`}
  .title {
    ${tw`mt-2 font-bold sm:text-xl text-lg leading-none text-primary-500`}
  }

  .imageContainer {
    ${tw`text-center flex-shrink-0 relative`}
    img {
      ${tw`w-full h-full`}
    }
  }
`;

export default () => {
  const context = useContext(Context);

  const [areaData, setAreaData] = useState(DEFAULT_AREA_DATA);
  const [diseaseData, setDiseaseData] = useState(null);
  const [cassavaData, setCassavaData] = useState(null);
  const [areaDiseaseData, setAreaDiseaseData] = useState([]);

  const getAreaDiseaseData = async () => {
    await getMergedAreaDiseaseData(diseaseData, cassavaData).then(
      (areaDisease) => {
        setAreaDiseaseData([...areaDisease]);
      }
    );
  };

  useEffect(() => {
    diseaseData && cassavaData && getAreaDiseaseData();
    // eslint-disable-next-line
  }, [diseaseData, cassavaData]);

  // set map for diseases
  useEffect(() => {
    if (context.disease && context.cassava) {
      if (!cassavaData) setCassavaData(context.cassava);
      if (!diseaseData) setDiseaseData(context.disease);
    }
    if (context.mapData) {
      setAreaData({ ...areaData, districts: context.mapData });
    }
    // eslint-disable-next-line
  }, [context?.disease, context?.cassava]);

  const filteredDiseases = () => areaDiseaseData;

  return (
    <AnimationRevealPage>
      <Hero />
      <TabGrid />
      <Container>
        <HeaderRow>
          <Header>
            <Link to={"/maps"}>
              <HighlightedText>Bản đồ theo dõi nguồn giống</HighlightedText>
            </Link>
          </Header>
        </HeaderRow>
        <div className="w-full px-6 flex">
          <Card>
            <span className="imageContainer">
              {MapDiv({
                areaData: areaData,
                filteredDiseases: filteredDiseases,
              })}
            </span>
          </Card>
        </div>
      </Container>
      <FAQs />
    </AnimationRevealPage>
  );
};
