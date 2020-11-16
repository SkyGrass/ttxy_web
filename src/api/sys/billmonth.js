import axios from "@/libs/api.request";

export const getMonthCollect = data => {
  return axios.request({
    url: "sys/billrecord/monthcollectlist",
    method: "post",
    data
  });
};

export const ExportExcel = data => {
  return axios.request({
    url: "sys/billrecord/exportExcelformonthcollect",
    data,
    method: "post"
  });
};
