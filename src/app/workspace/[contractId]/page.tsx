// 'use client';

// import React, { useState, useRef, useEffect } from 'react';
// import { useParams } from 'next/navigation';
// import { motion, AnimatePresence } from 'framer-motion';
// import { MessageSquare, Briefcase, FileText, DollarSign, Info, Zap, Upload, Download, File, Trash2, Eye } from 'lucide-react';
// import { useAppSelector } from '@/store/hooks';
// import fileService, { WorkspaceFile } from '@/services/file';
// import workspaceService from '@/services/workspace';
// import { toast } from 'react-hot-toast';

// const WorkspacePage = () => {
//     const params = useParams();
//     const contractId = params.contractId as string;
//     const [activeTab, setActiveTab] = useState('details');
//     const { user } = useAppSelector((state) => state.auth);
//     const [files, setFiles] = useState<WorkspaceFile[]>([]);
//     const [uploading, setUploading] = useState(false);
//     const fileInputRef = useRef<HTMLInputElement>(null);
//     const [roomId, setRoomId] = useState<string | null>(null);
//     const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

//     useEffect(() => {
//         const fetchWorkspace = async () => {
//             if (contractId) {
//                 try {
//                     const workspace = await workspaceService.getWorkspaceByContractId(contractId);
//                     console.log(workspace.id);
//                     setRoomId(workspace.id);
//                 } catch (error) {
//                     console.error('Error fetching workspace details:', error);
//                     toast.error('Failed to load workspace details.');
//                 }
//             }
//         };
//         fetchWorkspace();
//     }, [contractId]);

//     useEffect(() => {
//         if (activeTab === 'files' && roomId) {
//             fetchFiles(); 
//         }
//     }, [activeTab, roomId]);

//     const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const newFiles = event.target.files ? Array.from(event.target.files) : [];
//         if (newFiles.length === 0) return;

//         const allFiles = [...selectedFiles, ...newFiles];
//         setSelectedFiles(allFiles);

//         // Clear the file input for next selection
//         if (fileInputRef.current) {
//             fileInputRef.current.value = '';
//         }
//     };

//     const handleRemoveFile = (index: number) => {
//         setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
//     };

//     const handleUpload = async () => {
//         if (selectedFiles.length === 0) {
//             toast.error("Please select files to upload.");
//             return;
//         }
//         if (!roomId) {
//             toast.error("Workspace not loaded yet. Please wait.");
//             return;
//         }

//         setUploading(true);
//         try {
//             const uploadPromises = selectedFiles.map(file => 
//                 fileService.uploadFile(roomId, file)
//             );
            
//             const uploadedFiles = await Promise.all(uploadPromises);
            
//             setFiles(prev => [...prev, ...uploadedFiles]);
//             setSelectedFiles([]);
//             toast.success(`${uploadedFiles.length} file(s) uploaded successfully!`);

//         } catch (error) {
//             console.error('Error uploading files:', error);
//             toast.error('Failed to upload files. Please try again.');
//         } finally {
//             setUploading(false);
//         }
//     };

//     const fetchFiles = async () => {
//         if (!roomId) return;
//         try {
//             const contractFiles = await fileService.getContractFiles(roomId);
//             setFiles(contractFiles);
//         } catch (error) {
//             console.error('Error fetching files:', error);
//             toast.error('Failed to load files');
//         }
//     };

//     const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//         if (!roomId) {
//             toast.error("Workspace not loaded yet. Please wait.");
//             return;
//         }
//         const selectedFiles = event.target.files;
//         if (!selectedFiles || selectedFiles.length === 0) return;

//         setUploading(true);
//         try {
//             const uploadPromises = Array.from(selectedFiles).map(file => 
//                 fileService.uploadFile(roomId, file)
//             );
            
//             const uploadedFiles = await Promise.all(uploadPromises);
//             setFiles(prev => [...prev, ...uploadedFiles]);
//             toast.success(`${uploadedFiles.length} file(s) uploaded successfully!`);
            
//             // Clear the file input
//             if (fileInputRef.current) {
//                 fileInputRef.current.value = '';
//             }
//         } catch (error) {
//             console.error('Error uploading files:', error);
//             toast.error('Failed to upload files');
//         } finally {
//             setUploading(false);
//         }
//     };

//     const handleFileDownload = async (file: WorkspaceFile) => {
//         try {
//             // For local files, we use the anchor tag download.
//             // The real download service is for API-based downloads.
//             if (file.fileUrl.startsWith('blob:')) {
//                 const link = document.createElement('a');
//                 link.href = file.fileUrl;
//                 link.setAttribute('download', file.fileName);
//                 document.body.appendChild(link);
//                 link.click();
//                 document.body.removeChild(link);
//             } else {
//                 await fileService.downloadFile(file.id);
//             }
//             toast.success(`${file.fileName} downloaded successfully!`);
//         } catch (error) {
//             console.error('Error downloading file:', error);
//             toast.error('Failed to download file');
//         }
//     };

