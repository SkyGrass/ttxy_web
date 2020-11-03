import axios from "@/libs/api.request";

export const getAreaList = data => {
  return axios.request({
    url: "base/area/list",
    method: "post",
    data
  });
};

export const getAreaSelect = data => {
  return axios.request({
    url: "base/area/select",
    method: "post",
    data
  });
};

export const getAreaSelectAll = data => {
  return axios.request({
    url: "base/area/selectall",
    method: "post",
    data
  });
};

export const createArea = data => {
  return axios.request({
    url: "base/area/create",
    method: "post",
    data
  });
};

export const loadArea = data => {
  return axios.request({
    url: "base/area/edit/" + data.id,
    method: "get"
  });
};

// edit hospital
export const editArea = data => {
  return axios.request({
    url: "base/area/edit",
    method: "post",
    data
  });
};

// delete hospital
export const deleteArea = ids => {
  return axios.request({
    url: "base/area/delete/" + ids,
    method: "get"
  });
};

// batch command
export const batchCommand = data => {
  return axios.request({
    url: "base/area/batch",
    method: "get",
    params: data
  });
};
