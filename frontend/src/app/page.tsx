"use client";

import { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import TodoForm from '@/components/TodoForm';
import TodoItem, { Todo } from '@/components/TodoItem';
import { api } from '@/lib/axios';
import { Input } from '@/components/ui/input';
import { Search, ListTodo } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchTodos = useCallback(async () => {
    try {
      let url = '/api/todos';
      const params = new URLSearchParams();
      
      if (search) params.append('search', search);
      if (filter === 'active') params.append('completed', 'false');
      if (filter === 'completed') params.append('completed', 'true');
      if (['low', 'medium', 'high'].includes(filter)) params.append('priority', filter);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const { data } = await api.get(url);
      setTodos(data.todos);
    } catch (error) {
      console.error('Failed to fetch todos', error);
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTodos();
    }, 300); // Debounce search

    return () => clearTimeout(delayDebounceFn);
  }, [fetchTodos]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-background to-background dark:from-zinc-900 dark:via-background dark:to-background text-black dark:text-white selection:bg-indigo-500/30">
        <Navbar />
        
        <main className="max-w-3xl mx-auto px-4 py-8 relative">
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 space-y-8">
            <header>
              <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-black to-zinc-600 dark:from-white dark:to-zinc-400">
                Your Tasks
              </h1>
              <p className="text-zinc-400 mt-2">Manage your day efficiently.</p>
            </header>

            <TodoForm onTodoAdded={fetchTodos} />

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-black/5 dark:bg-zinc-900/30 p-2 rounded-lg border border-black/5 dark:border-white/5">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-black/5 dark:bg-black/40 border-none text-black dark:text-white focus-visible:ring-1 focus-visible:ring-indigo-500"
                />
              </div>
              <div className="w-full sm:w-auto">
                <Select value={filter} onValueChange={(val) => setFilter(val || 'all')}>
                  <SelectTrigger className="w-full sm:w-[150px] bg-black/5 dark:bg-black/40 border-none text-black dark:text-white focus:ring-1 focus:ring-indigo-500">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-950 border-black/10 dark:border-white/10 text-black dark:text-white">
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              {loading ? (
                // Skeletons
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-black/5 dark:bg-zinc-800/40 rounded-xl animate-pulse mb-3 border border-black/5 dark:border-white/5" />
                ))
              ) : todos.length > 0 ? (
                todos.map((todo: Todo) => (
                  <TodoItem key={todo.id} todo={todo} onUpdate={fetchTodos} />
                ))
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
                  <div className="w-24 h-24 bg-black/5 dark:bg-zinc-800/30 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <ListTodo className="h-10 w-10 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <h3 className="text-xl font-medium text-zinc-700 dark:text-zinc-300">No tasks found</h3>
                  <p className="mt-2 text-sm text-center max-w-sm">
                    {search ? 'Try adjusting your search or filters.' : 'You are all caught up! Add a new task above to get started.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