//     const formatFileSize = (bytes: number) => {
//         if (bytes === 0) return '0 Bytes';
//         const k = 1024;
//         const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//         const i = Math.floor(Math.log(bytes) / Math.log(k));
//         return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//     };

//     const getFileIcon = (fileType: string) => {
//         if (fileType.includes('image')) return '🖼️';
//         if (fileType.includes('pdf')) return '📄';
//         if (fileType.includes('video')) return '🎥';
//         if (fileType.includes('audio')) return '🎵';
//         if (fileType.includes('zip') || fileType.includes('rar')) return '🗜️';
//         return '📁';
//     };

//     const tabs = [
//         { id: 'details', label: 'Details', icon: Info },
//         { id: 'messages', label: 'Messages', icon: MessageSquare },
//         { id: 'tasks', label: 'Tasks', icon: Briefcase },
//         { id: 'files', label: 'Files', icon: FileText },
//         { id: 'payment', label: 'Payment', icon: DollarSign },
//     ];

//     const renderContent = () => {
//         switch (activeTab) {
//             case 'details':
//                 return <div className="prose max-w-none"><h2 className="text-gray-800">Contract Details</h2><p className="text-gray-600">Details about the contract with ID: {contractId} will be shown here. This includes the scope of work, timelines, and agreed terms.</p></div>;
//             case 'messages':
//                 return <div className="prose max-w-none"><h2 className="text-gray-800">Messages</h2><p className="text-gray-600">A real-time chat interface for communication between the client and the freelancer will be implemented here.</p></div>;
//             case 'tasks':
//                 return <div className="prose max-w-none"><h2 className="text-gray-800">Tasks & Deliverables</h2><p className="text-gray-600">A checklist or board for tracking project milestones, tasks, and deliverables.</p></div>;
//             case 'files':
//                 return (
//                     <div>
//                         <h2 className="text-gray-800 text-2xl font-bold mb-6">Project Files</h2>
                        
//                         {/* Upload Section - Only for Freelancers */}
//                         {user && (
//                             <div className="mb-8">
//                                 <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-300 text-center">
//                                     <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
//                                     <h3 className="text-lg font-semibold text-gray-800 mb-2">Select Files to Upload</h3>
//                                     <p className="text-gray-600 mb-4">You can select multiple files at once.</p>
                                    
//                                     <input
//                                         type="file"
//                                         ref={fileInputRef}
//                                         onChange={handleFileSelect}
//                                         className="hidden"
//                                         multiple
//                                         accept="*/*"
//                                     />
                                    
//                                     <button
//                                         onClick={() => fileInputRef.current?.click()}
//                                         className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
//                                     >
//                                         <span className="flex items-center">
//                                             <File className="w-5 h-5 mr-2" />
//                                             Choose Files
//                                         </span>
//                                     </button>
//                                 </div>

//                                 {selectedFiles.length > 0 && (
//                                     <div className="mt-6">
//                                         <h4 className="font-semibold text-gray-700 mb-3">Files to Upload ({selectedFiles.length})</h4>
//                                         <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
//                                             {selectedFiles.map((file, index) => (
//                                                 <motion.div
//                                                     key={index}
//                                                     initial={{ opacity: 0, x: -20 }}
//                                                     animate={{ opacity: 1, x: 0 }}
//                                                     className="flex items-center justify-between bg-gray-100 p-3 rounded-lg"
//                                                 >
//                                                     <div className="flex items-center space-x-3 flex-1 min-w-0">
//                                                         {file.type.startsWith('image/') ? (
//                                                             <img src={URL.createObjectURL(file)} alt="preview" className="w-10 h-10 rounded-md object-cover" />
//                                                         ) : (
//                                                             <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center">
//                                                                 <FileText className="w-5 h-5 text-gray-500" />
//                                                             </div>
//                                                         )}
//                                                         <div className="min-w-0 flex-1">
//                                                             <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
//                                                             <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
//                                                         </div>
//                                                     </div>
//                                                     <button onClick={() => handleRemoveFile(index)} className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100">
//                                                         <Trash2 className="w-4 h-4" />
//                                                     </button>
//                                                 </motion.div>
//                                             ))}
//                                         </div>
//                                         <button
//                                             onClick={handleUpload}
//                                             disabled={uploading}
//                                             className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//                                         >
//                                             {uploading ? (
//                                                 <>
//                                                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                                     </svg>
//                                                     Uploading...
//                                                 </>
//                                             ) : (
//                                                 <>
//                                                     <Upload className="w-5 h-5 mr-2" />
//                                                     Upload {selectedFiles.length} File(s)
//                                                 </>
//                                             )}
//                                         </button>
//                                     </div>
//                                 )}
//                             </div>
//                         )}

