import api from '@/lib/api';
import { User } from '@/types/api';

const getUserById = async (userId: number): Promise<User> => {
  const { data } = await api.get(`/api/auth/users/${userId}`);
  return data;
};

const userService = {
  getUserById,
};

export default userService;
