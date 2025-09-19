import api from '@/lib/api';
import { Contract, ContractSubmission, ContractSubmissionRequest, ContractRejectRequest, ContractAcceptRequest } from '@/types/api';

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

// Contract submission methods
const submitContract = async (contractId: string, submissionData: ContractSubmissionRequest): Promise<ContractSubmission> => {
  const { data } = await api.post(`/api/contracts/${contractId}/submit`, submissionData);
  return data;
};

const acceptSubmission = async (contractId: string, acceptData?: ContractAcceptRequest): Promise<Contract> => {
  const { data } = await api.post(`/api/contracts/${contractId}/accept`, acceptData || {});
  return data;
};

const rejectSubmission = async (contractId: string, rejectData: ContractRejectRequest): Promise<Contract> => {
  const { data } = await api.post(`/api/contracts/${contractId}/reject`, rejectData);
  return data;
};

const getContractSubmission = async (contractId: string): Promise<ContractSubmission> => {
  const { data } = await api.get(`/api/contracts/${contractId}/submission`);
  return data;
};

const contractService = {
  createContract,
  getContractById,
  getMyContracts,
  submitContract,
  acceptSubmission,
  rejectSubmission,
  getContractSubmission,
};

export default contractService;
