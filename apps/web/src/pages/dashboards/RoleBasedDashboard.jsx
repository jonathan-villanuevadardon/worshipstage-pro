import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Users, Music, ArrowRight, Activity, Clock, Disc3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function RoleBasedDashboard() {
  const { currentUser, activeOrganizationId, activeOrganization } = useAuth();
  const [upcomingServices, setUpcomingServices] = useState([]);
  const [stats, setStats] = useState({ services: 0, songs: 0, team: 0 });
  const [loading, setLoading] = useState(true);

  const isFullAccess = ['super_admin', 'church_admin', 'pastor', 'worship_leader'].includes(currentUser?.role);

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser, activeOrganizationId]);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = addDays(new Date(), 7).toISOString().split('T')[0];

      if (!activeOrganizationId) return;
      let filterStr = `organization_id = "${activeOrganizationId}" && date >= "${today}" && date <= "${nextWeek}"`;
      
      if (['musician', 'volunteer'].includes(currentUser.role)) {
        const assignments = await pb.collection('service_assignments').getFullList({
          filter: `team_member_id = "${currentUser.id}"`,
          $autoCancel: false
        });
        const serviceIds = assignments.map(a => a.service_id);
        if (serviceIds.length > 0) {
          filterStr += ` && id ?= "${serviceIds.join('","')}"`;
        } else {
          filterStr += ` && id = "none"`;
        }
      }

      const services = await pb.collection('services').getFullList({
        filter: filterStr,
        sort: 'date',
        expand: 'repertoire_id,service_assignments_via_service_id.team_member_id',
        $autoCancel: false
      });
      setUpcomingServices(services);

      if (isFullAccess) {
        const allServices = await pb.collection('services').getList(1, 1, { filter: `organization_id = "${activeOrganizationId}"`, $autoCancel: false });
        const allSongs = await pb.collection('songs').getList(1, 1, { filter: `organization_id = "${activeOrganizationId}"`, $autoCancel: false });
        const allMembers = await pb.collection('users').getList(1, 1, { filter: `organization_id = "${activeOrganizationId}" && status="active"`, $autoCancel: false });
        
        setStats({
          services: allServices.totalItems,
          songs: allSongs.totalItems,
          team: allMembers.totalItems
        });
      }

    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return <LoadingSpinner text="Loading dashboard..." className="mt-20" />;

  return (
    <>
      <Helmet><title>Dashboard - WorshipStage Pro</title></Helmet>
      
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{getGreeting()}, {currentUser?.first_name || currentUser?.name || 'there'}!</h1>
          <p className="text-muted-foreground mt-1">Actividad de {activeOrganization?.name || 'tu iglesia'}.</p>
        </div>

        {isFullAccess && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="card-base card-hover bg-primary/5 border-primary/10">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary"><CalendarIcon className="w-6 h-6" /></div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Services</p>
                  <p className="text-2xl font-bold">{stats.services}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-base card-hover bg-secondary/5 border-secondary/10">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-xl text-secondary"><Music className="w-6 h-6" /></div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Library Songs</p>
                  <p className="text-2xl font-bold">{stats.songs}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-base card-hover bg-accent/5 border-accent/10">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-xl text-accent"><Users className="w-6 h-6" /></div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                  <p className="text-2xl font-bold">{stats.team}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="w-6 h-6 text-primary" /> Upcoming Services (7 Days)
              </h2>
              <Button variant="ghost" asChild>
                <Link to="/calendar" className="gap-2">View Calendar <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </div>

            {upcomingServices.length === 0 ? (
              <Card className="card-base p-12 text-center text-muted-foreground border-dashed">
                <CalendarIcon className="w-12 h-12 mx-auto opacity-20 mb-4" />
                <p className="text-lg font-medium">No upcoming services this week.</p>
                <p className="text-sm">Enjoy your rest!</p>
              </Card>
            ) : (
              upcomingServices.map(service => {
                const rep = service.expand?.repertoire_id;
                const assignments = service.expand?.service_assignments_via_service_id || [];
                const isAssigned = assignments.some(a => a.team_member_id === currentUser.id);

                return (
                  <Card key={service.id} className={`card-base transition-all ${isAssigned ? 'ring-2 ring-primary/50' : ''}`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardDescription className="text-primary font-semibold tracking-wide uppercase text-xs mb-1">
                            {format(new Date(service.date), 'EEEE, MMM d')}
                          </CardDescription>
                          <CardTitle className="text-xl">{service.title || service.name}</CardTitle>
                        </div>
                        {isAssigned && <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md">You're Assigned</span>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-secondary/10 p-4 rounded-xl border border-border">
                          <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><Music className="w-4 h-4 text-primary" /> Repertoire</h4>
                          {rep ? (
                            <div>
                              <p className="font-medium text-sm text-foreground truncate">{rep.name}</p>
                              <p className="text-xs text-muted-foreground">{rep.song_count || 0} songs</p>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">No repertoire attached</p>
                          )}
                        </div>
                        <div className="bg-muted/30 p-4 rounded-xl border border-border">
                          <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-primary" /> Time & Place</h4>
                          <p className="text-sm font-medium">{service.start_time || 'TBD'}</p>
                          <p className="text-xs text-muted-foreground">{service.location || 'Main Sanctuary'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <div className="space-y-6">
            <Card className="card-base bg-muted/10">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isFullAccess && (
                  <>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/calendar"><CalendarIcon className="w-4 h-4 mr-2" /> Plan a Service</Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/repertoires/new"><Music className="w-4 h-4 mr-2" /> Create Repertoire</Link>
                    </Button>
                  </>
                )}
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/availability"><Clock className="w-4 h-4 mr-2" /> My Availability</Link>
                </Button>
                {isFullAccess && (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/songs"><Music className="w-4 h-4 mr-2" /> Browse Songs</Link>
                  </Button>
                )}
                {!isFullAccess && (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/repertoires"><Disc3 className="w-4 h-4 mr-2" /> My Repertoires</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
