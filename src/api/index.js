import axios from 'axios';

const API = axios.create({ baseURL: 'https://polydub-backend-7707d66a10f4.herokuapp.com/api', headers:{
    'X-Requested-With': 'XMLHttpRequest'
    }
});

export const pointInfo = (content) => API.post(`/info`, content);
export const getAnswer = (message) => API.post(`/ask`, message);
// export const getProjects = (user_id) => API.get(`/users/${user_id}/projects`);