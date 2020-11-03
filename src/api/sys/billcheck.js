import axios from "@/libs/api.request";

export const getBillCheck = data => {
  return axios.request({
    url: "sys/billrecord/checklist",
    method: "post",
    data
  });
};

export const updateBillCheck = data => {
  return axios.request({
    url: "sys/billrecord/updatebillisconfirm",
    method: "post",
    data
  });
};

export const ExportExcel = data => {
  return axios.request({
    url: "sys/billrecord/exportExcelForCheck",
    data,
    method: "post"
  });
};
