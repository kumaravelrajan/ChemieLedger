import request from "@/util/request";

export const registerUser = data =>
  request({ url: "/auth/register", method: "post", data });

export const loginUser = data =>
  request({ url: "/auth/login", method: "post", data });

export const changeProfile = data => {
  return request({ url: "/auth/profile", method: "patch", data });
};

export const resetPasswordRequest = data => {
  return request({ url: "/auth/resetRequest", method: "post", data });
};

export const sendNewVerificationEmail = () => {
  return request({ url: "/auth/sendNewVerificationEmail", method: "get"});
};

export const resetPassword = (data, token) => {
  return request({ url: "/auth/resetPassword", method: "post", data,
    headers: {
      Authorization: "Bearer " + token
    }
  });
};

export const verifyEmail = (token) => {
  return request({ url: "/auth/verifyEmail", method: "get",
    headers: {
      Authorization: "Bearer " + token
    }
  });
};
