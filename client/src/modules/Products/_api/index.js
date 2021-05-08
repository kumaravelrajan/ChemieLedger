import request from "@/util/request";

export const getProductInformation = async function() {
  return request({ url: "/product", method: "get" });
};

export const postProduct = async function(data) {
  return request({ url: "/product", method: "post", data });
};

export const getProduct = async function(productId) {
  return request({ url: "/product/" + productId, method: "get" });
};

export const getPricehistory = async function(productId, type) {
  return request({ url: "/pricehistory/" + productId + "/" + type, method: "get" });
};
