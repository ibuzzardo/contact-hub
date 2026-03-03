'use client';

import { useState, useEffect } from 'react';
import { Task, Contact } from '@/types';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';
import { getRelativeTime } from '@/lib/utils';

export default function TasksPage(): JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const itemsPerPage = 20;

  const priorities = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' }
  ];

  useEffect(() => {
    fetchTasks();
    fetchContacts();
  }, [currentPage, searchTerm, selectedPriority, selectedStatus]);

  const fetchTasks = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedPriority && { priority: selectedPriority }),
        ...(selectedStatus && { status: selectedStatus })
      });
      
      const response = await fetch(`/api/tasks?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data || []);
        // Note: API doesn't return pagination info yet
        setTotalTasks(data?.length || 0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContacts = async (): Promise<void> => {
    try {
      const response = await fetch('/api/contacts');
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleSearch = (term: string): void => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePriorityFilter = (priority: string): void => {
    setSelectedPriority(priority);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string): void => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleToggleComplete = async (taskId: number, currentStatus: string): Promise<void> => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        ));
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getContactName = (contactId: number): string => {
    const contact = contacts.find(c => c.id === contactId);
    return contact?.name || '';
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };

  const isOverdue = (dueDate: string): boolean => {
    return new Date(dueDate) < new Date();
  };

  if (isLoading && currentPage === 1) {
    return (
      <div className="flex-1">
        <Header title="Tasks" subtitle="Loading tasks..." />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-text-muted">Loading tasks...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Header 
        title="Tasks" 
        subtitle={`Manage your ${totalTasks.toLocaleString()} tasks`}
      />
      
      <div className="p-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <SearchBar 
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search tasks by title or description..."
            />
          </div>
          
          <div className="sm:w-40">
            <select
              value={selectedPriority}
              onChange={(e) => handlePriorityFilter(e.target.value)}
              className="w-full px-4 py-2 border border-border-light rounded-lg bg-surface-light text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="">All Priorities</option>
              {priorities.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="sm:w-40">
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-border-light rounded-lg bg-surface-light text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <EmptyState 
            icon="check_box"
            title="No tasks found"
            description={searchTerm || selectedPriority || selectedStatus ? 
              "Try adjusting your search or filter criteria." :
              "Tasks will appear here as they are created from activities and deals."
            }
          />
        ) : (
          <>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="bg-surface-light rounded-xl border border-border-light p-6">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleToggleComplete(task.id, task.status)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        task.status === 'completed'
                          ? 'bg-primary border-primary text-white'
                          : 'border-slate-300 hover:border-primary'
                      }`}
                    >
                      {task.status === 'completed' && (
                        <span className="material-symbols-outlined text-sm">check</span>
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-lg font-medium mb-1 ${
                            task.status === 'completed' 
                              ? 'text-text-muted line-through' 
                              : 'text-text-main'
                          }`}>
                            {task.title}
                          </h3>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted mb-3">
                            <span>Due {getRelativeTime(task.due_date)}</span>
                            
                            {isOverdue(task.due_date) && task.status !== 'completed' && (
                              <span className="text-red-500 font-medium">(Overdue)</span>
                            )}
                            
                            {task.contact_id && (
                              <span>Contact: {getContactName(task.contact_id)}</span>
                            )}
                          </div>
                          
                          {task.description && (
                            <p className={`whitespace-pre-wrap ${
                              task.status === 'completed' 
                                ? 'text-text-muted line-through' 
                                : 'text-text-main'
                            }`}>
                              {task.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                          
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            task.priority === 'high' ? 'bg-red-100 text-red-700' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {task.priority}
                          </span>
                          
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            task.status === 'completed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalTasks}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}