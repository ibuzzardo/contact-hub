'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: 'dashboard' },
  { name: 'Contacts', href: '/contacts', icon: 'group' },
  { name: 'Groups', href: '/groups', icon: 'domain' },
  { name: 'Favorites', href: '/favorites', icon: 'star' },
];

const settingsNavigation = [
  { name: 'General', href: '/settings', icon: 'settings' },
];

export default function Sidebar(): JSX.Element {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-surface-light shadow-md border border-border-light"
        >
          <span className="material-symbols-outlined text-text-main">menu</span>
        </button>
      </div>

      {/* Sidebar */}
      <div className={`bg-surface-light w-64 h-full shadow-lg fixed top-0 left-0 flex flex-col z-40 border-r border-border-light transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        {/* Logo */}
        <div className="p-6 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">hub</span>
            </div>
            <h1 className="text-xl font-bold text-text-main">ContactHub</h1>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const active = isActive(item.href);
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-muted hover:bg-slate-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
          
          {/* Settings Section */}
          <div className="mt-8">
            <h3 className="px-4 text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Settings</h3>
            <ul className="space-y-2">
              {settingsNavigation.map((item) => {
                const active = isActive(item.href);
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-text-muted hover:bg-slate-100'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">{item.icon}</span>
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
        
        {/* User Section */}
        <div className="p-4 border-t border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
              IB
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-main truncate">Ian Buswell</p>
              <p className="text-xs text-text-muted truncate">icbmatrix@gmail.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}