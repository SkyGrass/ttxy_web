import axios from "@/libs/api.request";

export const getBillCalc = data => {
  return axios.request({
    url: "sys/billrecord/calclist",
    method: "post",
    data
  });
};

export const updateBillCalc = data => {
  return axios.request({
    url: "sys/billrecord/updatebillisfinish",
    method: "post",
    data
  });
};
