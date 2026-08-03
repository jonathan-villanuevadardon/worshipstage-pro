import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/supabaseClient';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AssignMembersModal({ open, onClose, service, onSuccess }) {
  const { activeOrganizationId } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (open && service) {
      fetchUsersAndExistingAssignments();
    }
  }, [open, service]);

  const fetchUsersAndExistingAssignments = async () => {
    setLoading(true);
    try {
      const [membersData, existingAssignments] = await Promise.all([
        pb.collection('users').getFullList({
          filter: `organization_id = "${activeOrganizationId}" && status="active"`,
          sort: 'name',
          $autoCancel: false
        }),
        pb.collection('service_assignments').getFullList({
          filter: `service_id = "${service.id}"`,
          $autoCancel: false
        })
      ]);
      
      setUsers(membersData);
      
      const preSelected = existingAssignments.map(a => a.team_member_id);
      setSelectedIds(preSelected);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const existingAssignments = await pb.collection('service_assignments').getFullList({
        filter: `service_id = "${service.id}"`,
        $autoCancel: false
      });

      const existingIds = existingAssignments.map(a => a.team_member_id);
      const toRemove = existingAssignments.filter(a => !selectedIds.includes(a.team_member_id));
      const toAdd = selectedIds.filter(id => !existingIds.includes(id));

      await Promise.all(toRemove.map(a => 
        pb.collection('service_assignments').delete(a.id, { $autoCancel: false })
      ));

      const dateStr = new Date(service.date).toISOString().split('T')[0];
      await Promise.all(toAdd.map(uid => 
        pb.collection('service_assignments').create({
          service_id: service.id,
          team_member_id: uid,
          role: 'member',
          status: 'pending',
          assigned_date: dateStr
        }, { $autoCancel: false })
      ));

      toast.success('Assignments updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating assignments:', error);
      toast.error('Failed to update assignments');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Asignar Miembros al Servicio</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {loading ? (
            <LoadingSpinner text="Loading members..." />
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground">No active members found.</p>
          ) : (
            <div className="grid gap-3">
              {users.map(user => {
                const avatarUrl = user.avatar ? pb.files.getUrl(user, user.avatar) : undefined;
                const isSelected = selectedIds.includes(user.id);
                return (
                  <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox 
                      id={`user-${user.id}`} 
                      checked={isSelected}
                      onCheckedChange={() => handleToggle(user.id)}
                    />
                    <Label htmlFor={`user-${user.id}`} className="flex items-center gap-3 flex-1 cursor-pointer">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm leading-none">{user.name || 'Unnamed User'}</span>
                        <span className="text-xs text-muted-foreground">{user.role}</span>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t border-border mt-auto">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save Assignments'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
