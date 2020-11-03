import axios from "@/libs/api.request";

export const getPcFee = data => {
  return axios.request({
    url: "sys/billrecord/pcfeelist",
    method: "post",
    data
  });
};

export const ExportExcel = data => {
  return axios.request({
    url: "sys/billrecord/exportExcelForPcFee",
    data,
    method: "post"
  });
};