//                         {/* Files List */}
//                         <h3 className="text-xl font-bold text-gray-800 mb-4">Uploaded Files</h3>
//                         <div className="space-y-3">
//                             {files.length === 0 ? (
//                                 <div className="text-center py-12">
//                                     <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                                     <h3 className="text-lg font-medium text-gray-600 mb-2">No files uploaded yet</h3>
//                                     <p className="text-gray-500">
//                                         {user?.role === 'freelancer' 
//                                             ? 'Upload files to share your work with the client'
//                                             : 'The freelancer will upload project files here'
//                                         }
//                                     </p>
//                                 </div>
//                             ) : (
//                                 files.map((file) => (
//                                     <motion.div
//                                         key={file.id}
//                                         initial={{ opacity: 0, y: 10 }}
//                                         animate={{ opacity: 1, y: 0 }}
//                                         className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
//                                     >
//                                         <div className="flex items-center justify-between">
//                                             <div className="flex items-center space-x-4 flex-1 min-w-0">
//                                                 <div className="text-2xl">
//                                                     {file.contentType.startsWith('image/') ? (
//                                                         <img src={file.thumbnailUrl} alt={file.originalFilename} className="w-12 h-12 rounded-lg object-cover" />
//                                                     ) : (
//                                                         getFileIcon(file.contentType)
//                                                     )}
//                                                 </div>
//                                                 <div className="flex-1 min-w-0">
//                                                     <h4 className="font-medium text-gray-900 truncate">{file.originalFilename}</h4>
//                                                     <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
//                                                         <span>{formatFileSize(file.fileSize)}</span>
//                                                         <span>•</span>
//                                                         <span>{new Date(file.createdAt).toLocaleDateString()}</span>
//                                                         <span>•</span>
//                                                         <span>by {file.uploaderId === user?.id ? 'You' : 'Other user'}</span>
//                                                     </div>
//                                                 </div>
//                                             </div>
                                            
//                                             <div className="flex items-center space-x-2">
//                                                 <a
//                                                     href={file.url}
//                                                     download={file.originalFilename}
//                                                     target="_blank"
//                                                     rel="noopener noreferrer"
//                                                     className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                                                     title="Download file"
//                                                 >
//                                                     <Download className="w-5 h-5" />
//                                                 </a>
//                                             </div>
//                                         </div>
//                                     </motion.div>
//                                 ))
//                             )}
//                         </div>
//                     </div>
//                 );
//             case 'payment':
//                 return <div className="prose max-w-none"><h2 className="text-gray-800">Payment</h2><p className="text-gray-600">Details about payment schedules, escrow, and transaction history for the contract.</p></div>;
//             default:
//                 return null;
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-purple-100 p-4 sm:p-6 lg:p-8">
//             <motion.div 
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, ease: "easeOut" }}
//                 className="max-w-7xl mx-auto"
//             >
//                 {/* Header */}
//                 <div className="flex items-center justify-between mb-6">
//                     <div>
//                         <h1 className="text-4xl font-bold text-gray-800">Workspace</h1>
//                         <p className="text-gray-500 mt-1">Contract ID: {contractId}</p>
//                     </div>
//                     <div className="flex items-center space-x-2 p-2 px-4 bg-green-100 text-green-800 rounded-full text-sm font-semibold shadow-sm border border-green-200">
//                         <Zap className="w-5 h-5 text-green-600" />
//                         <span>Active Contract</span>
//                     </div>
//                 </div>

//                 {/* Tabs */}
//                 <div className="relative">
//                     <div className="flex border-b border-gray-200">
//                         {tabs.map((tab) => (
//                             <button
//                                 key={tab.id}
//                                 onClick={() => setActiveTab(tab.id)}
//                                 className={`${
//                                     activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
//                                 } relative flex items-center px-4 py-3 text-sm sm:text-base font-medium transition-colors duration-300 focus:outline-none`}
//                             >
//                                 <tab.icon className="w-5 h-5 mr-2" />
//                                 {tab.label}
//                                 {activeTab === tab.id && (
//                                     <motion.div
//                                         className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-600"
//                                         layoutId="underline"
//                                     />
//                                 )}
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Content */}
//                 <div className="mt-6">
//                     <AnimatePresence mode="wait">
//                         <motion.div
//                             key={activeTab}
//                             initial={{ y: 10, opacity: 0 }}
//                             animate={{ y: 0, opacity: 1 }}
//                             exit={{ y: -10, opacity: 0 }}
//                             transition={{ duration: 0.3 }}
//                             className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200/80"
//                         >
//                             {renderContent()}
//                         </motion.div>
//                     </AnimatePresence>
//                 </div>
//             </motion.div>
//         </div>
//     );
// };

// export default WorkspacePage;


'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { MessageSquare, Briefcase, FileText, DollarSign, Info, Zap, Upload, Download, File, Trash2, Eye, FileDown, Calendar, Clock, TrendingUp, Plus, X } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import fileService, { WorkspaceFile } from '@/services/file';
import workspaceService from '@/services/workspace';
import contractService from '@/services/contract';
import userService from '@/services/user';
import eventService, { Event } from '@/services/event';
import { User, Contract } from '@/types/api';
import { toast } from 'react-hot-toast';

