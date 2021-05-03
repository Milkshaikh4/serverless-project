import API from "./api";

const url = "http://127.0.0.1:5000/dummy/user/follow";

const options = {
  method: "PUT",
  headers: {
    Authorization: "Token " + token,
  },
};

const res = await fetch(`${url}`, options);

return res;
