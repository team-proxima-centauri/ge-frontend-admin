'use client';

import { useState } from 'react';
import { ArrowLeft, ShoppingBag, Upload, ListFilter } from 'lucide-react';
import Link from 'next/link';
import ProductTable from '@/components/ProductTable';
import BulkProductUpload from '@/components/BulkProductUpload';

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'bulk'>('list');

  return (
    <div>
      <main className='overflow-y-auto p-6'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6'>
          <div>
            <Link 
              href="/" 
              className='inline-flex items-center text-sm text-gray-500 mb-2 hover:text-gray-700'
            >
              <ArrowLeft className='h-4 w-4 mr-1' />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className='text-2xl font-semibold text-gray-800 flex items-center'>
              <ShoppingBag className='mr-2 h-6 w-6 text-green-600' />
              <span>Products Management</span>
            </h1>
          </div>
          
          <div className='w-full sm:w-auto mt-4 sm:mt-0'>
            <div className='relative'>
              <input
                type='text'
                placeholder='Search products...'
                className='w-full sm:w-64 px-4 py-2 pr-8 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className='absolute right-3 top-2.5 text-gray-400'>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow mb-6'>
          <div className='flex border-b'>
            <button
              className={`px-4 py-3 flex items-center ${activeTab === 'list' 
                ? 'border-b-2 border-green-600 text-green-600 font-medium' 
                : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('list')}
            >
              <ListFilter className='h-5 w-5 mr-2' />
              Product List
            </button>
            <button
              className={`px-4 py-3 flex items-center ${activeTab === 'bulk' 
                ? 'border-b-2 border-green-600 text-green-600 font-medium' 
                : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('bulk')}
            >
              <Upload className='h-5 w-5 mr-2' />
              Bulk Upload
            </button>
          </div>
          
          {activeTab === 'list' ? (
            <ProductTable />
          ) : (
            <BulkProductUpload />
          )}
        </div>
      </main>
    </div>
  );
}
