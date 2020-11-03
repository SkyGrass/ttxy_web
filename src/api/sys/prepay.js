import axios from "@/libs/api.request";

export const getPrepay = data => {
  return axios.request({
    url: "sys/billrecord/prepaylist",
    method: "post",
    data
  });
};

export const ExportExcel = data => {
  return axios.request({
    url: "sys/billrecord/exportExcelForPrepay",
    data,
    method: "post"
  });
};
