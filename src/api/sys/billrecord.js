import axios from "@/libs/api.request";

export const getBillRecord = data => {
  return axios.request({
    url: "sys/billrecord/list",
    method: "post",
    data
  });
};

export const getBillDetail = data => {
  return axios.request({
    url: "sys/billrecord/find_detail_by_id/" + data,
    method: "get"
  });
};

export const getBillPriceDetail = data => {
  return axios.request({
    url: "sys/billrecord/find_detailprice_by_id/" + data,
    method: "get"
  });
};

export const getBillPersonDetail = data => {
  return axios.request({
    url: "sys/billrecord/find_detailperson_by_id/" + data,
    method: "get"
  });
};

export const getBillClientDetail = data => {
  return axios.request({
    url: "sys/billrecord/find_detailclient_by_id/" + data,
    method: "get"
  });
};

export const ExportExcel = data => {
  return axios.request({
    url: "sys/billrecord/exportExcel",
    data,
    method: "post"
  });
};

export const updateBillsStop = data => {
  return axios.request({
    url: "sys/billrecord/updatebillisstop",
    method: "post",
    data
  });
};
