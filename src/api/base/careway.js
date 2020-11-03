import axios from "@/libs/api.request";

export const getCareWayList = data => {
  return axios.request({
    url: "base/careway/list",
    method: "post",
    data
  });
};

export const getCareWayTableList = data => {
  return axios.request({
    url: "base/careway/tablelist",
    method: "post",
    data
  });
};

export const getCareWaySelectAll = data => {
  return axios.request({
    url: "base/careway/selectall",
    method: "post",
    data
  });
};

export const createCareWay = data => {
  return axios.request({
    url: "base/careway/create",
    method: "post",
    data
  });
};

export const loadCareWay = data => {
  return axios.request({
    url: "base/careway/edit/" + data.id,
    method: "get"
  });
};

// edit hospital
export const editCareWay = data => {
  return axios.request({
    url: "base/careway/edit",
    method: "post",
    data
  });
};

// delete hospital
export const deleteCareWay = ids => {
  return axios.request({
    url: "base/careway/delete/" + ids,
    method: "get"
  });
};

// batch command
export const batchCommand = data => {
  return axios.request({
    url: "base/careway/batch",
    method: "get",
    params: data
  });
};
