import api from '@/lib/api';

export interface PaymentRequest {
  jobId: number;
  amountCents: number;
  currency: string;
  paymentMethodId: string;
  clientEmail: string;
  clientName: string;
  description: string;
}

export interface PaymentResponse {
  id: string;
  status: 'succeeded' | 'pending' | 'failed';
  amountCents: number;
  currency: string;
  createdAt: string;
}

class PaymentService {
  // Fund escrow for a job
  async fundEscrow(paymentData: PaymentRequest): Promise<PaymentResponse> {
    console.log('funding with the data : ', paymentData);
    const response = await api.post('/api/payments/escrow/fund', paymentData);
    return response.data;
  }

  // Release payment to freelancer
  async releasePayment(jobId: number): Promise<PaymentResponse> {
    const response = await api.post(`/api/payments/escrow/release/${jobId}`);
    return response.data;
  }

  // Get payment history
  async getPaymentHistory(): Promise<PaymentResponse[]> {
    const response = await api.get('/api/payments/history');
    return response.data;
  }
}

const paymentService = new PaymentService();
export default paymentService;