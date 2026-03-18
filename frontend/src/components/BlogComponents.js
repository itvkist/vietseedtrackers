import { Card, Image, Tag } from "antd";
import React, { useContext, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";
import Context from "services/context";
// import { shortenBlog } from "services/helper";
import { BASE_URL } from "services/url";
const { Meta } = Card;

const TAG_COLOURS = [
  "magenta",
  "red",
  "volcano",
  "orange",
  "gold",
  "lime",
  "green",
  "cyan",
  "blue",
  "geekblue",
  "purple",
];

const MODULES = {
  toolbar: [
    [{ header: [false, 1, 2, 3, 4] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ size: ["small", false, "large", "huge"] }], // custom dropdown
    [{ align: [] }],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["link", "image"],
    ["clean"],
  ],
};

const FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
];

export function BlogEditor(props) {
  return (
    <div className="h-[36rem] w-full md:w-4/5">
      <ReactQuill
        className="h-[80%] md:h-[90%] w-full"
        theme="snow"
        modules={MODULES}
        formats={FORMATS}
        placeholder={"Nhập nội dung ở đây..."}
        value={props.content}
        onChange={props.setContent}
      />
    </div>
  );
}

export const BlogTag = (props) => {
  const { blogTag } = useContext(Context);
  const { tag } = props;
  const [tagIndex, setTagIndex] = useState(-1);

  useEffect(() => {
    if (blogTag.length > 0)
      setTagIndex(blogTag?.findIndex((blog_tag) => blog_tag.name === tag));
  }, [blogTag, tag]);

  return (
    <Tag color={tagIndex !== -1 ? TAG_COLOURS[tagIndex] : ""}>
      {tagIndex !== -1 && blogTag[tagIndex].vn_name}
    </Tag>
  );
};

export const BlogCard = (blogProps) => {
  const { props } = blogProps;
  const navigate = useNavigate();
  return (
    <Card
      style={{ marginBottom: "1rem", padding: "1rem" }}
      className="w-[420px]"
      hoverable
      cover={
        <Image
          className="object-contain"
          height={210}
          src={props?.titleImg ? BASE_URL + "/assets/" + props?.titleImg : ""}
          preview={false}
          fallback="https://pqm.vn/wp-content/uploads/2021/02/phuong-phap-trong-va-cham-soc-cay-san-cay-san-cay-khoai-mi-neo-nam-viet-1-768x432.jpg"
          alt="example"
        />
      }
      onClick={() => navigate("/blogs/" + props.blog_link)}
    >
      <Meta
        title={props.title}
        description={
          <>
            {props.tags?.length > 0 && (
              <div>
                {props.tags.map((tag, index) => (
                  <BlogTag tag={tag} key={index} />
                ))}
              </div>
            )}
            {/* <div
              dangerouslySetInnerHTML={{ __html: shortenBlog(props.content) }}
            /> */}
          </>
        }
      />
    </Card>
  );
};
