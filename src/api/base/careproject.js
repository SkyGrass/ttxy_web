import axios from "@/libs/api.request";

export const getCareProjectList = data => {
  return axios.request({
    url: "base/careproject/list",
    method: "post",
    data
  });
};

export const getCareProjectTableList = data => {
  return axios.request({
    url: "base/careproject/tablelist",
    method: "post",
    data
  });
};

export const getCareProjectSelectAll = data => {
  return axios.request({
    url: "base/careproject/selectall",
    method: "post",
    data
  });
};

export const createCareProject = data => {
  return axios.request({
    url: "base/careproject/create",
    method: "post",
    data
  });
};

export const loadCareProject = data => {
  return axios.request({
    url: "base/careproject/edit/" + data.id,
    method: "get"
  });
};

// edit hospital
export const editCareProject = data => {
  return axios.request({
    url: "base/careproject/edit",
    method: "post",
    data
  });
};

// delete hospital
export const deleteCareProject = ids => {
  return axios.request({
    url: "base/careproject/delete/" + ids,
    method: "get"
  });
};

// batch command
export const batchCommand = data => {
  return axios.request({
    url: "base/careproject/batch",
    method: "get",
    params: data
  });
};
