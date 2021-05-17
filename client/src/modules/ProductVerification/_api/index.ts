import request from "../../../util/request";

export const getUnverifiedProducts = async function() {
  return request({ url: "/product/unverifiedproducts", method: "get" });
};

export const verifyProduct = async function(productId: string) {
  return request({ url: "/product/verifyproduct/" + productId, method: "post"});
};

export const deleteProduct = async function(productId: string) {
  return request({ url: "/product/" + productId, method: "delete"});
};
