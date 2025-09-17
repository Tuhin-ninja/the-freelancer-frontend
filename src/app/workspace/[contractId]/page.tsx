'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Briefcase, FileText, DollarSign, Info, Zap, Upload, Download, File, Trash2, Eye } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import fileService, { WorkspaceFile } from '@/services/file';
import workspaceService from '@/services/workspace';
import { toast } from 'react-hot-toast';

const WorkspacePage = () => {
    const params = useParams();
    const contractId = params.contractId as string;
    const [activeTab, setActiveTab] = useState('details');
    const { user } = useAppSelector((state) => state.auth);
    const [files, setFiles] = useState<WorkspaceFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [roomId, setRoomId] = useState<string | null>(null);

    useEffect(() => {
        const fetchWorkspace = async () => {
            if (contractId) {
                try {
                    const workspace = await workspaceService.getWorkspaceByContractId(contractId);
                    setRoomId(workspace.roomId);
                } catch (error) {
                    console.error('Error fetching workspace details:', error);
                    toast.error('Failed to load workspace details.');
                }
            }
        };
        fetchWorkspace();
    }, [contractId]);

    useEffect(() => {
        if (activeTab === 'files' && roomId) {
            fetchFiles();
        }
    }, [activeTab, roomId]);

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

    const handleFileDownload = async (file: WorkspaceFile) => {
        try {
            await fileService.downloadFile(file.id);
            toast.success(`${file.fileName} downloaded successfully!`);
        } catch (error) {
            console.error('Error downloading file:', error);
            toast.error('Failed to download file');
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
        { id: 'files', label: 'Files', icon: FileText },
        { id: 'payment', label: 'Payment', icon: DollarSign },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'details':
                return <div className="prose max-w-none"><h2 className="text-gray-800">Contract Details</h2><p className="text-gray-600">Details about the contract with ID: {contractId} will be shown here. This includes the scope of work, timelines, and agreed terms.</p></div>;
            case 'messages':
                return <div className="prose max-w-none"><h2 className="text-gray-800">Messages</h2><p className="text-gray-600">A real-time chat interface for communication between the client and the freelancer will be implemented here.</p></div>;
            case 'tasks':
                return <div className="prose max-w-none"><h2 className="text-gray-800">Tasks & Deliverables</h2><p className="text-gray-600">A checklist or board for tracking project milestones, tasks, and deliverables.</p></div>;
            case 'files':
                return (
                    <div>
                        <h2 className="text-gray-800 text-2xl font-bold mb-6">Project Files</h2>
                        
                        {/* Upload Section - Only for Freelancers */}
                        {user?.role === 'freelancer' && (
                            <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-300">
                                <div className="text-center">
                                    <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload Project Files</h3>
                                    <p className="text-gray-600 mb-4">Share your work, drafts, and deliverables with the client</p>
                                    
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        multiple
                                        accept="*/*"
                                    />
                                    
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {uploading ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Uploading...
                                            </span>
                                        ) : (
                                            <span className="flex items-center">
                                                <Upload className="w-5 h-5 mr-2" />
                                                Choose Files
                                            </span>
                                        )}
                                    </button>
                                    <p className="text-sm text-gray-500 mt-2">Support all file types, max 50MB per file</p>
                                </div>
                            </div>
                        )}

                        {/* Files List */}
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
                                            <div className="flex items-center space-x-4 flex-1">
                                                <div className="text-2xl">
                                                    {getFileIcon(file.fileType)}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900 truncate">{file.fileName}</h4>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                                        <span>{formatFileSize(file.fileSize)}</span>
                                                        <span>•</span>
                                                        <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                                                        <span>•</span>
                                                        <span>by {file.uploadedBy === user?.id ? 'You' : 'Other user'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleFileDownload(file)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Download file"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </button>
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
