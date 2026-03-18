import axios from "axios";
const { BASE_URL } = require("./url");

export const ERR_CODE_API = {
  403: {
    name: "Chưa xác minh",
    message:
      "Tài khoản chưa được xác minh! vui lòng liên hệ admin hoặc chờ từ 2-3 ngày để hệ thống xét duyệt tài khoản.",
  },
  401: {
    name: "Phiên đăng nhập hết hạn",
    message:
      "Phiên đăng nhập của bạn đã hết hạn, xin vui lòng đăng nhập lại để tiếp tục sử dụng.",
  },
};

export function newAbortSignal(timeoutMs = 5000) {
  const abortController = new AbortController();
  setTimeout(() => abortController.abort(), timeoutMs);

  return abortController.signal;
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  signal: null,
});

// eslint-disable-next-line
const refreshAccessToken = async () =>
  await axios.post(BASE_URL + "/auth/refresh", {
    refresh_token: localStorage.getItem("refresh_token"),
    mode: "json",
  });

export const login = async ({ email, password }) => {
  var message = "";
  try {
    const res = await publicAxiosInstance.post("/auth/login", {
      email: email,
      password: password,
    });
    if (res.status === 200) {
      const resData = res.data.data;
      axiosInstance.defaults.headers.common["Authorization"] =
        "Bearer " + resData.access_token;
      localStorage.setItem("refresh_token", resData.refresh_token);
      localStorage.setItem("access_token", resData.access_token);
      return { ...resData, status: true };
    }
  } catch (e) {
    message = "Sai thông tin đăng nhập!";
    return { status: false, message: message };
  }
};

export const logout = async () => {
  const res = await axiosInstance.post("/auth/logout", {
    refresh_token: localStorage.getItem("refresh_token"),
  });
  if (res.status === 204) {
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("access_token");
    delete axiosInstance.defaults.headers.common["Authorization"];
    return { status: true };
  }
  return { status: false };
};

export const handleLogout = async () => {
  var res = null;
  try {
    res = await logout();
  } catch (e) {
    delete axiosInstance.defaults.headers.common["Authorization"];
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("access_token");
  }
  return res;
};

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // const config = error.config;
    const response = error.response;
    if (response?.status === 403 && response?.code === "ERR_BAD_REQUEST")
      return Promise.resolve(ERR_CODE_API[403]); // Chưa được xác minh tài khoản
    if (401 === response?.status) {
      // const res = await refreshAccessToken();
      // if (res.status === 200) {
      //   const { access_token, refresh_token } = res.data.data;
      //   localStorage.setItem("access_token", access_token);
      //   localStorage.setItem("refresh_token", refresh_token);
      //   config.headers["Authorization"] = "Bearer " + access_token;
      // } else {
      delete axiosInstance.defaults.headers.common["Authorization"];
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("access_token");
      window.location.href = "/";
      alert(ERR_CODE_API[401].message);
      return Promise.resolve(ERR_CODE_API[401]);
      // }
    }
    return Promise.resolve(error?.response || error);
    // return Promise.reject(error);
  }
);

export default axiosInstance;

export const publicAxiosInstance = axios.create({
  baseURL: BASE_URL,
});
