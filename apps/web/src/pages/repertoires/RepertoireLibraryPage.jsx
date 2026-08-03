import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, ListMusic, Calendar as CalendarIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusBadge from '@/components/StatusBadge';
import { toast } from 'sonner';

export default function RepertoireLibraryPage() {
  const { currentUser, activeOrganizationId } = useAuth();
  const navigate = useNavigate();
  const [repertoires, setRepertoires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const isBasicMember = ['musician', 'volunteer'].includes(currentUser?.role);

  useEffect(() => {
    fetchRepertoires();
  }, [currentUser, activeOrganizationId]);

  const fetchRepertoires = async () => {
    if (!activeOrganizationId) return;
    setLoading(true);

    try {
      if (isBasicMember) {
        // Find assigned services first
        const assignments = await pb.collection('service_assignments').getFullList({
          filter: `team_member_id="${currentUser.id}"`,
          expand: 'service_id',
          $autoCancel: false
        });

        const repIds = assignments
          .map(a => a.expand?.service_id?.repertoire_id)
          .filter(Boolean); // removes undefined/null

        if (repIds.length > 0) {
          const filterStr = repIds.map(id => `id="${id}"`).join(' || ');
          const reps = await pb.collection('repertoires').getFullList({
            filter: `(${filterStr}) && status="published"`,
            expand: 'created_by',
            sort: '-created',
            $autoCancel: false
          });
          setRepertoires(reps);
        } else {
          setRepertoires([]);
        }
      } else {
        // Full access for admins and leaders
        const reps = await pb.collection('repertoires').getFullList({
          filter: `organization_id="${activeOrganizationId}"`,
          expand: 'created_by',
          sort: '-created',
          $autoCancel: false
        });
        setRepertoires(reps);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load repertoires');
    } finally {
      setLoading(false);
    }
  };

  const filteredRepertoires = repertoires.filter(rep => 
    rep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.service_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet><title>Repertoires - WorshipStage Pro</title></Helmet>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Repertoires</h1>
            <p className="text-muted-foreground mt-1">
              {isBasicMember ? 'View repertoires for your assigned services.' : 'Manage and organize service repertoires.'}
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search repertoires..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {!isBasicMember && (
              <Button asChild className="gap-2 shrink-0">
                <Link to="/repertoires/new">
                  <Plus className="w-4 h-4" /> Nuevo Repertorio
                </Link>
              </Button>
            )}
          </div>
        </div>

        {isBasicMember && (
          <div className="mb-6">
            <Badge variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
              <CalendarIcon className="w-4 h-4 mr-2 inline-block" /> My Assigned Repertoires
            </Badge>
          </div>
        )}

        {loading ? (
          <LoadingSpinner text="Loading repertoires..." className="mt-20" />
        ) : filteredRepertoires.length === 0 ? (
          <Card className="card-base border-dashed bg-muted/10 p-12 text-center">
            <ListMusic className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No repertoires found</h3>
            {isBasicMember ? (
              <p className="text-muted-foreground">You don't have any assigned services with published repertoires right now.</p>
            ) : (
              <p className="text-muted-foreground mb-6">Create your first repertoire to get started planning services.</p>
            )}
            {!isBasicMember && (
              <Button asChild>
                <Link to="/repertoires/new"><Plus className="w-4 h-4 mr-2" /> Create Repertoire</Link>
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRepertoires.map(rep => (
              <Card 
                key={rep.id} 
                className="card-base card-hover cursor-pointer flex flex-col h-full"
                onClick={() => navigate(`/repertoires/${rep.id}`)}
              >
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary border-none">{rep.service_type}</Badge>
                    <StatusBadge status={rep.status} />
                  </div>
                  
                  <h3 className="text-xl font-bold leading-tight mb-2">{rep.name}</h3>
                  {rep.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{rep.description}</p>
                  )}
                  
                  <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><ListMusic className="w-4 h-4" /> {rep.song_count || 0} songs</span>
                    <span>{new Date(rep.created).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
