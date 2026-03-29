import axios from 'axios';

// Um client Axios pré-configurado
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para simular delay e tratar erros globais provisoriamente
apiClient.interceptors.response.use(
  (response) => {
    // Adicionar um delay artificial para simular rede
    return new Promise((resolve) => setTimeout(() => resolve(response), 800));
  },
  (error) => {
    // Em produção: enviar para Sentry/Datadog
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
