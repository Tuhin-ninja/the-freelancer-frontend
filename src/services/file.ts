import api from '@/lib/api';

export interface WorkspaceFile {
  id: number;
  contractId: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: number;
  uploadedAt: string;
  fileType: string;
}

const uploadFile = async (roomId: string, file: File): Promise<WorkspaceFile> => {
  const formData = new FormData();
  formData.append('file', file);

  const config = {
    headers: {
      // Don't set Content-Type, let browser set it for multipart/form-data
    },
  };

  const { data } = await api.post(`/api/workspaces/rooms/${roomId}/files/multipart`, formData, config);
  return data;
};

const getContractFiles = async (roomId: string): Promise<WorkspaceFile[]> => {
  const { data } = await api.get(`/api/workspaces/rooms/${roomId}/files`);
  return data;
};

const downloadFile = async (fileId: number): Promise<void> => {
  const response = await api.get(`/api/workspaces/files/${fileId}/download`, {
    responseType: 'blob',
  });
  
  // Create blob link to download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  
  // Get filename from response headers or use a default
  const contentDisposition = response.headers['content-disposition'];
  let filename = `file-${fileId}`;
  if (contentDisposition) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(contentDisposition);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, '');
    }
  }
  
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const fileService = {
  uploadFile,
  getContractFiles,
  downloadFile,
};

export default fileService;
