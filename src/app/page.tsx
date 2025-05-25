'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Users, ShoppingBag, ListOrdered } from 'lucide-react';
import { getProducts, getUsers, getOrders } from '@/services/api';
import ProductTable from '@/components/ProductTable';
import UserTable from '@/components/UserTable';

// Dashboard Card Component
const DashboardCard = ({ title, value, icon: Icon, change, changeType }: {
  title: string;
  value: string;
  icon: React.ElementType;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}) => (
  <div className='bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200'>
    <div className='flex items-center justify-between mb-2'>
      <h3 className='text-sm font-medium text-gray-500'>{title}</h3>
      <Icon className='h-5 w-5 text-gray-500' />
    </div>
    <p className='text-2xl font-semibold text-gray-800'>{value}</p>
    {change && (
      <p className={`text-xs mt-1 ${
        changeType === 'positive' ? 'text-green-500' : 
        changeType === 'negative' ? 'text-red-500' : 'text-gray-500'
      }`}>
        {change} from last month
      </p>
    )}
  </div>
);

// Main Dashboard Page Component
export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    revenue: '₱0.00',
    orders: '0',
    users: '0',
    products: '0',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch data in parallel
        const [products, users, orders] = await Promise.all([
          getProducts().catch(() => []),
          getUsers().catch(() => []),
          getOrders().catch(() => []),
        ]);
        
        // Calculate revenue from orders
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        
        setStats({
          revenue: `₱${totalRevenue.toFixed(2)}`,
          orders: String(orders.length),
          users: String(users.length),
          products: String(products.length),
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Stats cards data
  const overviewStats = [
    { title: 'Total Revenue', value: stats.revenue, icon: DollarSign, change: '+0%', changeType: 'positive' as const },
    { title: 'Total Orders', value: stats.orders, icon: ListOrdered, change: '+0%', changeType: 'positive' as const },
    { title: 'Active Users', value: stats.users, icon: Users, change: '+0%', changeType: 'neutral' as const },
    { title: 'Products', value: stats.products, icon: ShoppingBag, change: '+0%', changeType: 'neutral' as const },
  ];

  return (
    <div>
      <main className='overflow-y-auto p-6'>
        <h1 className='text-2xl font-semibold text-gray-800 mb-6'>28ChocoMart Admin Dashboard</h1>
        
        {loading ? (
          <div className='flex justify-center items-center h-[calc(100vh-100px)]'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-500'></div>
          </div>
        ) : (
          <>
            {/* Overview Stats Cards */}
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8'>
              {overviewStats.map((stat) => (
                <DashboardCard key={stat.title} {...stat} />
              ))}
            </div>

            {/* Product Management Section */}
            <div className='mb-8'>
              <ProductTable />
            </div>

            {/* User Management Section */}
            <div className='mb-8'>
              <UserTable />
            </div>
          </>
        )}
      </main>
    </div>
  );
}