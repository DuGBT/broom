import axios from "axios";

const baseUrl =
  "http://broom-testnet-694546364.ap-southeast-1.elb.amazonaws.com";

export const openAirDrop = (params) => {
  return axios.post(`${baseUrl}/broom/admin/open_broom_airdrop`, { ...params });
};
