'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, createProduct, getProduct, updateProduct } from '@/services/api';

interface ProductFormProps {
  productId?: string;
  isEditMode?: boolean;
}

const CATEGORIES = [
  'Fruits',
  'Vegetables',
  'Meat',
  'Seafood',
  'Dairy',
  'Bakery',
  'Beverages',
  'Snacks',
  'Frozen Foods',
  'Canned Goods',
  'Grains',
  'Condiments',
  'Household',
  'Personal Care',
  'Other'
];

const UNITS = [
  'kg',
  'g',
  'lb',
  'oz',
  'l',
  'ml',
  'pcs',
  'bunch',
  'pack',
  'box',
  'bottle',
  'can',
  'dozen'
];

const ProductForm: React.FC<ProductFormProps> = ({ productId, isEditMode = false }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [form, setForm] = useState<Omit<Product, 'id' | 'created_at'>>({
    name: '',
    description: '',
    price: 0,
    unit: 'kg',
    category: 'Fruits',
    stock_quantity: 0,
    image_url: '',
  });
  
  // For image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (isEditMode && productId) {
        try {
          setLoading(true);
          const productData = await getProduct(productId);
          setForm({
            name: productData.name,
            description: productData.description,
            price: productData.price,
            unit: productData.unit,
            category: productData.category,
            stock_quantity: productData.stock_quantity,
            image_url: productData.image_url,
          });
        } catch (err) {
          console.error('Error fetching product:', err);
          setError('Failed to load product. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProduct();
  }, [isEditMode, productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setForm(prev => ({
      ...prev,
      [name]: 
        name === 'price' || name === 'stock_quantity' 
          ? parseFloat(value) 
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    
    try {
      // Handle image upload if there's a new image file
      let updatedForm = { ...form };
      if (imageFile) {
        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('image', imageFile);
        
        try {
          setUploadProgress(10);
          
          // Simulate progressive upload (for UI feedback)
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
              if (prev >= 90) {
                clearInterval(progressInterval);
                return 90;
              }
              return prev + 10;
            });
          }, 300);
          
          // For now, use a placeholder URL from a free image hosting service
          // In a production environment, you would upload to your own storage/CDN
          const randomId = Math.floor(Math.random() * 1000);
          const imageUrl = `https://source.unsplash.com/random/300x300?grocery,food,product&sig=${randomId}`;
          
          // Wait for simulated upload
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          clearInterval(progressInterval);
          setUploadProgress(100);
          
          // Update form with the image URL
          updatedForm = {
            ...form,
            image_url: imageUrl
          };
        } catch (uploadErr) {
          console.error('Error uploading image:', uploadErr);
          throw new Error('Failed to upload image. Please try again.');
        }
      }
      
      // Save the product data
      if (isEditMode && productId) {
        await updateProduct(productId, updatedForm);
      } else {
        await createProduct(updatedForm);
      }
      router.push('/products');
      router.refresh();
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Failed to save product. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <Link 
          href="/products" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to Products</span>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-800 mt-2">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 mb-6 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name*</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              placeholder="Enter product name"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              placeholder="Enter product description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₱)*</label>
            <input
              type="number"
              name="price"
              value={String(form.price)}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity*</label>
            <input
              type="number"
              name="stock_quantity"
              value={String(form.stock_quantity)}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit*</label>
            <select
              name="unit"
              value={form.unit}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
            >
              {UNITS.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
            <div className="flex flex-col md:flex-row md:space-x-4">
              <div className="flex-1">
                <div className="mt-1 flex justify-center px-6 py-6 border-2 border-gray-300 border-dashed rounded-md mb-4 md:mb-0 hover:bg-gray-50 transition">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setImageFile(file);
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setPreviewUrl(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
                
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full mt-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 text-right mt-1">{uploadProgress}% uploaded</p>
                  </div>
                )}
                
                {/* Keep the image URL field for direct URL input as a fallback */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Or enter image URL</label>
                  <input
                    type="url"
                    name="image_url"
                    value={form.image_url}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 w-full md:w-1/3 flex flex-col items-center">
                <p className="text-sm text-gray-500 mb-1 self-start">Preview:</p>
                <div className="border border-gray-200 rounded-md h-48 w-48 flex items-center justify-center overflow-hidden bg-gray-50">
                  {(previewUrl || form.image_url) ? (
                    <div className="relative h-full w-full">
                      <Image 
                        src={previewUrl || form.image_url} 
                        alt={form.name || 'Product preview'} 
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-contain" 
                        onError={() => {
                          // Fallback to placeholder image if the source fails to load
                          setPreviewUrl('');
                          if (previewUrl) {
                            setForm(prev => ({
                              ...prev,
                              image_url: 'https://via.placeholder.com/150?text=No+Image'
                            }));
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm text-center p-4">
                      Image preview will appear here
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <div className="flex justify-end space-x-2 mt-6">
              <Link 
                href="/products" 
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                {submitLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
