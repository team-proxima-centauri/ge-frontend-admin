'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import { getOrderDetails, OrderDetails } from '@/services/api';

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const data = await getOrderDetails(orderId);
        setOrder(data);
        setError(null);
      } catch (err) {
        console.error('Error loading order details:', err);
        setError('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-500'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-4 bg-red-50 text-red-600 rounded-md'>
        <p>{error}</p>
        <Link href='/orders' className='text-blue-600 underline mt-2 inline-block'>
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <Link
            href='/orders'
            className='inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2'
          >
            <ArrowLeft className='h-4 w-4 mr-1' />
            <span>Back to Orders</span>
          </Link>
          <h1 className='text-2xl font-semibold text-gray-800 flex items-center'>
            <Package className='mr-2 h-6 w-6 text-green-600' />
            <span>Order Details</span>
          </h1>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow p-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700'>
          <div>
            <span className='font-medium'>Order ID:</span> {order.id}
          </div>
          <div>
            <span className='font-medium'>User:</span>{' '}
            {order.user?.name || order.user_name || order.owner_id}
          </div>
          <div>
            <span className='font-medium'>Email:</span>{' '}
            {order.user?.email || order.email}
          </div>
          <div>
            <span className='font-medium'>Payment Method:</span> {order.payment_method}
          </div>
          <div>
            <span className='font-medium'>Delivery Status:</span> {order.delivery_status}
          </div>
          <div>
            <span className='font-medium'>Total Amount:</span> ₱{order.total_amount.toFixed(2)}
          </div>
          <div>
            <span className='font-medium'>Created At:</span>{' '}
            {new Date(order.created_at).toLocaleString()}
          </div>
          {order.delivery_address && (
            <div className='md:col-span-2'>
              <span className='font-medium'>Delivery Address:</span> {order.delivery_address}
            </div>
          )}
        </div>

        {order.cart_items && order.cart_items.length > 0 && (
          <div className='mt-6'>
            <h2 className='text-lg font-semibold mb-2'>Items</h2>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Product</th>
                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Quantity</th>
                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Price</th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {order.cart_items.map((item) => (
                    <tr key={item.id}>
                      <td className='px-4 py-2 whitespace-nowrap text-sm text-gray-700'>
                        {item.product_name || item.product?.name || item.product_id}
                      </td>
                      <td className='px-4 py-2 whitespace-nowrap text-sm text-gray-700'>
                        {item.quantity}
                      </td>
                      <td className='px-4 py-2 whitespace-nowrap text-sm text-gray-700'>
                        {item.price ? `₱${item.price.toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
