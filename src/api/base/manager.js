import axios from "@/libs/api.request";

export const getManagerList = data => {
  return axios.request({
    url: "base/manager/list",
    method: "post",
    data
  });
};

export const getManagerSelect = data => {
  return axios.request({
    url: "base/manager/select",
    method: "post",
    data
  });
};

export const getManagerSelectAll = data => {
  return axios.request({
    url: "base/manager/selectall",
    method: "post",
    data
  });
};

export const createManager = data => {
  return axios.request({
    url: "base/manager/create",
    method: "post",
    data
  });
};

export const loadManager = data => {
  return axios.request({
    url: "base/manager/edit/" + data.id,
    method: "get"
  });
};

// edit hospital
export const editManager = data => {
  return axios.request({
    url: "base/manager/edit",
    method: "post",
    data
  });
};

// delete hospital
export const deleteManager = ids => {
  return axios.request({
    url: "base/manager/delete/" + ids,
    method: "get"
  });
};

// batch command
export const batchCommand = data => {
  return axios.request({
    url: "base/manager/batch",
    method: "get",
    params: data
  });
};

export const resetManagerAppPwd = ids => {
  return axios.request({
    url: "base/manager/reset/" + ids,
    method: "get"
  });
};
