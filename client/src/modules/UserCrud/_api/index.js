import request from "@/util/request";

export const getAllUsers = async function() {
  return request({ url: "/user", method: "get" });
};

export const patchUser = (userId, data) => {
  return request({ url: "/user/" + userId, method: "patch", data });
};

export const deleteUser = userId => {
  return request({ url: "/user/" + userId, method: "delete" });
};
