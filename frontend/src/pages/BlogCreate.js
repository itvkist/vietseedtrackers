import React, { useContext, useState } from "react";
import { css } from "styled-components/macro"; //eslint-disable-line
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import { Input, message, Select, Typography, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { postBlog } from "services/axios/blog";
import Context from "services/context";
import { PrimaryButton } from "components/misc/Buttons";
import { postFile } from "services/axios/file";
import RequireLoginModal from "components/RequireLoginModal";
import { BlogEditor } from "components/BlogComponents";
const { Dragger } = Upload;

export default () => {
  const context = useContext(Context);

  const [titleImg, setTitleImg] = useState(null);
  const [title, setTitle] = useState("");
  const [blogTag, setBlogTag] = useState([]);
  const [content, setContent] = useState("");

  const resetBlog = () => {
    setTitleImg(null);
    setTitle("");
    setBlogTag([]);
    setContent("");
  };

  const beforeUpload = (file) => {
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      message.error(`${file.name} không phải ảnh.`, 2);
      return null;
    }
    return false;
  };

  const handleFinish = async () => {
    if (!title) message.error("Tiêu đề không được để trống!", 2);
    else if (!content || content === "<p></p>")
      message.error("Nội dung không được để trống!", 2);
    else {
      const formData = new FormData();
      if (titleImg)
        try {
          formData.append("title", titleImg.name);
          formData.append("file", titleImg.originFileObj);
          await postFile(formData).then(async (imgRes) => {
            if (imgRes && imgRes.status === 200) {
              await postBlog({
                title: title,
                titleImg: imgRes.data.data.id,
                tags: blogTag,
                content: content,
              }).then((blogRes) => {
                if (blogRes && blogRes.status === 200) {
                  message.success("Tạo blog thành công!", 2);
                  resetBlog();
                } else message.error("Tạo blog thất bại!", 2);
              });
            }
          });
        } catch (e) {}
      else
        await postBlog({
          title: title,
          tags: blogTag,
          content: content,
        }).then((blogRes) => {
          if (blogRes && blogRes.status === 200) {
            message.success("Tạo blog thành công!", 2);
            resetBlog();
          } else message.error("Tạo blog thất bại!", 2);
        });
    }
  };

  return (
    <AnimationRevealPage>
      <div className="flex flex-col justify-center items-center">
        <Typography.Title>Trang viết blog</Typography.Title>
      </div>
      <div className="flex flex-col items-center sm:px-8 md:px-16">
        <RequireLoginModal pageName="Trang viết blog" />
        <div className="w-full md:w-4/5 flex items-center mb-4 md:space-x-8 flex-col-reverse md:flex-row">
          <div className="w-[90%] md:w-1/4 md:mt-0 mt-4">
            <Dragger
              name="Upload"
              maxCount={1}
              accept="image/*"
              listType="picture"
              beforeUpload={beforeUpload}
              onChange={(e) =>
                e?.fileList?.length > 0 && setTitleImg(e.fileList[0])
              }
              onRemove={() => setTitleImg([])}
              fileList={titleImg ? [titleImg] : []}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Bấm hoặc kéo thả để tải ảnh bìa</p>
              <p className="ant-upload-hint">
                Chỉ chấp nhận các file .png, .jpg.
              </p>
            </Dragger>
          </div>
          <div className="w-[90%] md:w-1/2 flex flex-col">
            <div className="text-base	font-semibold">
              Tiêu đề <span className="text-red-500">*</span>
            </div>
            <Input
              placeholder="Giống sắn mới, Tin tức ngày 20/03/2023,..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="text-base	font-semibold mt-4">Tag bài viết</div>
            <Select
              mode="multiple"
              allowClear
              style={{
                width: "100%",
              }}
              placeholder={
                context.blogTag?.length > 2
                  ? context.blogTag[0].label +
                    ", " +
                    context.blogTag[1].label +
                    "..."
                  : "Tag bài viết"
              }
              options={context.blogTag || []}
              value={blogTag}
              onChange={(v) => setBlogTag(v)}
            />
          </div>
        </div>

        <BlogEditor content={content} setContent={setContent} />
      </div>

      <div className="flex flex-col justify-center items-center">
        <PrimaryButton onClick={handleFinish}>Gửi blog</PrimaryButton>
      </div>
    </AnimationRevealPage>
  );
};
