'use client';

import { useState } from 'react';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import OrderTable from '@/components/OrderTable';

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div>
      <main className='overflow-y-auto p-6'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6'>
          <div>
            <Link 
              href='/' 
              className='inline-flex items-center text-sm text-gray-500 mb-2 hover:text-gray-700'
            >
              <ArrowLeft className='h-4 w-4 mr-1' />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className='text-2xl font-semibold text-gray-800 flex items-center'>
              <Package className='mr-2 h-6 w-6 text-green-600' />
              <span>Orders Management</span>
            </h1>
          </div>
          
          <div className='w-full sm:w-auto mt-4 sm:mt-0'>
            <div className='relative'>
              <input
                type='text'
                placeholder='Search orders...'
                className='w-full sm:w-64 px-4 py-2 pr-8 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className='absolute right-3 top-2.5 text-gray-400'>
                <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow'>
          <OrderTable />
        </div>
      </main>
    </div>
  );
}
