'use client';

import { useState } from 'react';

export default function DeleteUsersPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleDeleteUsers = async () => {
    // Confirm before deletion
    const confirmed = window.confirm(
      'Are you sure you want to delete ALL users? This action cannot be undone!'
    );

    if (!confirmed) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:3000/api/admin/delete-users', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete users');
      }

      const data = await response.json();
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Delete All Users</h1>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-red-700 mb-4">⚠️ Warning</h2>
          <p className="text-red-600 mb-4">
            This action will permanently delete ALL users from the system. 
            This cannot be undone.
          </p>
          
          <button
            onClick={handleDeleteUsers}
            disabled={loading}
            className={`
              px-4 py-2 rounded-lg text-white font-medium
              ${loading 
                ? 'bg-gray-400' 
                : 'bg-red-600 hover:bg-red-700'
              }
            `}
          >
            {loading ? 'Deleting Users...' : 'Delete All Users'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg">
            Users have been successfully deleted.
          </div>
        )}
      </div>
    </div>
  );
}