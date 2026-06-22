'use client';

import React, { useEffect, useState } from 'react';
import { getUsers, verifyUser, AdminUser } from '../../../../lib/api/admin';
import { useAuth } from '../../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
    const { currentUser } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (currentUser && currentUser.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        const fetchUsers = async () => {
            try {
                const data = await getUsers();
                setUsers(data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };

        if (currentUser?.role === 'admin') {
            fetchUsers();
        }
    }, [currentUser, router]);

    const handleVerify = async (id: string, status: string) => {
        try {
            await verifyUser(id, status);
            // Update local state
            setUsers(users.map(u => u.id === id ? { ...u, verificationStatus: status } : u));
        } catch (err: any) {
            alert(err.message || 'Failed to update user status');
        }
    };

    if (loading) return <div className="p-8">Loading users...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
            <p className="text-text-secondary">Approve or reject miners and investors.</p>

            <div className="bg-secondary rounded-xl border border-border overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-primary/50 text-text-secondary text-sm">
                            <th className="p-4 font-semibold border-b border-border">Name</th>
                            <th className="p-4 font-semibold border-b border-border">Email</th>
                            <th className="p-4 font-semibold border-b border-border">Role</th>
                            <th className="p-4 font-semibold border-b border-border">Status</th>
                            <th className="p-4 font-semibold border-b border-border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b border-border hover:bg-primary/30 transition-colors">
                                <td className="p-4 text-sm font-medium">{user.name || '-'}</td>
                                <td className="p-4 text-sm text-text-secondary">{user.email}</td>
                                <td className="p-4 text-sm capitalize">{user.role}</td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        user.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                                        user.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {user.verificationStatus}
                                    </span>
                                </td>
                                <td className="p-4 text-sm">
                                    {user.verificationStatus === 'pending' && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleVerify(user.id, 'verified')}
                                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleVerify(user.id, 'rejected')}
                                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-text-muted">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
