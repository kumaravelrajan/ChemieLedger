import request from "../../../util/request";

export const checkNotification = async function(type: string) {
  return request({
    url: "/notification/" + type,
    method: "get"
  });
};
