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
    <div className='max-w-6xl mx-auto'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <Link
            href='/orders'
            className='inline-flex items-center text-sm text-green-600 hover:text-green-800 mb-2 transition-colors'
          >
            <ArrowLeft className='h-4 w-4 mr-1' />
            <span>Back to Orders</span>
          </Link>
          <h1 className='text-2xl font-bold text-gray-800 flex items-center'>
            <Package className='mr-2 h-6 w-6 text-green-600' />
            <span>Order Details</span>
          </h1>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-lg p-6 border border-gray-100'>
        {/* Order Information Card */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 mb-8'>
          <div className='space-y-4'>
            <div className='bg-gray-50 p-4 rounded-md'>
              <h3 className='text-sm uppercase text-gray-500 mb-2 font-medium'>Order Information</h3>
              <div className='space-y-2'>
                <div>
                  <span className='font-medium text-gray-600'>Order ID:</span>
                  <p className='text-gray-800'>{order.id}</p>
                </div>
                <div>
                  <span className='font-medium text-gray-600'>Created At:</span>
                  <p className='text-gray-800'>{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <span className='font-medium text-gray-600'>Total Amount:</span>
                  <p className='text-lg font-semibold text-green-600'>₱{order.total_amount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className='space-y-4'>
            <div className='bg-gray-50 p-4 rounded-md'>
              <h3 className='text-sm uppercase text-gray-500 mb-2 font-medium'>Customer Information</h3>
              <div className='space-y-2'>
                <div>
                  <span className='font-medium text-gray-600'>Customer:</span>
                  <p className='text-gray-800'>{order.user?.name || order.user_name || order.owner_id}</p>
                </div>
                <div>
                  <span className='font-medium text-gray-600'>Email:</span>
                  <p className='text-gray-800'>{order.user?.email || order.email}</p>
                </div>
                <div>
                  <span className='font-medium text-gray-600'>Payment Method:</span>
                  <p className='text-gray-800'>{order.payment_method}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        <div className='mb-8'>
          <div className='bg-gray-50 p-4 rounded-md'>
            <h3 className='text-sm uppercase text-gray-500 mb-2 font-medium'>Delivery Information</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <span className='font-medium text-gray-600'>Status:</span>
                <p className='mt-1'>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.delivery_status === 'delivered' ? 'bg-green-100 text-green-800' : order.delivery_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                    {order.delivery_status.toUpperCase()}
                  </span>
                </p>
              </div>
              {order.delivery_address && (
                <div>
                  <span className='font-medium text-gray-600'>Delivery Address:</span>
                  <p className='text-gray-800 mt-1'>{order.delivery_address}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        {order.cart_items && order.cart_items.length > 0 && (
          <div>
            <h2 className='text-lg font-bold mb-4 text-gray-800 flex items-center'>
              <span>Order Items</span>
              <span className='ml-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full'>
                {order.cart_items.length} {order.cart_items.length === 1 ? 'item' : 'items'}
              </span>
            </h2>
            <div className='bg-gray-50 rounded-lg overflow-hidden border border-gray-200'>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-100'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Product</th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Quantity</th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Price</th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {order.cart_items.map((item) => {
                      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                      const subtotal = price ? price * item.quantity : 0;
                      return (
                        <tr key={item.id} className='hover:bg-gray-50'>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='flex items-center'>
                              <div className='ml-4'>
                                <div className='text-sm font-medium text-gray-900'>
                                  {item.product_name || item.product?.name || item.product_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                            {item.quantity}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                            {price ? `₱${price.toFixed(2)}` : '-'}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                            {price ? `₱${subtotal.toFixed(2)}` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className='bg-gray-50'>
                    <tr>
                      <td colSpan={3} className='px-6 py-4 text-right font-medium text-gray-700'>Total:</td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600'>
                        ₱{order.total_amount.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
