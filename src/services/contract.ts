import api from '@/lib/api';
import { Contract } from '@/types/api';

const createContract = async (contractData: any): Promise<Contract> => {
  const { data } = await api.post('/api/contracts', contractData);
  return data;
};

const getContractById = async (contractId: string): Promise<Contract> => {
  const { data } = await api.get(`/api/contracts/${contractId}`);
  return data;
};

const getMyContracts = async (): Promise<Contract[]> => {
  const { data } = await api.get('/api/contracts/my-contracts');
  return data;
};

const contractService = {
  createContract,
  getContractById,
  getMyContracts,
};

export default contractService;
