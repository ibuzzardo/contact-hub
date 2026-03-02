'use client';

import { useState, useEffect } from 'react';
import { Task, Deal } from '@/types/crm';
import Header from '@/components/Header';

export default function TasksPage(): JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('due_date');
  const [newTask, setNewTask] = useState({
    title: '',
    type: 'follow_up' as const,
    priority: 'medium' as const,
    due_date: '',
    deal_id: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchDeals();
  }, []);

  const fetchTasks = async (): Promise<void> => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeals = async (): Promise<void> => {
    try {
      const response = await fetch('/api/deals');
      if (response.ok) {
        const data = await response.json();
        setDeals(data || []);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  };

  const handleAddTask = async (): Promise<void> => {
    if (!newTask.title.trim()) return;

    try {
      const taskData = {
        ...newTask,
        deal_id: newTask.deal_id ? parseInt(newTask.deal_id) : undefined
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        await fetchTasks();
        setShowAddTask(false);
        setNewTask({
          title: '',
          type: 'follow_up',
          priority: 'medium',
          due_date: '',
          deal_id: ''
        });
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleCompleteTask = async (taskId: number): Promise<void> => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'PATCH'
      });

      if (response.ok) {
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { ...task, status: 'completed' as const }
            : task
        ));
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const getTaskIcon = (type: string): string => {
    switch (type) {
      case 'call': return 'phone';
      case 'email': return 'email';
      case 'meeting': return 'groups';
      case 'follow_up': return 'schedule';
      case 'demo': return 'play_circle';
      case 'proposal': return 'description';
      default: return 'task_alt';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };

  const getDueDateStatus = (dueDate?: string): { color: string; label: string } => {
    if (!dueDate) return { color: 'bg-slate-100 text-slate-600', label: 'No due date' };
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { color: 'bg-red-100 text-red-700', label: `${Math.abs(diffDays)} days overdue` };
    } else if (diffDays === 0) {
      return { color: 'bg-blue-100 text-blue-700', label: 'Due today' };
    } else {
      return { color: 'bg-slate-100 text-slate-600', label: `Due in ${diffDays} days` };
    }
  };

  const isOverdue = (dueDate?: string): boolean => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const isToday = (dueDate?: string): boolean => {
    if (!dueDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    return today.toDateString() === due.toDateString();
  };

  const isFuture = (dueDate?: string): boolean => {
    if (!dueDate) return true;
    return new Date(dueDate) > new Date();
  };

  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    return true;
  });

  // Group tasks
  const overdueTasks = filteredTasks.filter(task => task.status === 'pending' && isOverdue(task.due_date));
  const todayTasks = filteredTasks.filter(task => task.status === 'pending' && isToday(task.due_date));
  const upcomingTasks = filteredTasks.filter(task => task.status === 'pending' && isFuture(task.due_date) && !isToday(task.due_date));
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');

  const TaskCard = ({ task }: { task: Task }): JSX.Element => {
    const dueDateStatus = getDueDateStatus(task.due_date);
    
    return (
      <div className={`bg-white rounded-lg border border-slate-200 p-4 ${task.status === 'completed' ? 'opacity-60' : ''}`}>
        <div className="flex items-start gap-3">
          <button
            onClick={() => task.status === 'pending' && handleCompleteTask(task.id)}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 transition-colors ${
              task.status === 'completed'
                ? 'bg-green-500 border-green-500'
                : 'border-slate-300 hover:border-green-500'
            }`}
          >
            {task.status === 'completed' && (
              <span className="material-symbols-outlined text-white text-xs">check</span>
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                {task.title}
              </h3>
              <div className="flex items-center gap-2 ml-4">
                <span className="material-symbols-outlined text-slate-400 text-sm">
                  {getTaskIcon(task.type)}
                </span>
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-1 rounded text-xs ${dueDateStatus.color}`}>
                {dueDateStatus.label}
              </span>
              
              {task.deal_name && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  {task.deal_name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Tasks & Follow-ups" subtitle="Manage your daily activities and stay on top of your deals" />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-500">Loading tasks...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Header 
        title="Tasks & Follow-ups" 
        subtitle="Manage your daily activities and stay on top of your deals"
      >
        <button
          onClick={() => setShowAddTask(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Task
        </button>
      </Header>

      <div className="p-6">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Priority:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="created">Created</option>
            </select>
          </div>
        </div>

        {/* Add Task Form */}
        {showAddTask && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Task</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Task title"
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              
              <select
                value={newTask.type}
                onChange={(e) => setNewTask(prev => ({ ...prev, type: e.target.value as any }))}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="follow_up">Follow-up</option>
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
                <option value="demo">Demo</option>
                <option value="proposal">Proposal</option>
              </select>
              
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as any }))}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              
              <input
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              
              <select
                value={newTask.deal_id}
                onChange={(e) => setNewTask(prev => ({ ...prev, deal_id: e.target.value }))}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select deal (optional)</option>
                {deals.map(deal => (
                  <option key={deal.id} value={deal.id}>
                    {deal.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddTask}
                disabled={!newTask.title.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save Task
              </button>
              <button
                onClick={() => setShowAddTask(false)}
                className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Task Groups */}
        <div className="space-y-6">
          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-red-600">warning</span>
                <h2 className="text-lg font-semibold text-red-600">Overdue</h2>
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm font-medium">
                  {overdueTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {overdueTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Today's Tasks */}
          {todayTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-blue-600">schedule</span>
                <h2 className="text-lg font-semibold text-blue-600">Today</h2>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-medium">
                  {todayTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {todayTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Tasks */}
          {upcomingTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-slate-600">upcoming</span>
                <h2 className="text-lg font-semibold text-slate-600">Upcoming</h2>
                <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-sm font-medium">
                  {upcomingTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {upcomingTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
                <h2 className="text-lg font-semibold text-green-600">Completed</h2>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-medium">
                  {completedTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {completedTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">task_alt</span>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks found</h3>
              <p className="text-slate-500 mb-6">
                {statusFilter === 'all' 
                  ? 'Create your first task to get started.'
                  : `No ${statusFilter} tasks found. Try adjusting your filters.`
                }
              </p>
              <button
                onClick={() => setShowAddTask(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Task
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}