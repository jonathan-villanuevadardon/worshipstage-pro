import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import pb, { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Loader2, UserCheck, UserPlus, UserX, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import CreateTeamMemberModal from '@/components/CreateTeamMemberModal';

async function invokeUserManagementAction(body) {
  const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
  if (refreshError || !refreshed.session) {
    const sessionError = new Error('Tu sesión venció. Inicia sesión nuevamente.');
    sessionError.code = 'SESSION_EXPIRED';
    throw sessionError;
  }

  const { data, error } = await supabase.functions.invoke('admin-manage-user', { body });
  if (error) {
    let message = error.message;
    try {
      const details = await error.context?.json();
      message = details?.error || details?.message || message;
    } catch {
      // The relay did not return a JSON error body.
    }
    const functionError = new Error(message || 'No fue posible completar la acción.');
    functionError.code = error.context?.status === 401 ? 'SESSION_EXPIRED' : 'FUNCTION_ERROR';
    throw functionError;
  }
  if (data?.error) throw new Error(data.error);

  return data;
}

async function showManagementError(error, fallbackMessage) {
  if (error?.code === 'SESSION_EXPIRED' || /session not found|invalid jwt|jwt expired/i.test(error?.message || '')) {
    toast.error('Tu sesión venció. Inicia sesión nuevamente.');
    await supabase.auth.signOut({ scope: 'local' });
    window.setTimeout(() => window.location.assign('/login'), 700);
    return;
  }

  toast.error(error?.message || fallbackMessage);
}

export default function UserManagementPage() {
  const { currentUser, activeOrganizationId } = useAuth();
  const [users, setUsers] = useState([]);
  const [workloads, setWorkloads] = useState({});
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    fetchUsers();
    
    pb.collection('users').subscribe('*', (e) => {
      if (e.action === 'create' || e.action === 'update') {
        fetchUsers();
      } else if (e.action === 'delete') {
        setUsers(prev => prev.filter(u => u.id !== e.record.id));
      }
    });

    return () => {
      pb.collection('users').unsubscribe('*');
    };
  }, [currentUser, activeOrganizationId]);

  const fetchUsers = async () => {
    try {
      const result = await pb.collection('users').getList(1, 100, {
        filter: `organization_id = "${activeOrganizationId}"`,
        sort: '-created',
        $autoCancel: false
      });
      setUsers(result.items);
      fetchWorkloads(result.items.map(u => u.id));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkloads = async (userIds) => {
    try {
      // Mocking workload by fetching assignments for these users
      const assignments = await pb.collection('service_assignments').getFullList({
        filter: `service_id.organization_id = "${activeOrganizationId}"`,
        $autoCancel: false
      });
      
      const counts = {};
      userIds.forEach(id => counts[id] = 0);
      
      assignments.forEach(a => {
        if (counts[a.team_member_id] !== undefined) {
          counts[a.team_member_id]++;
        }
      });
      setWorkloads(counts);
    } catch (err) {
      console.error('Failed to load workloads:', err);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await pb.collection('users').update(userId, { role: newRole }, { $autoCancel: false });
      toast.success('Role updated successfully');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error(err);
      toast.error('Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    const user = users.find((item) => item.id === userId);
    const displayName = user?.first_name || user?.name || user?.email || 'este usuario';
    if (!window.confirm(`¿Eliminar permanentemente a ${displayName}? Esta acción no se puede deshacer y también eliminará sus asignaciones.`)) return;

    setPendingAction({ userId, type: 'delete' });
    try {
      await invokeUserManagementAction({ action: 'delete', target_user_id: userId });

      setUsers((current) => current.filter((item) => item.id !== userId));
      setWorkloads((current) => {
        const next = { ...current };
        delete next[userId];
        return next;
      });
      toast.success('Usuario eliminado permanentemente.');
    } catch (err) {
      console.error(err);
      await showManagementError(err, 'No fue posible eliminar al usuario.');
    } finally {
      setPendingAction(null);
    }
  };

  const handleStatusChange = async (user) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    const actionLabel = nextStatus === 'inactive' ? 'deshabilitar' : 'reactivar';
    const displayName = user.first_name || user.name || user.email;
    if (!window.confirm(`¿Deseas ${actionLabel} a ${displayName}?`)) return;

    setPendingAction({ userId: user.id, type: 'status' });
    try {
      await invokeUserManagementAction({
        action: 'set_status',
        target_user_id: user.id,
        status: nextStatus,
      });

      setUsers((current) => current.map((item) => (
        item.id === user.id ? { ...item, status: nextStatus } : item
      )));
      toast.success(nextStatus === 'inactive' ? 'Usuario deshabilitado.' : 'Usuario reactivado.');
    } catch (err) {
      console.error(err);
      await showManagementError(err, 'No fue posible cambiar el estado del usuario.');
    } finally {
      setPendingAction(null);
    }
  };

  const canManage = ['super_admin', 'pastor', 'worship_leader'].includes(currentUser?.role);
  const canChangeStatus = ['super_admin', 'church_admin', 'pastor'].includes(currentUser?.role);
  const canPermanentlyDelete = currentUser?.role === 'super_admin';

  if (loading) return <LoadingSpinner text="Loading users..." className="mt-20" />;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground mt-1">Manage users, roles, and view workloads</p>
        </div>
        {canManage && (
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
            <UserPlus className="w-4 h-4" /> Add Team Member
          </Button>
        )}
      </div>

      <Card className="card-base overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Workload</TableHead>
                  {(canManage || canChangeStatus) && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No team members found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map(user => (
                    <TableRow key={user.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="font-medium">
                        {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : user.name || 'Unnamed'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        {canManage && user.id !== currentUser.id ? (
                          <Select 
                            defaultValue={user.role} 
                            onValueChange={(val) => handleRoleChange(user.id, val)}
                          >
                            <SelectTrigger className="w-[140px] h-8 bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="worship_leader">Worship Leader</SelectItem>
                              <SelectItem value="pastor">Pastor</SelectItem>
                              <SelectItem value="musician">Musician</SelectItem>
                              <SelectItem value="volunteer">Volunteer</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="secondary" className="capitalize">
                            {user.role.replace('_', ' ')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'outline'} className={user.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : ''}>
                          {user.status || 'active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className="font-medium">{workloads[user.id] || 0}</span>
                          <span className="text-muted-foreground">assignments</span>
                        </div>
                      </TableCell>
                      {(canManage || canChangeStatus) && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {user.id !== currentUser.id && user.role !== 'super_admin' && canChangeStatus && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5"
                                title={user.status === 'active' ? 'Deshabilitar usuario' : 'Reactivar usuario'}
                                aria-label={user.status === 'active' ? `Deshabilitar a ${user.email}` : `Reactivar a ${user.email}`}
                                disabled={pendingAction?.userId === user.id}
                                onClick={() => handleStatusChange(user)}
                              >
                                {pendingAction?.userId === user.id && pendingAction.type === 'status' ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : user.status === 'active' ? (
                                  <UserX className="h-4 w-4" />
                                ) : (
                                  <UserCheck className="h-4 w-4" />
                                )}
                                {user.status === 'active' ? 'Deshabilitar' : 'Reactivar'}
                              </Button>
                            )}
                            {user.id !== currentUser.id && user.role !== 'super_admin' && canPermanentlyDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1.5 text-destructive hover:text-destructive"
                                title="Eliminar permanentemente"
                                aria-label={`Eliminar permanentemente a ${user.email}`}
                                disabled={pendingAction?.userId === user.id}
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                {pendingAction?.userId === user.id && pendingAction.type === 'delete' ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                                Eliminar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CreateTeamMemberModal 
        open={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
