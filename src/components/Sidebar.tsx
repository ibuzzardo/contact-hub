'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: 'dashboard' },
  { name: 'Contacts', href: '/contacts', icon: 'group' },
  { name: 'Companies', href: '/companies', icon: 'domain' },
  { name: 'Deals', href: '/deals', icon: 'view_kanban' },
  { name: 'Activities', href: '/activities', icon: 'forum' },
  { name: 'Tasks', href: '/tasks', icon: 'check_box' },
  { name: 'Reports', href: '/reports', icon: 'bar_chart' },
  { name: 'Groups', href: '/groups', icon: 'group_work' },
  { name: 'Settings', href: '/settings', icon: 'settings' },
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
      <div className={`bg-sandstone w-64 h-full shadow-lg fixed top-0 left-0 flex flex-col z-40 border-r border-border-light transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        {/* Logo */}
        <div className="p-6 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">hub</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-main">ContactHub</h1>
              <span className="text-xs text-text-muted">University of Sydney — AI Hub</span>
            </div>
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
        </nav>
        
        {/* New Contact Button */}
        <div className="p-4 border-t border-border-light">
          <Link
            href="/contacts/new"
            onClick={() => setIsOpen(false)}
            className="w-full bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm shadow-primary/30"
          >
            <span className="material-symbols-outlined">add</span>
            New Contact
          </Link>
        </div>
      </div>
    </>
  );
}