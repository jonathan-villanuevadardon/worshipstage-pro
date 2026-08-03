import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Users, Music, Plus } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { format } from 'date-fns';

export default function ChurchAdminDashboard() {
  const { currentUser, activeOrganizationId } = useAuth();
  const [data, setData] = useState({ services: [], orgName: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!activeOrganizationId) return;
        
        const [org, servicesResult] = await Promise.all([
          pb.collection('organizations').getOne(activeOrganizationId, { $autoCancel: false }),
          pb.collection('services').getList(1, 5, { 
            filter: `organization_id = "${activeOrganizationId}" && date >= "${new Date().toISOString().split('T')[0]}"`,
            sort: 'date',
            $autoCancel: false 
          })
        ]);

        setData({
          orgName: org.name,
          services: servicesResult.items
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeOrganizationId]);

  if (loading) return <LoadingSpinner text="Loading dashboard..." className="mt-20" />;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {currentUser?.first_name || 'Admin'}</h1>
          <p className="text-muted-foreground mt-1">{data.orgName || 'Your Organization'} Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Users className="w-4 h-4" /> Invite User
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> New Service
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.services.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Volunteers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Songs in Library</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">142</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" /> Next Services
          </h2>
          {data.services.length === 0 ? (
            <EmptyState 
              icon={CalendarIcon}
              title="No upcoming services"
              description="Schedule your next worship service to see it here."
              action={<Button variant="outline">Schedule Service</Button>}
            />
          ) : (
            <div className="space-y-4">
              {data.services.map(service => (
                <Card key={service.id} className="bg-card hover:border-primary/50 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{service.title}</h3>
                      <p className="text-sm text-muted-foreground">{format(new Date(service.date), 'MMMM d, yyyy')}</p>
                    </div>
                    <Button variant="ghost" size="sm">View Details</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Music className="w-5 h-5 text-secondary" /> Recent Activity
          </h2>
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Activity feed integration pending...
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
