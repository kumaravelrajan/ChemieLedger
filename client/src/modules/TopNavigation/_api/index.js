import request from "@/util/request";

export const checkNotification = async function(type) {
  return request({
    url: "/notification/" + type,
    method: "get"
  });
};
