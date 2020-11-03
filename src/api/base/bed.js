import axios from "@/libs/api.request";

export const getBedList = data => {
  return axios.request({
    url: "base/bed/list",
    method: "post",
    data
  });
};

export const getBedSelectAll = data => {
  return axios.request({
    url: "base/bed/selectall",
    method: "post",
    data
  });
};

export const createBed = data => {
  return axios.request({
    url: "base/bed/create",
    method: "post",
    data
  });
};

export const loadBed = data => {
  return axios.request({
    url: "base/bed/edit/" + data.id,
    method: "get"
  });
};

// edit hospital
export const editBed = data => {
  return axios.request({
    url: "base/bed/edit",
    method: "post",
    data
  });
};

// delete hospital
export const deleteBed = ids => {
  return axios.request({
    url: "base/bed/delete/" + ids,
    method: "get"
  });
};

// batch command
export const batchCommand = data => {
  return axios.request({
    url: "base/bed/batch",
    method: "get",
    params: data
  });
};
