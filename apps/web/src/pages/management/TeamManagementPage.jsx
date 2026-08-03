import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { KeyRound as UsersRound, Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TeamManagementPage() {
  const { activeOrganizationId } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const result = await pb.collection('teams').getList(1, 50, {
          filter: `organization_id = "${activeOrganizationId}"`,
          expand: 'leader_id',
          sort: 'name',
          $autoCancel: false
        });
        setTeams(result.items);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load teams');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [activeOrganizationId]);

  if (loading) return <LoadingSpinner text="Loading teams..." className="mt-20" />;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground mt-1">Manage ministry departments and serving groups</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Create Team
        </Button>
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Leader</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No teams found. Create your first team to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  teams.map(team => (
                    <TableRow key={team.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize border-primary/20 text-primary">
                          {team.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {team.expand?.leader_id ? `${team.expand.leader_id.first_name} ${team.expand.leader_id.last_name}` : 'Unassigned'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {team.status || 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
