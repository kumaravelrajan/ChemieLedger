import request from "@/util/request";
import { getParentOrigins } from "@/modules/Explorer/_api";

export const getInitiatedRequestCommunications = async function() {
  return request({
    url: "/communication/initiated",
    method: "get"
  });
};

export const getRequestCommunicationsOfOwnRequests = async function() {
  return request({
    url: "/communication/requested",
    method: "get"
  });
};

export const getNewRequestCommunications = async function() {
  return request({
    url: "/communication/neworupdated",
    method: "get"
  });
};

export const getOrigins = async function() {
  return getParentOrigins();
};
