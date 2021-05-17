import request from "../../../util/request";

export const getArticleMinInformation = async function(articleType: string) {
  return request({
    url: "/article/overview/" + articleType,
    method: "get"
  });
};

export const getPublicArticle = async function(articleId: string) {
  return request({
    url: "/article/" + articleId,
    method: "get"
  });
};

export const getArticleOverviewList = async function(articleType: string) {
  return request({
    url: "/editorial/articlesOverview/" + articleType,
    method: "get"
  });
};

export const deleteArticle = async function(articleId: string) {
  return request({
    url: "/editorial/article/" + articleId,
    method: "delete"
  });
};

export const postNewArticle = (articleType: string, data: any) => {
  return request({
    url: "/editorial/article/" + articleType,
    method: "post",
    data
  });
};

export const getAllArticleInformation = async function(articleId: string) {
  return request({
    url: "/editorial/article/edit/" + articleId,
    method: "get"
  });
};

export const patchArticle = (articleId: string, data: any) => {
  return request({
    url: "/editorial/article/edit/basicInformation/" + articleId,
    method: "patch",
    data
  });
};

export const getImageURL = function(relativePath: string) {
  return process.env.VUE_APP_BACKEND_URL + relativePath;
};

export const uploadImage = async function(articleId: string, data: any) {
  return request({
    url: "/editorial/article/edit/uploadcover/" + articleId,
    method: "post",
    timeout: 30000,
    data
  });
};

export const addEmptyParagraph = async function(articleId: string) {
  return request({
    url: "/editorial/article/edit/addparagraph/" + articleId,
    method: "post"
  });
};

export const deleteParagraph = async function(articleId: string, paragraphId: string) {
  return request({
    url:
      "/editorial/article/edit/deleteparagraph/" +
      articleId +
      "/" +
      paragraphId,
    method: "delete"
  });
};

export const patchParagraph = async function(articleId: string, paragraphId: string, data: string) {
  return request({
    url: "/editorial/article/edit/paragraph/" + articleId + "/" + paragraphId,
    method: "patch",
    data
  });
};

export const deleteCoverImageFromArticle = async function(articleId: string) {
  return request({
    url: "/editorial/article/edit/deletecover/" + articleId,
    method: "delete"
  });
};

export const uploadParagraphImage = async function(
  articleId: string,
  paragraphId: string,
  data: any
) {
  return request({
    url:
      "/editorial/article/edit/paragraph/uploadimage/" +
      articleId +
      "/" +
      paragraphId,
    method: "post",
    data
  });
};
