import request from "../../../util/request";

export const getAllUsers = async function() {
  return request({ url: "/user", method: "get" });
};

export const patchUser = (userId: string, data: any) => {
  return request({ url: "/user/" + userId, method: "patch", data });
};

export const deleteUser = (userId: string) => {
  return request({ url: "/user/" + userId, method: "delete" });
};
