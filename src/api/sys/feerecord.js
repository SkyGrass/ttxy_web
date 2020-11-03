import axios from "@/libs/api.request";

export const getFeeRecord = data => {
  return axios.request({
    url: "sys/billrecord/feelist",
    method: "post",
    data
  });
};

export const getFeeSummaryRecord = data => {
  return axios.request({
    url: "sys/billrecord/feesummarylist",
    method: "post",
    data
  });
};

export const ExportExcel = data => {
  return axios.request({
    url: "sys/billrecord/exportExcelForFee",
    data,
    method: "post"
  });
};
