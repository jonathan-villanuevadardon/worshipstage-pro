import React, { useEffect, useState } from 'react';
import pb from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, CreditCard, Activity } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { motion } from 'framer-motion';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [orgs, users] = await Promise.all([
          pb.collection('organizations').getList(1, 1, { $autoCancel: false }),
          pb.collection('users').getList(1, 1, { $autoCancel: false }),
        ]);
        
        setStats({
          totalOrgs: orgs.totalItems,
          totalUsers: users.totalItems,
          activeSubscriptions: Math.floor(orgs.totalItems * 0.8), // Mock metric
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner text="Loading platform data..." className="mt-20" />;

  const statCards = [
    { title: 'Total Organizations', value: stats?.totalOrgs || 0, icon: Building2, color: 'text-blue-500' },
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-purple-500' },
    { title: 'Active Subscriptions', value: stats?.activeSubscriptions || 0, icon: CreditCard, color: 'text-emerald-500' },
    { title: 'Platform Health', value: '99.9%', icon: Activity, color: 'text-rose-500' },
  ];

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Super Admin Overview</h1>
        <p className="text-muted-foreground mt-2">Platform-wide statistics and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-border bg-card shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 border-border bg-card">
          <CardHeader>
            <CardTitle>Recent Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Feature coming soon: Dynamic organization feed.
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>All systems operational</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}