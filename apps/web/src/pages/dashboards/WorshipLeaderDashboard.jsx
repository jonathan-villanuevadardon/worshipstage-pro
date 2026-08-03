import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Calendar, ListMusic } from 'lucide-react';
import EmptyState from '@/components/EmptyState';

export default function WorshipLeaderDashboard() {
  const { currentUser } = useAuth();

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Worship Leader Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your team and repertoire</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 bg-card hover:bg-muted">
          <Calendar className="w-6 h-6 text-primary" />
          <span>Plan Service</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 bg-card hover:bg-muted">
          <ListMusic className="w-6 h-6 text-secondary" />
          <span>Create Repertoire</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 bg-card hover:bg-muted">
          <Music className="w-6 h-6 text-emerald-500" />
          <span>Add Song</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Next Service Repertoire</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState 
              icon={ListMusic}
              title="No repertoire assigned"
              description="Create a setlist for the upcoming service."
            />
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Team Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground p-4 text-center">
              No active team assignments
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}