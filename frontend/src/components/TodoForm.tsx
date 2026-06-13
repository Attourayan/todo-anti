"use client";

import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

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
  DialogTrigger,
} from '@/components/ui/dialog';

export default function TodoForm({ onTodoAdded }: { onTodoAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/api/todos', { title, priority });
      setTitle('');
      setPriority('medium');
      onTodoAdded();
      toast.success('Task added');
      setOpen(false); // Close dialog on success
    } catch {
      toast.error('Failed to add task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20" />}>
        <Plus className="h-4 w-4 mr-2" />
        Add New Task
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border-black/10 dark:border-white/10">
        <DialogHeader>
          <DialogTitle className="text-black dark:text-white">Create a new task</DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400">
            What do you need to get done today?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..."
            className="w-full bg-black/5 dark:bg-black/50 border-black/10 dark:border-white/10 text-black dark:text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
            disabled={isSubmitting}
            autoFocus
          />
          <Select value={priority} onValueChange={(val) => setPriority(val || 'medium')} disabled={isSubmitting}>
            <SelectTrigger className="w-full bg-black/5 dark:bg-black/50 border-black/10 dark:border-white/10 text-black dark:text-white">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-950 border-black/10 dark:border-white/10 text-black dark:text-white">
              <SelectItem value="low">Low Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!title.trim() || isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
