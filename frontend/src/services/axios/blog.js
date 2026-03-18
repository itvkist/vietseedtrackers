import axiosInstance, { newAbortSignal } from "services/axios";

export const getBlogTag = async () => {
  const res = await axiosInstance.get("/items/blog_tag?limit=-1", {
    signal: newAbortSignal(),
  });
  return res;
};

export const getCountBlogs = async () => {
  const res = await axiosInstance.get("/items/blog?aggregate[count]=*", {
    signal: newAbortSignal(),
  });
  return res;
};

export const getBlogs = async () => {
  const res = await axiosInstance.get("/items/blog?limit=-1&fields=id,title,titleImg,tags", {
    signal: newAbortSignal(),
  });
  return res;
};

export const getBlogDetail = async (id) => {
  const res = await axiosInstance.get(
    `/items/blog/?fields=*${id ? "&filter[id][_eq]=" + id : ""}`,
    {
      signal: newAbortSignal(),
    }
  );
  return res;
};

export const postBlog = async (data) => {
  const res = await axiosInstance.post(
    "/items/blog",
    { ...data, status: "published" },
    {
      signal: newAbortSignal(),
    }
  );
  return res;
};
