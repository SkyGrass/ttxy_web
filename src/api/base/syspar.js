import axios from "@/libs/api.request";

export const getSysParSelect = data => {
    return axios.request({
      url: "base/syspar/select",
      method: "post",
      data
    });
  };