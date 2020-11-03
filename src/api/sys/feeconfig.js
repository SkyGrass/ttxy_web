import axios from "@/libs/api.request";

export const loadFeeConfig = data => {
  return axios.request({
    url: "sys/feeconfig/find_list_by_hosid/" + data.id,
    method: "get"
  });
};

export const saveForm = data => {
  return axios.request({
    url: "sys/feeconfig/create",
    method: "post",
    data
  });
};
