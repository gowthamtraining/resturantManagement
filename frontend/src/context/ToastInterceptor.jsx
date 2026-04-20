import { useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const ToastInterceptor = ({ children }) => {
  const { addToast } = useToast();

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const message = error.response?.data?.message || 'Something went wrong';
        addToast(message, 'error');
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, [addToast]);

  return children;
};

export default ToastInterceptor;
