import axios from "@/libs/api.request";

export const getHospitalList = data => {
  return axios.request({
    url: "base/hospital/list",
    method: "post",
    data
  });
};

export const getHospitalSelect = data => {
  return axios.request({
    url: "base/hospital/select",
    method: "post",
    data
  });
};

export const createHospital = data => {
  return axios.request({
    url: "base/hospital/create",
    method: "post",
    data
  });
};

export const loadHospital = data => {
  return axios.request({
    url: "base/hospital/edit/" + data.id,
    method: "get"
  });
};

// edit hospital
export const editHospital = data => {
  return axios.request({
    url: "base/hospital/edit",
    method: "post",
    data
  });
};

// delete hospital
export const deleteHospital = ids => {
  return axios.request({
    url: "base/hospital/delete/" + ids,
    method: "get"
  });
};

// batch command
export const batchCommand = data => {
  return axios.request({
    url: "base/hospital/batch",
    method: "get",
    params: data
  });
};
