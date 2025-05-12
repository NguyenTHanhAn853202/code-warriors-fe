import axios from 'axios';

const request = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    timeout: 50000,
    withCredentials: true,
});

export default request;