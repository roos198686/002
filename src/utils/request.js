import axios from "axios";
import { BASE_URL } from "@/config/base";

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export default request;