import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Task) => void;
    taskToEdit?: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, taskToEdit }) => {
    const { currentUser } = useAuth();
    const initialState = {
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        status: 'pending' as 'pending' | 'in-progress' | 'completed',
    };

    const [formData, setFormData] = useState(initialState);
    const [error, setError] = useState('');

    useEffect(() => {
        if (taskToEdit) {
            setFormData({
                title: taskToEdit.title,
                description: taskToEdit.description,
                dueDate: taskToEdit.dueDate,
                priority: taskToEdit.priority,
                status: taskToEdit.status,
            });
        } else {
            setFormData(initialState);
        }
        setError('');
    }, [taskToEdit, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.dueDate) {
            setError('Title and Due Date are required.');
            return;
        }

        const now = new Date().toISOString();
        const taskData: Task = {
            id: taskToEdit ? taskToEdit.id : `task-${Date.now()}`,
            userId: taskToEdit?.userId || currentUser?.id || '',
            title: formData.title,
            description: formData.description,
            dueDate: formData.dueDate,
            priority: formData.priority as TaskPriority,
            status: formData.status as TaskStatus,
            createdAt: taskToEdit?.createdAt || now,
            updatedAt: now,
        };
        onSave(taskData);
        onClose();
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-secondary rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-text-primary mb-6">{taskToEdit ? 'Edit Task' : 'Add New Task'}</h2>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-text-secondary">Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full bg-primary p-2 border border-border rounded-md mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full bg-primary p-2 border border-border rounded-md mt-1" />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                    <label className="block text-sm font-medium text-text-secondary">Due Date</label>
                                    <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} required className="w-full bg-primary p-2 border border-border rounded-md mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary">Priority</label>
                                    <select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full bg-primary p-2 border border-border rounded-md mt-1">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-text-secondary">Status</label>
                                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-primary p-2 border border-border rounded-md mt-1">
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In-Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        </div>
                    </div>
                    <div className="p-4 bg-primary border-t border-border flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-md bg-border">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm rounded-md bg-accent text-accent-content font-semibold">Save Task</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
