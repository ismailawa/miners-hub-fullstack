'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Task } from '../../lib/types';
import TaskModal from '../TaskModal';
import ConfirmationModal from '../ConfirmationModal';

const priorityStyles: Record<string, string> = {
    low: 'bg-blue-500/20 text-blue-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-red-500/20 text-red-400',
};

const TaskItem: React.FC<{ task: Task; onEdit: (task: Task) => void; onDelete: (task: Task) => void }> = ({ task, onEdit, onDelete }) => {
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
    return (
        <div className="bg-primary p-4 rounded-lg border border-border flex justify-between items-start">
            <div className="flex-1">
                <p className="font-bold text-text-primary">{task.title}</p>
                <p className="text-sm text-text-secondary mt-1">{task.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${priorityStyles[task.priority]}`}>{task.priority}</span>
                    <span className={`font-semibold ${isOverdue ? 'text-red-400' : 'text-text-muted'}`}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
                <button onClick={() => onEdit(task)} className="p-2 text-text-muted hover:text-text-primary transition-colors" aria-label="Edit task">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                </button>
                <button onClick={() => onDelete(task)} className="p-2 text-text-muted hover:text-red-400 transition-colors" aria-label="Delete task">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        </div>
    );
};

const TaskManagementContent: React.FC = () => {
    const { currentUser, updateUser } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

    useEffect(() => {
        setTasks(currentUser?.tasks || []);
    }, [currentUser]);

    const handleSaveTask = (taskToSave: Task) => {
        if (!currentUser) return;
        const existingIndex = tasks.findIndex(t => t.id === taskToSave.id);
        const updated = existingIndex > -1
            ? tasks.map(t => t.id === taskToSave.id ? taskToSave : t)
            : [...tasks, taskToSave];
        setTasks(updated);
        updateUser({ ...currentUser, tasks: updated });
        setIsTaskModalOpen(false);
        setTaskToEdit(null);
    };

    const handleDeleteTask = () => {
        if (!taskToDelete || !currentUser) return;
        const updated = tasks.filter(t => t.id !== taskToDelete.id);
        setTasks(updated);
        updateUser({ ...currentUser, tasks: updated });
        setIsDeleteModalOpen(false);
        setTaskToDelete(null);
    };

    const statusGroups: Array<{ status: string; label: string }> = [
        { status: 'pending', label: 'Pending' },
        { status: 'in-progress', label: 'In Progress' },
        { status: 'completed', label: 'Completed' },
    ];

    const pendingCount = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Task Management</h1>
                    <p className="text-text-muted text-sm mt-1">{pendingCount} pending task{pendingCount !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => { setTaskToEdit(null); setIsTaskModalOpen(true); }} className="bg-accent text-accent-content font-semibold py-2 px-4 rounded-md hover:bg-yellow-400 transition-colors text-sm">
                    + Add Task
                </button>
            </div>

            {tasks.length > 0 ? (
                <div className="space-y-8">
                    {statusGroups.map(({ status, label }) => {
                        const filtered = tasks
                            .filter(t => t.status === status)
                            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
                        if (filtered.length === 0) return null;
                        return (
                            <div key={status}>
                                <h3 className="font-semibold text-text-primary mb-3 border-b border-border pb-2 text-lg flex items-center gap-2">
                                    {status === 'pending' && <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block"></span>}
                                    {status === 'in-progress' && <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block"></span>}
                                    {status === 'completed' && <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block"></span>}
                                    {label}
                                    <span className="ml-auto text-xs text-text-muted font-normal">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</span>
                                </h3>
                                <div className="space-y-3">
                                    {filtered.map(task => (
                                        <TaskItem
                                            key={task.id}
                                            task={task}
                                            onEdit={(t) => { setTaskToEdit(t); setIsTaskModalOpen(true); }}
                                            onDelete={(t) => { setTaskToDelete(t); setIsDeleteModalOpen(true); }}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 text-text-muted border border-dashed border-border rounded-lg">
                    <p className="text-2xl mb-2">✅</p>
                    <p className="text-lg font-semibold">No tasks yet</p>
                    <p className="mt-1 text-sm">Click "Add Task" to create your first task.</p>
                </div>
            )}

            <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} onSave={handleSaveTask} taskToEdit={taskToEdit} />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteTask}
                title="Delete Task"
                message={`Are you sure you want to permanently delete the task "${taskToDelete?.title}"?`}
                confirmText="Delete"
            />
        </div>
    );
};

export default TaskManagementContent;
