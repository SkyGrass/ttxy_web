import axios from "@/libs/api.request";

export const getPcList = data => {
  return axios.request({
    url: "base/pc/list",
    method: "post",
    data
  });
};

export const getPcSelectAll = data => {
  return axios.request({
    url: "base/pc/selectall",
    method: "post",
    data
  });
};

export const createPc = data => {
  return axios.request({
    url: "base/pc/create",
    method: "post",
    data
  });
};

export const loadPc = data => {
  return axios.request({
    url: "base/pc/edit/" + data.id,
    method: "get"
  });
};

// edit hospital
export const editPc = data => {
  return axios.request({
    url: "base/pc/edit",
    method: "post",
    data
  });
};

// delete hospital
export const deletePc = ids => {
  return axios.request({
    url: "base/pc/delete/" + ids,
    method: "get"
  });
};

// batch command
export const batchCommand = data => {
  return axios.request({
    url: "base/pc/batch",
    method: "get",
    params: data
  });
};
