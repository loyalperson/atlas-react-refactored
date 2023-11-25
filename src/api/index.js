import axios from 'axios';

const API = axios.create({ baseURL: 'https://atlaspro-a6a906d6e540.herokuapp.com', headers:{
    'X-Requested-With': 'XMLHttpRequest'
    }
});

export const getResponse = (data) => API.post(`/get_response`, data);
// export const pointInfo = (content) => API.post(`/info`, content);