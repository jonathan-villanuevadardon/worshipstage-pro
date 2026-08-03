import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
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

export default function RepertoireCard({ repertoire, onAction }) {
  const navigate = useNavigate();

  return (
    <Card className="group hover:shadow-lg hover:border-primary/50 transition-all duration-300 flex flex-col h-full bg-card">
      <CardContent className="p-5 flex-grow cursor-pointer" onClick={() => navigate(`/repertoires/${repertoire.id}`)}>
        <div className="flex justify-between items-start mb-3">
          <StatusBadge status={repertoire.status} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
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
        
        <h3 className="font-bold text-xl line-clamp-2 mb-2">{repertoire.name}</h3>
        
        <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20 mb-4">
          {repertoire.service_type}
        </Badge>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto pt-4 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-foreground">{repertoire.song_count || 0}</span> songs
          </div>
          <div className="w-1 h-1 rounded-full bg-border"></div>
          <DurationDisplay seconds={repertoire.total_duration} />
        </div>
      </CardContent>
    </Card>
  );
}