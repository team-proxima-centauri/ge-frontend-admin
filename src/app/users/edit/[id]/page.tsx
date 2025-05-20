'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getUserById, updateUser, UpdateUserData } from '@/services/api';
import Link from 'next/link';
import { User, Save, ArrowLeft, UserCog, Mail, Shield } from 'lucide-react';

const EditUserPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [originalEmail, setOriginalEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const user = await getUserById(userId);
      if (user) {
        setName(user.name);
        setEmail(user.email);
        setOriginalEmail(user.email);
        setRole(user.role as 'admin' | 'user');
      } else {
        setError('User not found.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to fetch user details: ${errorMessage}`);
      console.error('Fetch user error:', err);
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    if (!name || !email) {
      setError('Name and email are required.');
      setIsSubmitting(false);
      return;
    }

    const userData: UpdateUserData = {
      name,
      role,
    };

    // Only include email if it has changed
    if (email !== originalEmail) {
      userData.email = email;
    }

    try {
      await updateUser(userId, userData);
      setSuccess('User updated successfully! Redirecting to users list...');
      setTimeout(() => {
        router.push('/users');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to update user: ${errorMessage}`);
      console.error('Update user error:', err);
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className='container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4'></div>
        <p className='text-gray-600 font-medium'>Loading user data...</p>
      </div>
    );
  }

  if (error && !name) {
    return (
      <div className='container mx-auto p-4'>
         <div className='mb-6 flex justify-between items-center'>
          <h1 className='text-2xl font-semibold text-gray-800 flex items-center'>
            <UserCog className='mr-2 h-6 w-6 text-gray-700' /> Edit User
          </h1>
          <Link href='/users' className='text-blue-500 hover:text-blue-700 flex items-center transition-colors duration-200'>
            <ArrowLeft className='mr-1 h-4 w-4' /> Back to Users List
          </Link>
        </div>
        <div className='p-4 bg-red-50 text-red-700 border-l-4 border-red-500 rounded-md shadow-sm'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium'>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-4'>
      <div className='mb-6 flex justify-between items-center'>
        <h1 className='text-2xl font-semibold text-gray-800 flex items-center'>
          <UserCog className='mr-2 h-6 w-6 text-gray-700' /> 
          <span>Edit User: <span className='text-green-600'>{name || '...'}</span></span>
        </h1>
        <Link href='/users' className='flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-md'>
          <ArrowLeft className='mr-1 h-4 w-4' /> Back to Users List
        </Link>
      </div>

      {error && (
        <div className='mb-4 p-4 bg-red-50 text-red-700 border-l-4 border-red-500 rounded-md shadow-sm'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium'>{error}</p>
            </div>
          </div>
        </div>
      )}
      {success && (
        <div className='mb-4 p-4 bg-green-50 text-green-700 border-l-4 border-green-500 rounded-md shadow-sm'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg className='h-5 w-5 text-green-400' viewBox='0 0 20 20' fill='currentColor'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium'>{success}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className='bg-white p-6 rounded-lg shadow-md border border-gray-200 transition-all hover:shadow-lg'>
        <div className='mb-5'>
          <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-1 flex items-center'>
            <User className='h-4 w-4 mr-1 text-gray-500' /> Name
          </label>
          <div className='relative'>
            <input
              type='text'
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900'
              placeholder='Enter user name'
              required
              disabled={isSubmitting}
            />
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <span className='text-gray-500 sm:text-sm'>
                <User className='h-5 w-5' />
              </span>
            </div>
          </div>
        </div>

        <div className='mb-5'>
          <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1 flex items-center'>
            <Mail className='h-4 w-4 mr-1 text-gray-500' /> Email
          </label>
          <div className='relative'>
            <input
              type='email'
              id='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900'
              placeholder='user@example.com'
              required
              disabled={isSubmitting}
            />
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <span className='text-gray-500 sm:text-sm'>
                <Mail className='h-5 w-5' />
              </span>
            </div>
          </div>
        </div>

        <div className='mb-6'>
          <label htmlFor='role' className='block text-sm font-medium text-gray-700 mb-1 flex items-center'>
            <Shield className='h-4 w-4 mr-1 text-gray-500' /> Role
          </label>
          <div className='relative'>
            <select
              id='role'
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
              className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none transition-colors text-gray-900'
              disabled={isSubmitting}
            >
              <option value='user'>User</option>
              <option value='admin'>Admin</option>
            </select>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <span className='text-gray-500 sm:text-sm'>
                <Shield className='h-5 w-5' />
              </span>
            </div>
            <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
              <svg className='h-5 w-5 text-gray-400' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' aria-hidden='true'>
                <path fillRule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clipRule='evenodd' />
              </svg>
            </div>
          </div>
          <p className='mt-1 text-xs text-gray-500'>
            {role === 'admin' ? 'Admin users have full access to all features and settings.' : 'Regular users have limited access to features.'}
          </p>
        </div>

        <div className='flex items-center justify-end space-x-4 pt-2 border-t border-gray-100'>
           <Link href='/users'>
            <button
              type='button' 
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 flex items-center'
              disabled={isSubmitting}
            >
              <ArrowLeft className='mr-1 h-4 w-4' /> Cancel
            </button>
          </Link>
          <button
            type='submit'
            className='px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200 flex items-center shadow-sm'
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2'></div>
                Updating...
              </>
            ) : (
              <>
                <Save className='mr-1 h-4 w-4' /> Update User
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUserPage;