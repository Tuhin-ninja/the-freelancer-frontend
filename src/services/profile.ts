import api from '@/lib/api';
import { User } from '@/types/api';

export const updateProfilePicture = async (file: File): Promise<User> => {
  const formData = new FormData();
  formData.append('file', file);

  // When sending FormData, the browser automatically sets the Content-Type header.
  // We need to remove the default 'application/json' header from our axios instance.
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  const { data } = await api.post('/api/profiles/profile-picture', formData, config);
  return data;
};

export const getProfile = async (userId: string): Promise<any> => {
  const { data } = await api.get(`/api/profiles/${userId}`);
  return data;
};
