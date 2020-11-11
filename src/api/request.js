import axios from 'axios';

const service = axios.create({
  baseURL: '', // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 50000 // request timeout
});

// response interceptor
service.interceptors.response.use(
  (response) => {
    const { status, data } = response;
    if (status === 200) return data;
    return Promise.reject(data.message || 'error');
  },
  (error) => {
    return Promise.reject(error);
  }
);

function createAPI(conf) {
  // eslint-disable-next-line no-param-reassign
  conf = conf || {};
  return service(Object.assign(
    {},
    {
      url: conf.url,
      method: conf.method,
      data: conf.data
    },
    conf.opts
  ));
}

export default createAPI;
