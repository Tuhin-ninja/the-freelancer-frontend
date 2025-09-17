import api from '@/lib/api';
import { Contract } from '@/types/api';

const createContract = async (contractData: any): Promise<Contract> => {
  const { data } = await api.post('/api/contracts', contractData);
  return data;
};

const contractService = {
  createContract,
};

export default contractService;
