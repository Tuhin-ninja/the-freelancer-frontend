'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { MessageSquare, Briefcase, FileText, DollarSign, Info, Zap, Upload, Download, File, Trash2, Eye, FileDown, Calendar, Clock, TrendingUp, Plus, X, CheckCircle, AlertCircle, Circle, Search, SortAsc, Send, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import fileService, { WorkspaceFile } from '@/services/file';
import workspaceService from '@/services/workspace';
import contractService from '@/services/contract';
import userService from '@/services/user';
import eventService, { Event } from '@/services/event';
import taskService from '@/services/task';
import { Contract, Task, TaskCreate, ContractSubmission } from '@/types/api';
import { toast } from 'react-hot-toast';

interface ApiError {
    response?: {
        status?: number;
        data?: {
            message?: string;
        };
    };
}

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
    const [eventForm, setEventForm] = useState<{
        title: string;
        description: string;
        eventType: 'MEETING' | 'DEADLINE' | 'MILESTONE' | 'REVIEW';
        startTime: string;
        endTime: string;
    }>({
        title: '',
        description: '',
        eventType: 'MEETING',
        startTime: '',
        endTime: ''
    });
    
    // Task-related state
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [taskForm, setTaskForm] = useState<{
        title: string;
        description: string;
        priority: 'LOW' | 'MEDIUM' | 'HIGH';
        assigneeId: number;
        dueDate: string;
    }>({
        title: '',
        description: '',
        priority: 'MEDIUM',
        assigneeId: 0,
        dueDate: ''
    });

    // Task filtering and search state
    const [taskSearchQuery, setTaskSearchQuery] = useState('');
    const [taskStatusFilter, setTaskStatusFilter] = useState<string>('ALL');
    const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>('ALL');
    const [taskSortBy, setTaskSortBy] = useState<'created' | 'dueDate' | 'priority' | 'title'>('created');

    // Contract submission state
    const [submission, setSubmission] = useState<ContractSubmission | null>(null);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [showSubmissionForm, setShowSubmissionForm] = useState(false);
    const [submissionForm, setSubmissionForm] = useState({
        description: '',
        deliverableUrls: [] as string[],
        notes: ''
    });
    const [submittingContract, setSubmittingContract] = useState(false);
    const [reviewingSubmission, setReviewingSubmission] = useState<number | null>(null);

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
        } catch (error: unknown) {
            console.error('Error creating event:', error);
            const errorMessage = (error as ApiError)?.response?.data?.message || 'Failed to create event';
            toast.error(errorMessage);
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

    // Task management functions
    const fetchTasks = async () => {
        if (!roomId) return;
        setLoadingTasks(true);
        try {
            const taskListResponse = await taskService.getTasksByRoomId(roomId);
            setTasks(taskListResponse.tasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast.error('Failed to load tasks');
        } finally {
            setLoadingTasks(false);
        }
    };

    const handleCreateTask = async () => {
        if (!roomId || !taskForm.title) {
            toast.error('Please fill in the required fields');
            return;
        }

        try {
            const taskData: TaskCreate = {
                title: taskForm.title,
                description: taskForm.description,
                priority: taskForm.priority,
                assigneeId: taskForm.assigneeId || user?.id || 0,
                dueDate: taskForm.dueDate
            };

            const newTask = await taskService.createTask(roomId, taskData);
            setTasks(prev => [...prev, newTask]);
            setShowCreateTask(false);
            setTaskForm({
                title: '',
                description: '',
                priority: 'MEDIUM',
                assigneeId: 0,
                dueDate: ''
            });
            toast.success('Task created successfully!');
        } catch (error: unknown) {
            console.error('Error creating task:', error);
            const errorMessage = (error as ApiError)?.response?.data?.message || 'Failed to create task';
            toast.error(errorMessage);
        }
    };

    const handleUpdateTaskStatus = async (taskId: number, status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE') => {
        if (!roomId) return;
        try {
            const updatedTask = await taskService.updateTaskStatus(roomId, taskId, status);
            setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
            toast.success('Task status updated successfully!');
        } catch (error: unknown) {
            console.error('Error updating task status:', error);
            const errorMessage = (error as ApiError)?.response?.data?.message || 'Failed to update task status';
            toast.error(errorMessage);
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        if (!roomId) return;
        
        try {
            await taskService.deleteTask(roomId, taskId);
            setTasks(prev => prev.filter(task => task.id !== taskId));
            toast.success('Task deleted successfully!');
        } catch (error: unknown) {
            console.error('Error deleting task:', error);
            const errorMessage = (error as ApiError)?.response?.data?.message || 'Failed to delete task';
            toast.error(errorMessage);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return 'text-red-700 bg-red-100 border-red-200';
            case 'MEDIUM': return 'text-amber-700 bg-amber-100 border-amber-200';
            case 'LOW': return 'text-emerald-700 bg-emerald-100 border-emerald-200';
            default: return 'text-gray-700 bg-gray-100 border-gray-200';
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'HIGH': return <TrendingUp className="w-4 h-4 text-red-600" />;
            case 'MEDIUM': return <AlertCircle className="w-4 h-4 text-amber-600" />;
            case 'LOW': return <Circle className="w-4 h-4 text-emerald-600" />;
            default: return <Circle className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'DONE': return <CheckCircle className="w-6 h-6 text-green-600" />;
            case 'IN_PROGRESS': return <AlertCircle className="w-6 h-6 text-blue-600" />;
            case 'IN_REVIEW': return <Eye className="w-6 h-6 text-purple-600" />;
            case 'TODO': return <Circle className="w-6 h-6 text-gray-500" />;
            default: return <Circle className="w-6 h-6 text-gray-500" />;
        }
    };

    const getStatusProgress = (status: string) => {
        switch (status) {
            case 'TODO': return 0;
            case 'IN_PROGRESS': return 50;
            case 'IN_REVIEW': return 75;
            case 'DONE': return 100;
            default: return 0;
        }
    };

    // Filter and sort tasks
    const filteredAndSortedTasks = React.useMemo(() => {
        const filtered = tasks.filter(task => {
            // Search filter
            const matchesSearch = taskSearchQuery === '' || 
                task.title.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
                (task.description && task.description.toLowerCase().includes(taskSearchQuery.toLowerCase()));
            
            // Status filter
            const matchesStatus = taskStatusFilter === 'ALL' || task.status === taskStatusFilter;
            
            // Priority filter
            const matchesPriority = taskPriorityFilter === 'ALL' || task.priority === taskPriorityFilter;
            
            return matchesSearch && matchesStatus && matchesPriority;
        });

        // Sort tasks
        filtered.sort((a, b) => {
            switch (taskSortBy) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'priority':
                    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
                    return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
                case 'dueDate':
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                case 'created':
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

        return filtered;
    }, [tasks, taskSearchQuery, taskStatusFilter, taskPriorityFilter, taskSortBy]);

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

    useEffect(() => {
        if (activeTab === 'tasks' && roomId) {
            fetchTasks();
        }
    }, [activeTab, roomId]);

    const fetchSubmissions = useCallback(async () => {
        if (!contractId) return;
        setLoadingSubmissions(true);
        try {
            const contractSubmission = await contractService.getContractSubmission(contractId);
            setSubmission(contractSubmission);
        } catch (error: unknown) {
            console.error('Error fetching submission:', error);
            // Don't show error for 404 - it means no submission exists yet
            if ((error as ApiError)?.response?.status !== 404) {
                toast.error('Failed to load submission');
            }
            setSubmission(null);
        } finally {
            setLoadingSubmissions(false);
        }
    }, [contractId]);

    useEffect(() => {
        if (activeTab === 'payment' && contractId) {
            fetchSubmissions();
        }
    }, [activeTab, contractId, fetchSubmissions]);

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

    const handleSubmitContract = async () => {
        if (!submissionForm.description.trim()) {
            toast.error('Please fill in the description field');
            return;
        }

        setSubmittingContract(true);
        try {
            const newSubmission = await contractService.submitContract(contractId, {
                description: submissionForm.description,
                deliverableUrls: submissionForm.deliverableUrls,
                notes: submissionForm.notes
            });
            
            setSubmission(newSubmission);
            setSubmissionForm({ description: '', deliverableUrls: [], notes: '' });
            setShowSubmissionForm(false);
            toast.success('Contract submitted successfully!');
        } catch (error) {
            console.error('Error submitting contract:', error);
            toast.error('Failed to submit contract');
        } finally {
            setSubmittingContract(false);
        }
    };

    const handleAcceptSubmission = async (feedback?: string) => {
        if (!submission) return;
        setReviewingSubmission(submission.id);
        try {
            await contractService.acceptSubmission(contractId, { feedback });
            setSubmission(prev => prev ? {
                ...prev,
                status: 'ACCEPTED',
                isAccepted: true,
                acceptedAt: new Date().toISOString(),
                feedback: feedback
            } : null);
            toast.success('Submission accepted successfully!');
        } catch (error) {
            console.error('Error accepting submission:', error);
            toast.error('Failed to accept submission');
        } finally {
            setReviewingSubmission(null);
        }
    };

    const handleRejectSubmission = async (feedback: string) => {
        if (!feedback.trim()) {
            toast.error('Please provide feedback for rejection');
            return;
        }
        if (!submission) return;

        setReviewingSubmission(submission.id);
        try {
            await contractService.rejectSubmission(contractId, { reason: 'Client feedback', feedback });
            setSubmission(prev => prev ? {
                ...prev,
                status: 'REJECTED',
                isRejected: true,
                rejectedAt: new Date().toISOString(),
                rejectionFeedback: feedback
            } : null);
            toast.success('Submission rejected with feedback');
        } catch (error) {
            console.error('Error rejecting submission:', error);
            toast.error('Failed to reject submission');
        } finally {
            setReviewingSubmission(null);
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
                return (
                    <div>
                        {/* Header with Create Button */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
                            <div>
                                <h2 className="text-gray-800 text-3xl font-bold mb-2">Tasks & Deliverables</h2>
                                <p className="text-gray-600">Manage and track project tasks efficiently</p>
                            </div>
                            <button
                                onClick={() => setShowCreateTask(true)}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Add New Task</span>
                            </button>
                        </div>

                        {/* Search and Filter Bar */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Search Input */}
                                <div className="lg:col-span-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Search tasks..."
                                            value={taskSearchQuery}
                                            onChange={(e) => setTaskSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                </div>
                                
                                {/* Status Filter */}
                                <div>
                                    <select
                                        value={taskStatusFilter}
                                        onChange={(e) => setTaskStatusFilter(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    >
                                        <option value="ALL">All Status</option>
                                        <option value="TODO">📋 To Do</option>
                                        <option value="IN_PROGRESS">⚡ In Progress</option>
                                        <option value="IN_REVIEW">👁️ In Review</option>
                                        <option value="DONE">✅ Done</option>
                                    </select>
                                </div>
                                
                                {/* Priority Filter */}
                                <div>
                                    <select
                                        value={taskPriorityFilter}
                                        onChange={(e) => setTaskPriorityFilter(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    >
                                        <option value="ALL">All Priority</option>
                                        <option value="HIGH">🔴 High</option>
                                        <option value="MEDIUM">🟡 Medium</option>
                                        <option value="LOW">🟢 Low</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Sort Options */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <SortAsc className="w-4 h-4" />
                                    <span>Sort by:</span>
                                </div>
                                <div className="flex space-x-2">
                                    {[
                                        { value: 'created', label: 'Created' },
                                        { value: 'dueDate', label: 'Due Date' },
                                        { value: 'priority', label: 'Priority' },
                                        { value: 'title', label: 'Title' }
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setTaskSortBy(option.value as 'created' | 'dueDate' | 'priority' | 'title')}
                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                                                taskSortBy === option.value
                                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Create Task Modal */}
                        {showCreateTask && (
                            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
                                >
                                    {/* Modal Header */}
                                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="bg-white/20 p-2 rounded-lg">
                                                    <Plus className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold">Create New Task</h3>
                                                    <p className="text-blue-100 text-sm">Add a new task to track your progress</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setShowCreateTask(false)}
                                                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Modal Body */}
                                    <div className="p-6 space-y-6">
                                        {/* Title Field */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Task Title <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={taskForm.title}
                                                onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                placeholder="e.g., Design user interface mockups"
                                            />
                                        </div>
                                        
                                        {/* Description Field */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">Description</label>
                                            <textarea
                                                value={taskForm.description}
                                                onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                                                rows={4}
                                                placeholder="Provide additional details about the task..."
                                            />
                                        </div>
                                        
                                        {/* Priority and Due Date Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Priority Level</label>
                                                <div className="relative">
                                                    <select
                                                        value={taskForm.priority}
                                                        onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' }))}
                                                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
                                                    >
                                                        <option value="LOW">🟢 Low Priority</option>
                                                        <option value="MEDIUM">🟡 Medium Priority</option>
                                                        <option value="HIGH">🔴 High Priority</option>
                                                    </select>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Due Date</label>
                                                <input
                                                    type="date"
                                                    value={taskForm.dueDate}
                                                    onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex space-x-3 pt-4 border-t border-gray-100">
                                            <button
                                                onClick={handleCreateTask}
                                                disabled={!taskForm.title.trim()}
                                                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                                <span>Create Task</span>
                                            </button>
                                            <button
                                                onClick={() => setShowCreateTask(false)}
                                                className="px-6 py-3 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl font-semibold transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {/* Tasks List */}
                        {loadingTasks ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                            </div>
                        ) : filteredAndSortedTasks.length === 0 ? (
                            <div className="text-center py-16">
                                {taskSearchQuery || taskStatusFilter !== 'ALL' || taskPriorityFilter !== 'ALL' ? (
                                    <div>
                                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                            <Search className="w-12 h-12 text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-3">No tasks match your criteria</h3>
                                        <p className="text-gray-500 mb-6 max-w-md mx-auto">Try adjusting your search terms or filters to find what you&apos;re looking for.</p>
                                        <button
                                            onClick={() => {
                                                setTaskSearchQuery('');
                                                setTaskStatusFilter('ALL');
                                                setTaskPriorityFilter('ALL');
                                            }}
                                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all inline-flex items-center space-x-2"
                                        >
                                            <X className="w-5 h-5" />
                                            <span>Clear Filters</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                            <Briefcase className="w-12 h-12 text-blue-500" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-3">No tasks created yet</h3>
                                        <p className="text-gray-500 mb-6 max-w-md mx-auto">Get started by creating your first task to track project deliverables and manage your workflow efficiently.</p>
                                        <button
                                            onClick={() => setShowCreateTask(true)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 inline-flex items-center space-x-2"
                                        >
                                            <Plus className="w-5 h-5" />
                                            <span>Create First Task</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Task Statistics */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-blue-600 text-sm font-medium">Total Tasks</p>
                                                <p className="text-2xl font-bold text-blue-800">{tasks.length}</p>
                                            </div>
                                            <div className="bg-blue-500 p-2 rounded-lg">
                                                <Briefcase className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-yellow-600 text-sm font-medium">In Progress</p>
                                                <p className="text-2xl font-bold text-yellow-800">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</p>
                                            </div>
                                            <div className="bg-yellow-500 p-2 rounded-lg">
                                                <AlertCircle className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-purple-600 text-sm font-medium">In Review</p>
                                                <p className="text-2xl font-bold text-purple-800">{tasks.filter(t => t.status === 'IN_REVIEW').length}</p>
                                            </div>
                                            <div className="bg-purple-500 p-2 rounded-lg">
                                                <Eye className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-green-600 text-sm font-medium">Completed</p>
                                                <p className="text-2xl font-bold text-green-800">{tasks.filter(t => t.status === 'DONE').length}</p>
                                            </div>
                                            <div className="bg-green-500 p-2 rounded-lg">
                                                <CheckCircle className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Results Count */}
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-gray-600">
                                        Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
                                    </p>
                                    {(taskSearchQuery || taskStatusFilter !== 'ALL' || taskPriorityFilter !== 'ALL') && (
                                        <button
                                            onClick={() => {
                                                setTaskSearchQuery('');
                                                setTaskStatusFilter('ALL');
                                                setTaskPriorityFilter('ALL');
                                            }}
                                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                        >
                                            <X className="w-4 h-4" />
                                            <span>Clear all filters</span>
                                        </button>
                                    )}
                                </div>

                                {/* Tasks Grid */}
                                <div className="grid gap-6">
                                    {filteredAndSortedTasks.map((task) => (
                                        <motion.div
                                            key={task.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                                        >
                                            {/* Task Header with Status Bar */}
                                            <div className={`h-2 ${
                                                task.status === 'DONE' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                                task.status === 'IN_PROGRESS' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                                                task.status === 'IN_REVIEW' ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                                                'bg-gradient-to-r from-gray-300 to-gray-400'
                                            }`}></div>
                                            
                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-3 mb-3">
                                                            <div className={`p-2 rounded-xl ${
                                                                task.status === 'DONE' ? 'bg-green-100' :
                                                                task.status === 'IN_PROGRESS' ? 'bg-blue-100' :
                                                                task.status === 'IN_REVIEW' ? 'bg-purple-100' :
                                                                'bg-gray-100'
                                                            }`}>
                                                                {getStatusIcon(task.status)}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{task.title}</h3>
                                                                <div className="flex items-center space-x-3">
                                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                                                                        {task.priority}
                                                                    </span>
                                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                                                        task.status === 'DONE' ? 'bg-green-100 text-green-800' :
                                                                        task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                                        task.status === 'IN_REVIEW' ? 'bg-purple-100 text-purple-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                        {task.status.replace('_', ' ')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {task.description && (
                                                            <p className="text-gray-600 leading-relaxed mb-4 bg-gray-50 p-3 rounded-lg">{task.description}</p>
                                                        )}
                                                        
                                                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                                                            {task.dueDate && (
                                                                <div className="flex items-center space-x-1">
                                                                    <Calendar className="w-4 h-4" />
                                                                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center space-x-1">
                                                                <Clock className="w-4 h-4" />
                                                                <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex flex-col space-y-3 ml-4">
                                                        {/* Status Update Dropdown */}
                                                        <select
                                                            value={task.status}
                                                            onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE')}
                                                            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                        >
                                                            <option value="TODO">📋 To Do</option>
                                                            <option value="IN_PROGRESS">⚡ In Progress</option>
                                                            <option value="IN_REVIEW">👁️ In Review</option>
                                                            <option value="DONE">✅ Done</option>
                                                        </select>
                                                        
                                                        <button
                                                            onClick={() => handleDeleteTask(task.id)}
                                                            className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                                                            title="Delete task"
                                                        >
                                                            <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
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
                                                onChange={(e) => setEventForm(prev => ({ ...prev, eventType: e.target.value as 'MEETING' | 'DEADLINE' | 'MILESTONE' | 'REVIEW' }))}
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
                return (
                    <div className="space-y-8">
                        {/* Header Section */}
                        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 rounded-2xl p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full transform -translate-x-12 translate-y-12"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="bg-white/20 p-3 rounded-xl">
                                        <DollarSign className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Contract Submissions</h2>
                                        <p className="text-green-100">Submit deliverables and manage project completion</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Freelancer Submission Form */}
                        {user && contract && user.id === contract.freelancerId && (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                            <div className="bg-blue-500 p-2 rounded-lg mr-3">
                                                <Send className="w-5 h-5 text-white" />
                                            </div>
                                            Submit Work
                                        </h3>
                                        {!showSubmissionForm && (
                                            <button
                                                onClick={() => setShowSubmissionForm(true)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span>New Submission</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {showSubmissionForm && (
                                    <div className="p-6">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Description <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    value={submissionForm.description}
                                                    onChange={(e) => setSubmissionForm(prev => ({ ...prev, description: e.target.value }))}
                                                    placeholder="Provide a detailed description of your work..."
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                    rows={4}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Deliverable URLs
                                                </label>
                                                <div className="space-y-2">
                                                    {submissionForm.deliverableUrls.map((url, index) => (
                                                        <div key={index} className="flex items-center space-x-2">
                                                            <input
                                                                type="url"
                                                                value={url}
                                                                onChange={(e) => {
                                                                    const newUrls = [...submissionForm.deliverableUrls];
                                                                    newUrls[index] = e.target.value;
                                                                    setSubmissionForm(prev => ({ ...prev, deliverableUrls: newUrls }));
                                                                }}
                                                                placeholder="https://example.com/deliverable"
                                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newUrls = submissionForm.deliverableUrls.filter((_, i) => i !== index);
                                                                    setSubmissionForm(prev => ({ ...prev, deliverableUrls: newUrls }));
                                                                }}
                                                                className="text-red-600 hover:text-red-700 p-2"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSubmissionForm(prev => ({ 
                                                                ...prev, 
                                                                deliverableUrls: [...prev.deliverableUrls, ''] 
                                                            }));
                                                        }}
                                                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        <span>Add URL</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Additional Notes
                                                </label>
                                                <textarea
                                                    value={submissionForm.notes}
                                                    onChange={(e) => setSubmissionForm(prev => ({ ...prev, notes: e.target.value }))}
                                                    placeholder="Any additional notes or comments..."
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="flex items-center space-x-4">
                                                <button
                                                    onClick={() => {
                                                        setShowSubmissionForm(false);
                                                        setSubmissionForm({ description: '', deliverableUrls: [], notes: '' });
                                                    }}
                                                    className="flex-1 px-6 py-3 text-gray-700 font-semibold bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 hover:border-gray-400 transition-all duration-200"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSubmitContract}
                                                    disabled={submittingContract || !submissionForm.description.trim()}
                                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {submittingContract ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                                            <span>Submitting...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send className="w-5 h-5" />
                                                            <span>Submit Work</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Submissions List */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                    <div className="bg-purple-500 p-2 rounded-lg mr-3">
                                        <FileText className="w-5 h-5 text-white" />
                                    </div>
                                    Submission Status
                                </h3>
                            </div>

                            <div className="p-6">
                                {loadingSubmissions ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                                    </div>
                                ) : !submission ? (
                                    <div className="text-center py-12">
                                        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">No submission yet</h3>
                                        <p className="text-gray-600">
                                            {user && contract && user.id === contract.freelancerId
                                                ? "Submit your first deliverable to get started."
                                                : "Waiting for freelancer to submit work."}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="border border-gray-200 rounded-xl overflow-hidden"
                                        >
                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        {/* Submission Status with Enhanced Information */}
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                                            <div className={`p-4 rounded-lg border-2 ${
                                                                submission.isSubmitted ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                                                            }`}>
                                                                <div className="flex items-center space-x-2 mb-2">
                                                                    {submission.isSubmitted ? (
                                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                                    ) : (
                                                                        <Circle className="w-5 h-5 text-gray-400" />
                                                                    )}
                                                                    <span className="font-semibold text-gray-900">Submitted</span>
                                                                </div>
                                                                <p className="text-sm text-gray-600">
                                                                    {submission.isSubmitted 
                                                                        ? new Date(submission.submittedAt).toLocaleDateString()
                                                                        : 'Not submitted'
                                                                    }
                                                                </p>
                                                            </div>

                                                            <div className={`p-4 rounded-lg border-2 ${
                                                                submission.isAccepted ? 'border-green-200 bg-green-50' : 
                                                                submission.isRejected ? 'border-red-200 bg-red-50' : 
                                                                'border-gray-200 bg-gray-50'
                                                            }`}>
                                                                <div className="flex items-center space-x-2 mb-2">
                                                                    {submission.isAccepted ? (
                                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                                    ) : submission.isRejected ? (
                                                                        <X className="w-5 h-5 text-red-600" />
                                                                    ) : (
                                                                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                                                                    )}
                                                                    <span className="font-semibold text-gray-900">Review Status</span>
                                                                </div>
                                                                <p className="text-sm text-gray-600">
                                                                    {submission.isAccepted ? 'Accepted' : 
                                                                     submission.isRejected ? 'Rejected' : 
                                                                     'Pending Review'}
                                                                </p>
                                                            </div>

                                                            <div className={`p-4 rounded-lg border-2 ${
                                                                submission.contractStatus === 'COMPLETED' ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                                                            }`}>
                                                                <div className="flex items-center space-x-2 mb-2">
                                                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                                                    <span className="font-semibold text-gray-900">Contract</span>
                                                                </div>
                                                                <p className="text-sm text-gray-600">
                                                                    {submission.contractStatus}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Project Information */}
                                                        <div className="mb-4">
                                                            <h4 className="font-semibold text-gray-900 mb-2">Project:</h4>
                                                            <p className="text-gray-700 text-lg">{submission.jobTitle}</p>
                                                        </div>

                                                        {/* Submission Description */}
                                                        <div className="mb-4">
                                                            <h4 className="font-semibold text-gray-900 mb-2">Submission Description:</h4>
                                                            <p className="text-gray-700">{submission.submissionDescription}</p>
                                                        </div>

                                                        {/* Deliverable URLs */}
                                                        {submission.deliverableUrls && submission.deliverableUrls.length > 0 && (
                                                            <div className="mb-4">
                                                                <h4 className="font-semibold text-gray-900 mb-2">Deliverable URLs:</h4>
                                                                <div className="space-y-2">
                                                                    {submission.deliverableUrls.map((url, index) => (
                                                                        <a
                                                                            key={index}
                                                                            href={url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 bg-blue-50 p-3 rounded-lg hover:bg-blue-100 transition-colors"
                                                                        >
                                                                            <Eye className="w-4 h-4" />
                                                                            <span className="flex-1 truncate">{url}</span>
                                                                            <FileDown className="w-4 h-4" />
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Additional Notes */}
                                                        {submission.submissionNotes && (
                                                            <div className="mb-4">
                                                                <h4 className="font-semibold text-gray-900 mb-2">Additional Notes:</h4>
                                                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{submission.submissionNotes}</p>
                                                            </div>
                                                        )}

                                                        {/* Review Dates */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                            {submission.submittedAt && (
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-900 mb-1">Submitted:</h4>
                                                                    <p className="text-sm text-gray-600">{new Date(submission.submittedAt).toLocaleString()}</p>
                                                                </div>
                                                            )}
                                                            {submission.acceptedAt && (
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-900 mb-1">Accepted:</h4>
                                                                    <p className="text-sm text-gray-600">{new Date(submission.acceptedAt).toLocaleString()}</p>
                                                                </div>
                                                            )}
                                                            {submission.rejectedAt && (
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-900 mb-1">Rejected:</h4>
                                                                    <p className="text-sm text-gray-600">{new Date(submission.rejectedAt).toLocaleString()}</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Client Feedback */}
                                                        {submission.feedback && (
                                                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                                                    <MessageCircle className="w-4 h-4 mr-2 text-blue-600" />
                                                                    Client Feedback:
                                                                </h4>
                                                                <p className="text-gray-700">{submission.feedback}</p>
                                                            </div>
                                                        )}

                                                        {/* Rejection Feedback */}
                                                        {submission.rejectionFeedback && (
                                                            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                                                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                                                    <X className="w-4 h-4 mr-2 text-red-600" />
                                                                    Rejection Reason:
                                                                </h4>
                                                                <p className="text-gray-700">{submission.rejectionFeedback}</p>
                                                                {submission.rejectionReason && submission.rejectionReason !== submission.rejectionFeedback && (
                                                                    <p className="text-gray-600 text-sm mt-2">Reason: {submission.rejectionReason}</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Client Review Actions */}
                                                    {user && contract && user.id === contract.clientId && submission.status === 'PENDING' && !submission.isAccepted && !submission.isRejected && (
                                                        <div className="ml-6 flex flex-col space-y-3">
                                                            <button
                                                                onClick={() => {
                                                                    const feedback = prompt("Enter feedback (optional):");
                                                                    if (feedback !== null) {
                                                                        handleAcceptSubmission(feedback);
                                                                    }
                                                                }}
                                                                disabled={reviewingSubmission === submission.id}
                                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-50"
                                                            >
                                                                <ThumbsUp className="w-4 h-4" />
                                                                <span>Accept</span>
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    const feedback = prompt("Please provide feedback for rejection (required):");
                                                                    if (feedback && feedback.trim()) {
                                                                        handleRejectSubmission(feedback);
                                                                    }
                                                                }}
                                                                disabled={reviewingSubmission === submission.id}
                                                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-50"
                                                            >
                                                                <ThumbsDown className="w-4 h-4" />
                                                                <span>Reject</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
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
