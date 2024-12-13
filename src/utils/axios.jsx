import axios from 'axios';

const instance = axios.create({
  baseURL: "http://localhost:3000", // Set your API base URL here
});

// Optionally, you can add interceptors here for request/response handling

export default instance;
