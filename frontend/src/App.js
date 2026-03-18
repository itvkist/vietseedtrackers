import React, { useEffect, useState } from "react";
import GlobalStyles from "styles/GlobalStyles";
import "./style.css";
import { css } from "styled-components/macro"; //eslint-disable-line
import ComponentRenderer from "ComponentRenderer.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Outlet } from "react-router-dom";
import Header from "components/Header.js";
import Footer from "components/SimpleFooter.js";
import Context from "services/context";
import { getDiseases } from "services/axios/disease";
import { getCassavas } from "services/axios/cassava";
import { getAllMapData } from "services/axios/map";
import { getBlogTag } from "services/axios/blog";

export default function App() {
  const [user, setUser] = useState(null);
  const [disease, setDisease] = useState(null);
  const [cassava, setCassava] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [blogTag, setBlogTag] = useState([]);

  // const navigate = useNavigate();
  useEffect(() => {
    getDiseases().then((res) => setDisease(res.data.data));
    getCassavas().then((res) => setCassava(res.data.data));
    getAllMapData().then((districts) => {
      setMapData({ districts: districts });
    });
    getBlogTag().then((res) => {
      if (res?.data?.data) {
        const blogTags = res.data.data.map((tag) => ({
          ...tag,
          label: tag.vn_name,
          value: tag.name,
        }));
        setBlogTag(blogTags);
      }
    });
  }, []);

  return (
    <>
      <Context.Provider
        value={{
          user: user,
          setUser: setUser,
          disease: disease,
          setDisease: setDisease,
          cassava: cassava,
          setCassava: setCassava,
          mapData: mapData,
          setMapData: setMapData,
          blogTag: blogTag,
          setBlogTag: setBlogTag,
        }}
      >
        <GlobalStyles />
        <Router>
          <Header />
          <Routes>
            <Route
              path="/"
              element={
                <div className="content-full">
                  <Outlet />
                </div>
              }
            >
              <Route path=":page" element={<ComponentRenderer />} />
              <Route path=":page/:id" element={<ComponentRenderer />} />
              <Route path="/" element={<ComponentRenderer />} />
            </Route>
          </Routes>
          <Footer />
        </Router>
      </Context.Provider>
    </>
  );
}
