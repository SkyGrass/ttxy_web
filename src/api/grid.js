import axios from "@/libs/api.request";

export const getGridConfig = data => {
  return axios.request({
    url: "report/getGridConfig",
    method: "post",
    data
  });
};
