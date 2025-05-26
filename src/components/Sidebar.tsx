'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { ShoppingBag, Users, LayoutDashboard, Package, CreditCard, LogOut } from 'lucide-react';
import { logout } from '@/services/api';

const Sidebar = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const navItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/',
    },
    {
      title: 'Products',
      icon: <ShoppingBag className="w-5 h-5" />,
      path: '/products',
    },
    {
      title: 'Users',
      icon: <Users className="w-5 h-5" />,
      path: '/users',
    },
    {
      title: 'Orders',
      icon: <Package className="w-5 h-5" />,
      path: '/orders',
    },
    {
      title: 'Transactions',
      icon: <CreditCard className="w-5 h-5" />,
      path: '/transactions',
    },
  ];

  return (
    <aside className={`bg-groceryease-surface shadow-md h-screen transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center border-b border-groceryease-border">
          {!collapsed && (
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-groceryease-text">
                <span className="text-primary">28</span>ChocoMart
              </h1>
              <Image 
                src="https://res.cloudinary.com/dpkfvbpet/image/upload/v1748211287/eb77e0ae-a45e-4a2e-868d-7830b82960b6_cbg1ml.png" 
                alt="Groceryease Logo" 
                width={30} 
                height={30} 
                className="ml-2"
              />
            </div>
          )}
          {collapsed && (
            <Image 
              src="https://res.cloudinary.com/dpkfvbpet/image/upload/v1748211287/eb77e0ae-a45e-4a2e-868d-7830b82960b6_cbg1ml.png" 
              alt="Groceryease Logo" 
              width={30} 
              height={30} 
            />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-groceryease-textSecondary hover:text-primary"
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`
                    flex items-center px-4 py-3 text-groceryease-text hover:bg-secondary hover:text-primary
                    ${pathname === item.path ? 'bg-secondary text-primary border-l-4 border-primary' : ''}
                  `}
                >
                  <span className="mr-3">{item.icon}</span>
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-groceryease-border">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-groceryease-text hover:bg-status-error hover:text-white rounded"
          >
            <LogOut className="w-5 h-5 mr-3" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
