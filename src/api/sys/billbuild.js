import axios from "@/libs/api.request";

export const getBillBuild = data => {
  return axios.request({
    url: "sys/billrecord/buildlist",
    method: "post",
    data
  });
};

export const updateBillBuild = data => {
  return axios.request({
    url: "sys/billrecord/updatebillisbuild",
    method: "post",
    data
  });
};