const WorkspacePage = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    const contractId = params.contractId as string;
    
    // Extract proposal data from URL parameters
    const proposalAmount = searchParams.get('proposalAmount');
    const proposalId = searchParams.get('proposalId');
    
    const [activeTab, setActiveTab] = useState('details');
    const { user } = useAppSelector((state) => state.auth);
    const [files, setFiles] = useState<WorkspaceFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [workspace, setWorkspace] = useState<any>(null);
    const [contract, setContract] = useState<Contract | null>(null);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<Event[]>([]);
    const [showCreateEvent, setShowCreateEvent] = useState(false);
    const [eventForm, setEventForm] = useState({
        title: '',
        description: '',
        eventType: 'MEETING' as const,
        startTime: '',
        endTime: ''
    });

    // Now you can use proposalAmount and proposalId anywhere in your component
    useEffect(() => {
        if (proposalAmount) {
            console.log('Proposal Amount:', proposalAmount);
            // You can use this data as needed
        }
        if (proposalId) {
            console.log('Proposal ID:', proposalId);
            // You can use this data as needed
        }
    }, [proposalAmount, proposalId]);

    useEffect(() => {
        const fetchWorkspace = async () => {
            if (contractId) {
                try {
                    setLoading(true);
                    const [workspaceData, contractData] = await Promise.all([
                        workspaceService.getWorkspaceByContractId(contractId),
                        contractService.getContractById(contractId)
                    ]);
                    console.log('Workspace:', workspaceData);
                    console.log('Contract:', contractData);
                    setWorkspace(workspaceData);
                    setContract(contractData);
                    setRoomId(workspaceData.id);
                } catch (error) {
                    console.error('Error fetching workspace details:', error);
                    toast.error('Failed to load workspace details.');
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchWorkspace();
    }, [contractId]);

    const handleCreateEvent = async () => {
        if (!roomId || !eventForm.title || !eventForm.startTime || !eventForm.endTime) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            // Format dates to ISO string format
            const startTime = new Date(eventForm.startTime).toISOString();
            const endTime = new Date(eventForm.endTime).toISOString();

            const eventData = {
                roomId: parseInt(roomId),
                title: eventForm.title,
                description: eventForm.description,
                eventType: eventForm.eventType,
                startTime,
                endTime
            };

            // Use event service with proper authorization
            const newEvent = await eventService.createEvent(eventData);
            
            setEvents(prev => [...prev, newEvent]);
            setShowCreateEvent(false);
            setEventForm({
                title: '',
                description: '',
                eventType: 'MEETING' as const,
                startTime: '',
                endTime: ''
            });
            toast.success('Event created successfully!');
        } catch (error: any) {
            console.error('Error creating event:', error);
            toast.error(error.response?.data?.message || 'Failed to create event');
        }
    };

    const fetchEvents = async () => {
        if (!roomId) return;
        try {
            const eventList = await eventService.getEventsByRoomId(roomId);
            setEvents(eventList);
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Failed to load events');
        }
    };

    useEffect(() => {
        if (activeTab === 'events' && roomId) {
            fetchEvents();
        }
    }, [activeTab, roomId]);

    useEffect(() => {
        if (activeTab === 'files' && roomId) {
            fetchFiles(); 
        }
    }, [activeTab, roomId]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = event.target.files ? Array.from(event.target.files) : [];
        if (newFiles.length === 0) return;

        const allFiles = [...selectedFiles, ...newFiles];
        setSelectedFiles(allFiles);

        // Clear the file input for next selection
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveFile = (index: number) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            toast.error("Please select files to upload.");
            return;
        }
        if (!roomId) {
            toast.error("Workspace not loaded yet. Please wait.");
            return;
        }

        setUploading(true);
        try {
            const uploadPromises = selectedFiles.map(file => 
                fileService.uploadFile(roomId, file)
            );
            
            const uploadedFiles = await Promise.all(uploadPromises);
            
            setFiles(prev => [...prev, ...uploadedFiles]);
            setSelectedFiles([]);
            toast.success(`${uploadedFiles.length} file(s) uploaded successfully!`);

        } catch (error) {
            console.error('Error uploading files:', error);
            toast.error('Failed to upload files. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const fetchFiles = async () => {
        if (!roomId) return;
        try {
            const contractFiles = await fileService.getContractFiles(roomId);
            setFiles(contractFiles);
        } catch (error) {
            console.error('Error fetching files:', error);
            toast.error('Failed to load files');
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!roomId) {
            toast.error("Workspace not loaded yet. Please wait.");
            return;
        }
        const selectedFiles = event.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        setUploading(true);
        try {
            const uploadPromises = Array.from(selectedFiles).map(file => 
                fileService.uploadFile(roomId, file)
            );
            
            const uploadedFiles = await Promise.all(uploadPromises);
            setFiles(prev => [...prev, ...uploadedFiles]);
            toast.success(`${uploadedFiles.length} file(s) uploaded successfully!`);
            
            // Clear the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error uploading files:', error);
            toast.error('Failed to upload files');
        } finally {
            setUploading(false);
        }
    };


    const handleGenerateContractSummary = async () => {
        setIsGeneratingPDF(true);
        toast.loading('Generating PDF...');

        try {
            // 1. Fetch contract details
            const contract = await contractService.getContractById(contractId);

            // 2. Fetch client and freelancer details
            const [client, freelancer] = await Promise.all([
                userService.getUserById(contract.clientId),
                userService.getUserById(contract.freelancerId)
            ]);

            // 3. Generate PDF
            const doc = new jsPDF();

            // Set page margins
            const leftMargin = 20;
            const rightMargin = 190;
            const pageWidth = 210;
            const centerX = pageWidth / 2;

            // Header with background
            doc.setFillColor(37, 99, 235); // Blue background
            doc.rect(0, 0, 210, 35, 'F');
            
            // Title
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(28);
            doc.setFont('helvetica', 'bold');
            doc.text("CONTRACT SUMMARY", centerX, 22, { align: 'center' });

            // Reset text color
            doc.setTextColor(0, 0, 0);

            // Contract ID Badge
            doc.setFillColor(239, 246, 255);
            doc.roundedRect(leftMargin, 45, rightMargin - leftMargin, 15, 3, 3, 'F');
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            // doc.text(`Contract ID: #${contract.id}`, centerX, 55, { align: 'center' });

            let currentY = 75;

            // Contract Information Section
            doc.setFillColor(34, 197, 94); // Green
            doc.rect(leftMargin, currentY, rightMargin - leftMargin, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text("CONTRACT DETAILS", leftMargin + 5, currentY + 5);

            currentY += 20;
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);

            // Contract details with clean formatting
            const contractDetails = [
                { label: "Project Title:", value: contract.jobTitle },
                { label: "Status:", value: contract.status, 
                  color: contract.status === 'ACTIVE' ? [34, 197, 94] : [239, 68, 68] },
                { label: "Start Date:", value: new Date(contract.startDate).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                }) },
                { label: "End Date:", value: new Date(contract.endDate).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                }) },
                { label: "Total Amount:", value: `$${(proposalAmount || contract.totalAmountCents/100).toLocaleString('en-US', { 
                    minimumFractionDigits: 2 
                })}`, highlight: true }
            ];

            contractDetails.forEach(detail => {
                doc.setFont('helvetica', 'bold');
                if (detail.color) {
                    doc.setTextColor(detail.color[0], detail.color[1], detail.color[2]);
                } else {
                    doc.setTextColor(100, 100, 100);
                }
                doc.text(detail.label, leftMargin, currentY);
                
                doc.setFont('helvetica', detail.highlight ? 'bold' : 'normal');
                doc.setTextColor(0, 0, 0);
                if (detail.highlight) {
                    doc.setFillColor(255, 252, 179); // Light yellow background
                    doc.rect(leftMargin + 55, currentY - 4, 60, 8, 'F');
                }
                doc.text(detail.value, leftMargin + 57, currentY);
                currentY += 12;
            });

            currentY += 10;

            // Client Information Section
            doc.setFillColor(147, 51, 234); // Purple
            doc.rect(leftMargin, currentY, (rightMargin - leftMargin) / 2 - 5, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text("CLIENT", leftMargin + 5, currentY + 5);

            // Freelancer Information Section
            doc.setFillColor(236, 72, 153); // Pink
            doc.rect(leftMargin + (rightMargin - leftMargin) / 2 + 5, currentY, (rightMargin - leftMargin) / 2 - 5, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.text("FREELANCER", leftMargin + (rightMargin - leftMargin) / 2 + 10, currentY + 5);

            currentY += 20;

            // Client details (left column)
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);

            const clientDetails = [
                { label: "Name:", value: client.name },
                { label: "Email:", value: client.email },
                { label: "Country:", value: client.country || 'N/A' },
                { label: "Joined:", value: new Date(client.createdAt).toLocaleDateString() }
            ];

            let clientY = currentY;
            clientDetails.forEach(detail => {
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(100, 100, 100);
                doc.text(detail.label, leftMargin, clientY);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
                doc.text(detail.value, leftMargin, clientY + 6);
                clientY += 16;
            });

            // Freelancer details (right column)
            const freelancerDetails = [
                { label: "Name:", value: freelancer.name },
                { label: "Email:", value: freelancer.email },
                { label: "Country:", value: freelancer.country || 'N/A' },
                { label: "Joined:", value: new Date(freelancer.createdAt).toLocaleDateString() }
            ];

            let freelancerY = currentY;
            freelancerDetails.forEach(detail => {
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(100, 100, 100);
                doc.text(detail.label, leftMargin + (rightMargin - leftMargin) / 2 + 5, freelancerY);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
                doc.text(detail.value, leftMargin + (rightMargin - leftMargin) / 2 + 5, freelancerY + 6);
                freelancerY += 16;
            });

            currentY = Math.max(clientY, freelancerY) + 10;

            // Progress Section
            if (contract.totalMilestones > 0) {
                doc.setFillColor(245, 158, 11); // Orange
                doc.rect(leftMargin, currentY, rightMargin - leftMargin, 8, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text("PROJECT PROGRESS", leftMargin + 5, currentY + 5);

                currentY += 20;
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(11);

                const progressPercentage = Math.round((contract.completedMilestones / contract.totalMilestones) * 100);
                
                // Progress bar
                doc.setFillColor(229, 231, 235); // Gray background
                doc.roundedRect(leftMargin, currentY, rightMargin - leftMargin, 8, 2, 2, 'F');
                
                if (progressPercentage > 0) {
                    doc.setFillColor(34, 197, 94); // Green progress
                    const progressWidth = ((rightMargin - leftMargin) * progressPercentage) / 100;
                    doc.roundedRect(leftMargin, currentY, progressWidth, 8, 2, 2, 'F');
                }

                doc.setFont('helvetica', 'bold');
                doc.text(`${progressPercentage}% Complete`, centerX, currentY + 5, { align: 'center' });
                doc.setTextColor(255, 255, 255);

                currentY += 15;
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');
                doc.text(`${contract.completedMilestones} of ${contract.totalMilestones} milestones completed`, centerX, currentY, { align: 'center' });
                doc.text(`${contract.activeMilestones} milestones currently active`, centerX, currentY + 10, { align: 'center' });
            }

            // Footer
            currentY = 270;
            doc.setFillColor(249, 250, 251);
            doc.rect(0, currentY, 210, 27, 'F');
            doc.setTextColor(107, 114, 128);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', month: 'long', day: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
            })}`, centerX, currentY + 10, { align: 'center' });
            doc.text("FreelanceHub - Professional Contract Management", centerX, currentY + 18, { align: 'center' });

            doc.save(`contract-summary-${contractId}.pdf`);
            toast.dismiss();
            toast.success("Contract summary downloaded!");

        } catch (error) {
            console.error("Error generating contract summary:", error);
            toast.dismiss();
            toast.error("Failed to generate summary. Please try again.");
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.includes('image')) return '🖼️';
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('video')) return '🎥';
        if (fileType.includes('audio')) return '🎵';
        if (fileType.includes('zip') || fileType.includes('rar')) return '🗜️';
        return '📁';
    };

    const tabs = [
        { id: 'details', label: 'Details', icon: Info },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'tasks', label: 'Tasks', icon: Briefcase },
        { id: 'events', label: 'Events', icon: Calendar },
        { id: 'files', label: 'Files', icon: FileText },
        { id: 'payment', label: 'Payment', icon: DollarSign },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'details':
                if (loading) {
                    return (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        </div>
                    );
                }

                return (
                    <div className="space-y-8">
                        {/* Header Section with Job Title */}
                        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full transform -translate-x-12 translate-y-12"></div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="bg-white/20 p-3 rounded-xl">
                                                <Briefcase className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h1 className="text-2xl font-bold">
                                                    {contract?.jobTitle || workspace?.jobTitle || 'Project Workspace'}
                                                </h1>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-white/20 rounded-xl p-4">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <DollarSign className="w-5 h-5 text-green-200" />
                                                    <span className="text-sm text-blue-100">Project Value</span>
                                                </div>
                                                <div className="text-2xl font-bold">
                                                    ${proposalAmount ? Number(proposalAmount).toLocaleString() : 
                                                      contract?.totalAmountCents ? (contract.totalAmountCents).toLocaleString() : 'TBD'}
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white/20 rounded-xl p-4">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Calendar className="w-5 h-5 text-yellow-200" />
                                                    <span className="text-sm text-blue-100">Status</span>
                                                </div>
                                                <div className="text-xl font-bold">
                                                    {contract?.status || 'Active'}
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white/20 rounded-xl p-4">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Clock className="w-5 h-5 text-purple-200" />
                                                    <span className="text-sm text-blue-100">Timeline</span>
                                                </div>
                                                <div className="text-xl font-bold">
                                                    {contract?.startDate && contract?.endDate ? 
                                                        `${Math.ceil((new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / (1000 * 3600 * 24))} days` : 
                                                        'Ongoing'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={handleGenerateContractSummary}
                                        disabled={isGeneratingPDF}
                                        className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 backdrop-blur-sm border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isGeneratingPDF ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Generating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FileDown className="w-5 h-5" />
                                                <span>Generate Summary</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Contract Information Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Contract Details */}
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                        <div className="bg-green-500 p-2 rounded-lg mr-3">
                                            <FileText className="w-5 h-5 text-white" />
                                        </div>
                                        Contract Details
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    {contract?.startDate && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Start Date:</span>
                                            <span className="font-semibold text-gray-900">
                                                {new Date(contract.startDate).toLocaleDateString('en-US', { 
                                                    year: 'numeric', month: 'long', day: 'numeric' 
                                                })}
                                            </span>
                                        </div>
                                    )}
                                    {contract?.endDate && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">End Date:</span>
                                            <span className="font-semibold text-gray-900">
                                                {new Date(contract.endDate).toLocaleDateString('en-US', { 
                                                    year: 'numeric', month: 'long', day: 'numeric' 
                                                })}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Payment Model:</span>
                                        <span className="font-semibold text-gray-900 capitalize">
                                            {contract?.paymentModel || 'Fixed Price'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Currency:</span>
                                        <span className="font-semibold text-gray-900">
                                            {contract?.currency || 'USD'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Project Progress */}
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                        <div className="bg-blue-500 p-2 rounded-lg mr-3">
                                            <TrendingUp className="w-5 h-5 text-white" />
                                        </div>
                                        Project Progress
                                    </h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    {/* Progress Bar */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600">Overall Progress</span>
                                            <span className="font-bold text-blue-600">
                                                {contract?.totalMilestones ? 
                                                    Math.round((contract.completedMilestones / contract.totalMilestones) * 100) : 0}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div 
                                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                                                style={{ 
                                                    width: `${contract?.totalMilestones ? 
                                                        Math.round((contract.completedMilestones / contract.totalMilestones) * 100) : 0}%` 
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    
                                    {/* Milestones */}
                                    {contract?.totalMilestones && (
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {contract.completedMilestones}
                                                </div>
                                                <div className="text-sm text-gray-600">Completed</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {contract.activeMilestones}
                                                </div>
                                                <div className="text-sm text-gray-600">Active</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-600">
                                                    {contract.totalMilestones}
                                                </div>
                                                <div className="text-sm text-gray-600">Total</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        {contract?.termsJson && (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                        <div className="bg-purple-500 p-2 rounded-lg mr-3">
                                            <Info className="w-5 h-5 text-white" />
                                        </div>
                                        Terms & Scope
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="prose max-w-none text-gray-700">
                                        {(() => {
                                            try {
                                                const terms = JSON.parse(contract.termsJson);
                                                return (
                                                    <div className="space-y-4">
                                                        {terms.scope && (
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900 mb-2">Project Scope:</h4>
                                                                <p>{terms.scope}</p>
                                                            </div>
                                                        )}
                                                        {terms.timeline && (
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900 mb-2">Timeline:</h4>
                                                                <p>{terms.timeline}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            } catch {
                                                return <p>Contract terms and project scope will be displayed here.</p>;
                                            }
                                        })()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'messages':
                return <div className="prose max-w-none"><h2 className="text-gray-800">Messages</h2><p className="text-gray-600">A real-time chat interface for communication between the client and the freelancer will be implemented here.</p></div>;
            case 'tasks':
                return <div className="prose max-w-none"><h2 className="text-gray-800">Tasks & Deliverables</h2><p className="text-gray-600">A checklist or board for tracking project milestones, tasks, and deliverables.</p></div>;
            case 'files':
                return (
                    <div>
                        <h2 className="text-gray-800 text-2xl font-bold mb-6">Project Files</h2>
                        
                        {/* Upload Section - Only for Freelancers */}
                        {user && (
                            <div className="mb-8">
                                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-300 text-center">
                                    <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Select Files to Upload</h3>
                                    <p className="text-gray-600 mb-4">You can select multiple files at once.</p>
                                    
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        multiple
                                        accept="*/*"
                                    />
                                    
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                    >
                                        <span className="flex items-center">
                                            <File className="w-5 h-5 mr-2" />
                                            Choose Files
                                        </span>
                                    </button>
                                </div>

                                {selectedFiles.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="font-semibold text-gray-700 mb-3">Files to Upload ({selectedFiles.length})</h4>
                                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                            {selectedFiles.map((file, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="flex items-center justify-between bg-gray-100 p-3 rounded-lg"
                                                >
                                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                        {file.type.startsWith('image/') ? (
                                                            <img src={URL.createObjectURL(file)} alt="preview" className="w-10 h-10 rounded-md object-cover" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center">
                                                                <FileText className="w-5 h-5 text-gray-500" />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                                                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleRemoveFile(index)} className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={handleUpload}
                                            disabled={uploading}
                                            className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        >
                                            {uploading ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-5 h-5 mr-2" />
                                                    Upload {selectedFiles.length} File(s)
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Files List */}
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Uploaded Files</h3>
                        <div className="space-y-3">
                            {files.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-600 mb-2">No files uploaded yet</h3>
                                    <p className="text-gray-500">
                                        {user?.role === 'freelancer' 
                                            ? 'Upload files to share your work with the client'
                                            : 'The freelancer will upload project files here'
                                        }
                                    </p>
                                </div>
                            ) : (
                                files.map((file) => (
                                    <motion.div
                                        key={file.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                                                <div className="text-2xl">
                                                    {file.contentType.startsWith('image/') ? (
                                                        <img src={file.thumbnailUrl} alt={file.originalFilename} className="w-12 h-12 rounded-lg object-cover" />
                                                    ) : (
                                                        getFileIcon(file.contentType)
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900 truncate">{file.originalFilename}</h4>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                                        <span>{formatFileSize(file.fileSize)}</span>
                                                        <span>•</span>
                                                        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                                        <span>•</span>
                                                        <span>by {file.uploaderId === user?.id ? 'You' : 'Other user'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-2">
                                                <a
                                                    href={file.url}
                                                    download={file.originalFilename}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Download file"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </a>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                );
            case 'events':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Project Events</h2>
                            <button
                                onClick={() => setShowCreateEvent(true)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Create Event</span>
                            </button>
                        </div>

                        {/* Create Event Modal */}
                        {showCreateEvent && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-gray-100"
                                >
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-1">Create New Event</h3>
                                            <p className="text-gray-600 text-sm">Schedule a meeting, deadline, or milestone</p>
                                        </div>
                                        <button
                                            onClick={() => setShowCreateEvent(false)}
                                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                                Event Title *
                                            </label>
                                            <input
                                                type="text"
                                                value={eventForm.title}
                                                onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                                                className="w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 placeholder-gray-500"
                                                placeholder="e.g., Project Kickoff Meeting"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                                Description
                                            </label>
                                            <textarea
                                                value={eventForm.description}
                                                onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                                                className="w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 placeholder-gray-500 resize-none"
                                                rows={3}
                                                placeholder="Brief description of the event..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                                Event Type
                                            </label>
                                            <select
                                                value={eventForm.eventType}
                                                onChange={(e) => setEventForm(prev => ({ ...prev, eventType: e.target.value as any }))}
                                                className="w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                                            >
                                                <option value="MEETING">📅 Meeting</option>
                                                <option value="DEADLINE">⏰ Deadline</option>
                                                <option value="MILESTONE">🎯 Milestone</option>
                                                <option value="REVIEW">👥 Review</option>
                                                <option value="OTHER">📋 Other</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-900 mb-3">
                                                    Start Time *
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    value={eventForm.startTime}
                                                    onChange={(e) => setEventForm(prev => ({ ...prev, startTime: e.target.value }))}
                                                    className="w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-900 mb-3">
                                                    End Time *
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    value={eventForm.endTime}
                                                    onChange={(e) => setEventForm(prev => ({ ...prev, endTime: e.target.value }))}
                                                    className="w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex space-x-4 mt-8">
                                        <button
                                            onClick={() => setShowCreateEvent(false)}
                                            className="flex-1 px-6 py-3 text-gray-700 font-semibold bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 hover:border-gray-400 transition-all duration-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreateEvent}
                                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
                                        >
                                            <Plus className="w-5 h-5" />
                                            <span>Create Event</span>
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Events List */}
                        <div className="space-y-4">
                            {events.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-600 mb-2">No events scheduled</h3>
                                    <p className="text-gray-500 mb-6">
                                        Create your first event to schedule meetings, deadlines, or milestones.
                                    </p>
                                    <button
                                        onClick={() => setShowCreateEvent(true)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                    >
                                        Create First Event
                                    </button>
                                </div>
                            ) : (
                                events.map((event, index) => (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <div className={`p-2 rounded-lg ${
                                                            event.eventType === 'MEETING' ? 'bg-blue-100 text-blue-600' :
                                                            event.eventType === 'DEADLINE' ? 'bg-red-100 text-red-600' :
                                                            event.eventType === 'MILESTONE' ? 'bg-green-100 text-green-600' :
                                                            event.eventType === 'REVIEW' ? 'bg-purple-100 text-purple-600' :
                                                            'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            <Calendar className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                                                event.eventType === 'MEETING' ? 'bg-blue-100 text-blue-800' :
                                                                event.eventType === 'DEADLINE' ? 'bg-red-100 text-red-800' :
                                                                event.eventType === 'MILESTONE' ? 'bg-green-100 text-green-800' :
                                                                event.eventType === 'REVIEW' ? 'bg-purple-100 text-purple-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {event.eventType}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    {event.description && (
                                                        <p className="text-gray-600 mb-4">{event.description}</p>
                                                    )}
                                                    
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="w-4 h-4" />
                                                            <span>
                                                                {new Date(event.startTime).toLocaleDateString()} at {new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                            </span>
                                                        </div>
                                                        <span>•</span>
                                                        <span>
                                                            Duration: {Math.round((new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / (1000 * 60))} mins
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                );
            case 'payment':
                return <div className="prose max-w-none"><h2 className="text-gray-800">Payment</h2><p className="text-gray-600">Details about payment schedules, escrow, and transaction history for the contract.</p></div>;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-purple-100 p-4 sm:p-6 lg:p-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-7xl mx-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">Workspace</h1>
                        <p className="text-gray-500 mt-1">Contract ID: {contractId}</p>
                    </div>
                    <div className="flex items-center space-x-2 p-2 px-4 bg-green-100 text-green-800 rounded-full text-sm font-semibold shadow-sm border border-green-200">
                        <Zap className="w-5 h-5 text-green-600" />
                        <span>Active Contract</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="relative">
                    <div className="flex border-b border-gray-200">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${
                                    activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                } relative flex items-center px-4 py-3 text-sm sm:text-base font-medium transition-colors duration-300 focus:outline-none`}
                            >
                                <tab.icon className="w-5 h-5 mr-2" />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-600"
                                        layoutId="underline"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="mt-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200/80"
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default WorkspacePage;
