import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import RolePermissionsModal from '@/components/RolePermissionsModal';

const DEFAULT_ROLES = [
  { role_name: 'super_admin', description: 'Full access to all system features', permissions: ['create_services', 'edit_services', 'assign_members', 'view_reports', 'manage_users', 'manage_roles', 'manage_teams', 'view_analytics'], is_custom: false },
  { role_name: 'pastor', description: 'Manage services, members, and reports', permissions: ['create_services', 'edit_services', 'assign_members', 'view_reports', 'manage_users'], is_custom: false },
  { role_name: 'worship_leader', description: 'Create services and assign team members', permissions: ['create_services', 'edit_services', 'assign_members', 'view_reports'], is_custom: false },
  { role_name: 'musician', description: 'View assigned services and repertoires', permissions: [], is_custom: false },
  { role_name: 'volunteer', description: 'View assigned services', permissions: [], is_custom: false }
];

export default function RoleManagementPage() {
  const { activeOrganizationId } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  useEffect(() => {
    fetchRoles();
  }, [activeOrganizationId]);

  const fetchRoles = async () => {
    try {
      const records = await pb.collection('role_permissions').getFullList({
        filter: `organization_id = "${activeOrganizationId}"`,
        $autoCancel: false
      });
      
      // Merge with defaults if missing
      const merged = [...DEFAULT_ROLES];
      records.forEach(r => {
        const existingIdx = merged.findIndex(m => m.role_name === r.role_name);
        if (existingIdx >= 0) {
          merged[existingIdx] = r;
        } else {
          merged.push(r);
        }
      });
      
      setRoles(merged);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setModalOpen(true);
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setModalOpen(true);
  };

  if (loading) return <LoadingSpinner text="Loading roles..." className="mt-20" />;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground mt-1">Configure permissions for different roles in your organization</p>
        </div>
        <Button onClick={handleCreateRole} className="gap-2">
          <Plus className="w-4 h-4" /> Create Custom Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role, idx) => (
          <Card key={role.id || idx} className="card-base flex flex-col h-full card-hover">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  {role.role_name.replace('_', ' ')}
                </CardTitle>
                {role.is_custom && <Badge variant="outline">Custom</Badge>}
              </div>
              <CardDescription className="pt-2">{role.description || 'No description provided.'}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {role.permissions?.length || 0} permissions granted
                </p>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {role.permissions?.slice(0, 4).map(p => (
                    <span key={p} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">
                      {p.replace('_', ' ')}
                    </span>
                  ))}
                  {role.permissions?.length > 4 && (
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">
                      +{role.permissions.length - 4} more
                    </span>
                  )}
                </div>
              </div>
              <Button 
                variant="secondary" 
                className="w-full mt-auto" 
                onClick={() => handleEditRole(role)}
              >
                <Settings2 className="w-4 h-4 mr-2" />
                Edit Permissions
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <RolePermissionsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        roleData={editingRole}
        onSuccess={fetchRoles}
      />
    </div>
  );
}
