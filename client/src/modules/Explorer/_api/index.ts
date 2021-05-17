import request from "../../../util/request";

export const createRequest = async function(data: any) {
  return request({
    url: "/request",
    method: "post",
    data
  });
};

export const deleteRequest = async function(id: string) {
  return request({
    url: "/request/" + id,
    method: "delete"
  });
};

export const getRequest = async function(id: string) {
  return request({
    url: "/request/" + id,
    method: "get"
  });
};

export const pushRequest = async function(id: string, data: any) {
  return request({
    url: "/request/" + id,
    method: "patch",
    data
  });
};

export const uploadRequestImage = async function(requestId: string, data: any) {
  return request({
    url: "/request/addimage/" + requestId,
    method: "post",
    timeout: 30000,
    data
  });
};

export const deleteImageFromRequest = async function(requestId: string, data: any) {
  return request({
    url: "/request/deleteimage/" + requestId,
    method: "post",
    data
  });
};

export const getImageURL = function(relativePath: string) {
  return process.env.VUE_APP_BACKEND_URL + relativePath;
};

export const getParentOrigins = async function() {
  return request({
    url: "/request/parentorigin",
    method: "get"
  });
};

export const getAvailableSubOrigins = async function(parentId: string) {
  return request({
    url: "/request/origin/" + parentId,
    method: "get"
  });
};

export const getOffers = async function() {
  return request({
    url: "/request/offers",
    method: "get"
  });
};

export const getRequests = async function() {
  return request({
    url: "/request/requests",
    method: "get"
  });
};

export const getOffersAndRequests = async function() {
  return request({
    url: "/request/all",
    method: "get"
  });
};

export const getOwnDraftOffersAndRequests = async function() {
  return request({
    url: "/request/own/draft",
    method: "get"
  });
};

export const getOwnClosedOffersAndRequests = async function() {
  return request({
    url: "/request/own/archive",
    method: "get"
  });
};

export const getOwnOffersAndRequests = async function() {
  return request({
    url: "/request/own/all",
    method: "get"
  });
};

export const getOwnOffers = async function() {
  return request({
    url: "/request/ownoffers",
    method: "get"
  });
};

export const getOwnRequests = async function() {
  return request({
    url: "/request/ownrequests",
    method: "get"
  });
};

export const getOwnDraftOffers = async function() {
  return request({
    url: "/request/ownoffers/draft",
    method: "get"
  });
};

export const getOwnDraftRequests = async function() {
  return request({
    url: "/request/ownrequests/draft",
    method: "get"
  });
};

export const getOwnArchiveOffers = async function() {
  return request({
    url: "/request/ownoffers/archive",
    method: "get"
  });
};

export const getOwnArchiveRequests = async function() {
  return request({
    url: "/request/ownrequests/archive",
    method: "get"
  });
};

export const getProductOffers = async function(productId: string) {
  return request({
    url: "/request/offers/" + productId,
    method: "get"
  });
};

export const getProductRequests = async function(productId: string) {
  return request({
    url: "/request/requests/" + productId,
    method: "get"
  });
};

export const getRequestCommunication = async function(requestId: string) {
  return request({
    url: "/communication/request/" + requestId,
    method: "get"
  });
};

export const postCommunicationRequest = async function(requestId: string, data: any) {
  return request({
    url: "/communication/new/" + requestId,
    method: "post",
    data
  });
};

export const pushMessage = async function(communicationId: string, data: any) {
  return request({
    url: "/communication/request/addmessage/" + communicationId,
    method: "post",
    data
  });
};

export const sendMessageRead = async function(communicationId: string) {
  return request({
    url: "/communication/messageread/" + communicationId,
    method: "post"
  });
};

export const postCloseRequest = async function(requestId: string, data: any) {
  return request({
    url: "/request/deleterequest/" + requestId,
    method: "post",
    data
  });
};

export const postCloseRequestWithoutDeal = async function(requestId: string) {
  return request({
    url: "/request/deleterequestwithoutdeal/" + requestId,
    method: "post"
  });
};

export const getNicknameFromUserId = async function(userId: string) {
  return request({
    url: "/user/nickname/" + userId,
    method: "get"
  });
};

export const getWhatchlistIds = async function() {
  return request({
    url: "/user/whatchlist/ids",
    method: "get"
  });
};

export const addItemToWhatchlist = async function(id: string) {
  const data = { requestId: id };
  return request({
    url: "/user/whatchlist/add",
    method: "post",
    data
  });
};

export const removeItemFromWhatchlist = async function(id: string) {
  const data = { requestId: id };
  return request({
    url: "/user/whatchlist/remove",
    method: "post",
    data
  });
};

export const getWhatchlistRequests = async function() {
  return request({
    url: "/user/whatchlist/requests",
    method: "get"
  });
};
