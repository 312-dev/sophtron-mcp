import axios from "axios";
import { AxiosInstance } from "axios";

export default class HttpClient {
  httpInstance: AxiosInstance;

  constructor() {
    this.httpInstance = axios.create({
      timeout: 30000,
    });
  }

  async get(url: string, headers: any) {
    try {
      const response = await this.httpInstance.get(url, { headers });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`API error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  async post(url: string, data: any, headers: any) {
    try {
      const response = await this.httpInstance.post(url, data, { headers });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`API error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  async put(url: string, data: any, headers: any) {
    try {
      const response = await this.httpInstance.put(url, data, { headers });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`API error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  async del(url: string, headers: any) {
    try {
      const response = await this.httpInstance.delete(url, { headers });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`API error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }
}
