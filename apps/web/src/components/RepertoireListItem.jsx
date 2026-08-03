import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Edit, Copy, Trash2, Globe, Printer } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatusBadge from './StatusBadge';
import DurationDisplay from './DurationDisplay';

export default function RepertoireListItem({ repertoire, onAction }) {
  const navigate = useNavigate();

  return (
    <div 
      className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={() => navigate(`/repertoires/${repertoire.id}`)}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate text-lg">{repertoire.name}</h4>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant="secondary" className="bg-secondary/10 text-secondary font-normal text-xs">
              {repertoire.service_type}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(repertoire.created).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      
      <div className="hidden md:flex items-center gap-8 flex-shrink-0 mx-6">
        <StatusBadge status={repertoire.status} />
        
        <div className="flex flex-col items-end w-24">
          <span className="text-sm font-medium">{repertoire.song_count || 0} songs</span>
          <DurationDisplay seconds={repertoire.total_duration} className="text-xs" showIcon={false} />
        </div>
      </div>

      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/repertoires/${repertoire.id}`)}>
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/repertoires/${repertoire.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/repertoires/${repertoire.id}/preview`)}>
              <Printer className="mr-2 h-4 w-4" /> Print / Preview
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAction('duplicate', repertoire)}>
              <Copy className="mr-2 h-4 w-4" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('toggle_status', repertoire)}>
              <Globe className="mr-2 h-4 w-4" /> 
              {repertoire.status === 'published' ? 'Unpublish' : 'Publish'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAction('delete', repertoire)} className="text-destructive focus:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}