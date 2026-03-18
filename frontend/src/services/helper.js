const convertVNtoEN = (str) => {
  str = str.toLocaleLowerCase();
  str = str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
  str = str.replace(/([^0-9a-z-_\s])/g, "");
  str = str.replace(/(\s+)/g, " ");
  str = str.replace(/^ +/g, "");
  str = str.replace(/ +$/g, "");
  return str;
};

// convert string to slug
const convertToSlug = (str) => {
  str = convertVNtoEN(str);
  str = str.replace(/(\s+)/g, "-");
  str = str.replace(/(-+)/g, "-");
  return str;
};

const compareStringNormal = (father = "", son = "") =>
  father
    .replace(/\s/g, "")
    .toLocaleLowerCase()
    .includes(son.replace(/\s/g, "").toLocaleLowerCase());

const compareStringPro = (father = "", son = "") =>
  convertVNtoEN(father).includes(convertVNtoEN(son));

const randBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

// shorten string to length size
const shortenBlog = (content = "", length = 100) =>
  content.length > length ? content.substring(0, length) + "..." : content;

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const validatePhone = (phone) => {
  return String(phone).match(
    /^((01[2689]|08|09|03|07|05|04|02[0123456789]|06)|(([+]{0,1}84)(1[2689]|8|9|3|7|5|4|2[0123456789]|6)))[0-9]{8}$/
  );
};

// min = 8, at least 1 letter, 1 number
const validatePassword = (password) => {
  return String(password).match(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{8,}$/
  );
};

export {
  convertToSlug,
  compareStringNormal,
  compareStringPro,
  randBetween,
  shortenBlog,
  validateEmail,
  validatePhone,
  validatePassword,
};
