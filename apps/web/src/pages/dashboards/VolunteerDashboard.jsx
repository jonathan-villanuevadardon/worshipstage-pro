import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';
import EmptyState from '@/components/EmptyState';

export default function VolunteerDashboard() {
  const { currentUser } = useAuth();

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">View your schedule and assignments</p>
        </div>
        <div className="flex items-center gap-3 bg-card p-3 rounded-lg border border-border">
          <Label htmlFor="availability" className="font-medium">Available to serve</Label>
          <Switch id="availability" defaultChecked />
        </div>
      </div>

      <Card className="bg-card border-border mb-8">
        <CardHeader>
          <CardTitle>Upcoming Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState 
            icon={Calendar}
            title="No upcoming assignments"
            description="You are not scheduled for any upcoming services."
          />
        </CardContent>
      </Card>
    </div>
  );
}