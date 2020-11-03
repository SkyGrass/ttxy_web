import axios from "@/libs/api.request";

export const getPayWayList = data => {
  return axios.request({
    url: "base/payway/list",
    method: "post",
    data
  });
};

export const getPayWaySelectAll = data => {
  return axios.request({
    url: "base/payway/selectall",
    method: "post",
    data
  });
};

export const createPayWay = data => {
  return axios.request({
    url: "base/payway/create",
    method: "post",
    data
  });
};

export const loadPayWay = data => {
  return axios.request({
    url: "base/payway/edit/" + data.id,
    method: "get"
  });
};

// edit hospital
export const editPayWay = data => {
  return axios.request({
    url: "base/payway/edit",
    method: "post",
    data
  });
};

// delete hospital
export const deletePayWay = ids => {
  return axios.request({
    url: "base/payway/delete/" + ids,
    method: "get"
  });
};

// batch command
export const batchCommand = data => {
  return axios.request({
    url: "base/payway/batch",
    method: "get",
    params: data
  });
};
