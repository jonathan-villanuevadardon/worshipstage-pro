import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import pb from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const AVAILABLE_PERMISSIONS = [
  { id: 'create_services', label: 'Create Services' },
  { id: 'edit_services', label: 'Edit Services' },
  { id: 'assign_members', label: 'Assign Members' },
  { id: 'view_reports', label: 'View Reports' },
  { id: 'manage_users', label: 'Manage Users' },
  { id: 'manage_roles', label: 'Manage Roles' },
  { id: 'manage_teams', label: 'Manage Teams' },
  { id: 'view_analytics', label: 'View Analytics' }
];

export default function RolePermissionsModal({ open, onClose, roleData, onSuccess }) {
  const { currentUser, activeOrganizationId } = useAuth();
  const [formData, setFormData] = useState({
    role_name: '',
    description: '',
    permissions: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && roleData) {
      setFormData({
        role_name: roleData.role_name || '',
        description: roleData.description || '',
        permissions: roleData.permissions || []
      });
    } else if (open && !roleData) {
      setFormData({
        role_name: '',
        description: '',
        permissions: []
      });
    }
  }, [open, roleData]);

  const handleTogglePermission = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role_name) {
      toast.error('Role name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSave = {
        ...formData,
        organization_id: activeOrganizationId,
        is_custom: !['super_admin', 'pastor', 'worship_leader', 'musician', 'volunteer'].includes(formData.role_name.toLowerCase())
      };

      if (roleData?.id) {
        await pb.collection('role_permissions').update(roleData.id, dataToSave, { $autoCancel: false });
        toast.success('Role permissions updated');
      } else {
        await pb.collection('role_permissions').create(dataToSave, { $autoCancel: false });
        toast.success('New role created');
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error('Failed to save role permissions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canEdit = ['super_admin', 'pastor', 'worship_leader'].includes(currentUser?.role);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{roleData ? 'Edit Role Permissions' : 'Create Custom Role'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Role Name</Label>
              <Input
                value={formData.role_name}
                onChange={(e) => setFormData(prev => ({ ...prev, role_name: e.target.value }))}
                placeholder="e.g. Guest Speaker"
                disabled={!canEdit || (roleData && !roleData.is_custom)}
                className="bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this role"
                disabled={!canEdit}
                className="bg-background"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Permissions</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border rounded-xl p-4 bg-muted/30">
              {AVAILABLE_PERMISSIONS.map((perm) => (
                <div key={perm.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`perm-${perm.id}`}
                    checked={formData.permissions.includes(perm.id)}
                    onCheckedChange={() => handleTogglePermission(perm.id)}
                    disabled={!canEdit}
                  />
                  <label
                    htmlFor={`perm-${perm.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {perm.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            {canEdit && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Permissions'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
