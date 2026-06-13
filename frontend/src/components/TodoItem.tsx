"use client";

import { useState } from 'react';
import { api } from '@/lib/axios';
import { toast } from 'sonner';
import { Trash2, Edit2, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  createdAt: string;
}

export default function TodoItem({ todo, onUpdate }: { todo: Todo; onUpdate: () => void }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editPriority, setEditPriority] = useState(todo.priority);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const priorityColors = {
    low: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    medium: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
    high: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30',
  };

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await api.patch(`/api/todos/${todo.id}/toggle`);
      onUpdate();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/api/todos/${todo.id}`);
      onUpdate();
      toast.success('Task deleted');
      setIsDeleteModalOpen(false);
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    
    setIsSaving(true);
    try {
      await api.put(`/api/todos/${todo.id}`, { title: editTitle, priority: editPriority });
      setIsEditModalOpen(false);
      onUpdate();
      toast.success('Task updated');
    } catch {
      toast.error('Failed to update task');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className={`group flex items-center justify-between p-4 mb-3 rounded-xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-zinc-900/40 backdrop-blur-sm transition-all duration-300 hover:bg-black/10 dark:hover:bg-zinc-800/60 ${todo.completed ? 'opacity-60' : ''}`}>
        <div className="flex items-center gap-4 flex-1 overflow-hidden">
          <Checkbox 
            checked={todo.completed} 
            onCheckedChange={handleToggle} 
            disabled={isToggling}
            className="h-5 w-5 rounded-full border-black/20 dark:border-white/30 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
          />
          
          <div className="flex flex-col overflow-hidden">
            <span className={`text-sm sm:text-base text-black dark:text-white truncate transition-all duration-300 ${todo.completed ? 'line-through text-zinc-500' : ''}`}>
              {todo.title}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${priorityColors[todo.priority]} font-medium uppercase tracking-wider`}>
                {todo.priority}
              </span>
              {todo.dueDate && (
                <span className="flex items-center text-[10px] text-zinc-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(new Date(todo.dueDate), 'MMM d')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => {
              setEditTitle(todo.title);
              setEditPriority(todo.priority);
              setIsEditModalOpen(true);
            }}
            className="h-8 w-8 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => setIsDeleteModalOpen(true)}
            className="h-8 w-8 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border-black/10 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-white">Edit Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 mt-4">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full bg-black/5 dark:bg-black/50 border-black/10 dark:border-white/10 text-black dark:text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
              disabled={isSaving}
              autoFocus
            />
            <Select value={editPriority} onValueChange={(val) => { if (val) setEditPriority(val as 'low' | 'medium' | 'high'); }} disabled={isSaving}>
              <SelectTrigger className="w-full bg-black/5 dark:bg-black/50 border-black/10 dark:border-white/10 text-black dark:text-white">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-950 border-black/10 dark:border-white/10 text-black dark:text-white">
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSaving}
                className="border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!editTitle.trim() || isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border-black/10 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-white">Delete Task</DialogTitle>
            <DialogDescription className="text-zinc-500 dark:text-zinc-400">
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
              className="border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
