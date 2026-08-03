import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Edit, Trash2, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmDialog from './ConfirmDialog';
import pb from '@/lib/supabaseClient';
import { toast } from 'sonner';

export default function SongActions({ song, onDeleted }) {
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);

  const handleDelete = async () => {
    try {
      await pb.collection('songs').delete(song.id, { $autoCancel: false });
      toast.success('Song deleted successfully');
      if (onDeleted) onDeleted(song.id);
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete song');
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate(`/songs/${song.id}`)}>
            <Eye className="mr-2 h-4 w-4" /> View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate(`/songs/${song.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" /> Edit Song
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.info('Add to repertoire coming soon')}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add to Repertoire
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowDelete(true)} className="text-destructive focus:bg-destructive/10">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Song"
        description={`Are you sure you want to delete "${song.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
      />
    </>
  );
}