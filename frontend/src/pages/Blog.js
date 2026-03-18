import { useContext, useEffect, useState } from "react";
import { css } from "styled-components/macro"; //eslint-disable-line
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import {
  Typography,
  Image,
  Input,
  Button,
  Empty,
  Pagination,
  Select,
  message,
} from "antd";
import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "services/url";
import { compareStringPro, convertToSlug } from "services/helper";
import { getBlogDetail, getBlogs } from "services/axios/blog";
import { BlogCard, BlogTag } from "components/BlogComponents";
import Context from "services/context";
import { ERR_CODE_API } from "services/axios";

export const BlogDetail = (props) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  const context = useContext(Context);

  useEffect(() => {
    const propsArr = props?.title.split("-");
    if (propsArr.length > 1) {
      const id = propsArr[0];
      getBlogDetail(id).then((res) => {
        if (res?.data?.data?.length > 0) {
          setData(res.data.data[0]);
        }
      });
    }
  }, [props?.title]);

  useEffect(() => {
    if (context?.cassava) {
      if (context.user)
        if (!context?.user?.id || !context.user?.role)
          message.error(ERR_CODE_API[403].message);
    }
    // eslint-disable-next-line
  }, [context?.cassava, context?.user]);

  return (
    <AnimationRevealPage>
      {data ? (
        <>
          <div className="flex flex-col justify-center items-center text-lg mb-4">
            <div className="flex items-center justify-center">
              <Button
                className="!hidden sm:!block"
                style={{ left: "-280px" }}
                size="large"
                shape="circle"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
              />
              <Typography.Title style={{ margin: 0 }}>
                {data?.title || "Chưa có"}
              </Typography.Title>
            </div>
          </div>
          <div className="w-full px-4 md:px-8 xl:px-64 flex flex-col justify-center">
            {data.tags?.length > 0 && (
              <div className="flex items-center justify-center mb-8">
                {data.tags.map((tag, index) => (
                  <BlogTag tag={tag} key={index} />
                ))}
              </div>
            )}
            {data?.titleImg && (
              <div className="flex justify-center">
                <Image
                  className="object-contain"
                  src={BASE_URL + "/assets/" + data?.titleImg}
                  preview={false}
                  fallback="https://pqm.vn/wp-content/uploads/2021/02/phuong-phap-trong-va-cham-soc-cay-san-cay-san-cay-khoai-mi-neo-nam-viet-1-768x432.jpg"
                />
              </div>
            )}
            <div dangerouslySetInnerHTML={{ __html: data.content }} />
          </div>
        </>
      ) : (
        <Empty
          className="flex items-center justify-center flex-1 h-full"
          description="Không tìm thấy bài viết này"
        />
      )}
    </AnimationRevealPage>
  );
};

export default () => {
  const PAGE_SIZE = 12;

  const context = useContext(Context);

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [blogTag, setBlogTag] = useState([]);

  useEffect(() => {
    getBlogs().then((blogsRes) => {
      if (blogsRes?.data?.data?.length > 0) {
        const formated_res = blogsRes.data.data.map((i) => ({
          ...i,
          blog_id: i.id,
          blog_link: convertToSlug(i.id + " " + i.title),
        }));
        setData(formated_res);
      }
    });
  }, []);

  useEffect(() => {
    const srch = search?.trim();
    let filtering = data;
    if (srch !== "")
      filtering = data.filter((i) => compareStringPro(i.title, srch));
    if (blogTag.length > 0)
      filtering = filtering.filter((blg) =>
        blg.tags?.some((j) => blogTag.includes(j))
      );

    setFilteredData(filtering);
  }, [page, data, search, blogTag]);

  const reset = () => {
    setFilteredData(data);
    setSearch("");
    setBlogTag([]);
    setPage(1);
  };

  return (
    <AnimationRevealPage>
      <div className="flex flex-col justify-center items-center">
        <Typography.Title>Diễn đàn</Typography.Title>
      </div>
      <div className="flex flex-col justify-center items-center">
        <div className="w-full flex justify-center flex-col md:flex-row md:space-x-4 pb-4 px-4 sm:px-0">
          <div className="w-full md:w-1/4">
            <Input.Search
              placeholder="Tìm kiếm theo tên"
              value={search}
              onChange={(v) => {
                setSearch(v.target.value);
              }}
            />
          </div>
          <div className="w-full md:w-1/4">
            <Select
              style={{ width: "100%" }}
              mode="multiple"
              allowClear
              placeholder="Tìm kiếm theo tag"
              options={context.blogTag || []}
              value={blogTag}
              onChange={(v) => setBlogTag(v)}
            />
          </div>
          <Button icon={<ReloadOutlined />} onClick={reset} />
        </div>
      </div>
      <div className="flex flex-col justify-center items-center">
        <div className="w-full flex flex-wrap justify-evenly">
          {filteredData
            .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
            .map((i) => (
              <BlogCard key={i.blog_id} props={i} />
            ))}
          {filteredData.length === 0 && (
            <Empty
              className="flex items-center justify-center flex-1 h-full pb-4"
              description="Không tìm thấy bài viết nào"
            />
          )}
        </div>
        <Pagination
          pageSize={PAGE_SIZE}
          current={page}
          showSizeChanger={false}
          onChange={(p) => setPage(p)}
          total={filteredData.length}
        />
      </div>
    </AnimationRevealPage>
  );
};
