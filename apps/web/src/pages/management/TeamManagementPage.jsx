import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import pb, { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConfirmDialog from '@/components/ConfirmDialog';
import { UsersRound, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

const emptyForm = { name: '', description: '' };

function displayName(user) {
  return user.name || [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;
}

export default function TeamManagementPage() {
  const { activeOrganizationId } = useAuth();
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    if (!activeOrganizationId) return;
    setLoading(true);
    try {
      const [teamsResult, usersResult] = await Promise.all([
        supabase
          .from('teams')
          .select('*, team_members(id, user_id, role)')
          .eq('organization_id', activeOrganizationId)
          .order('name'),
        supabase
          .from('users')
          .select('id, email, name, first_name, last_name, role, status')
          .eq('organization_id', activeOrganizationId)
          .eq('status', 'active')
          .order('name'),
      ]);

      if (teamsResult.error) throw teamsResult.error;
      if (usersResult.error) throw usersResult.error;
      setTeams(teamsResult.data || []);
      setUsers(usersResult.data || []);
    } catch (error) {
      console.error(error);
      toast.error('No fue posible cargar los grupos');
    } finally {
      setLoading(false);
    }
  }, [activeOrganizationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const userMap = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);
  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) => `${displayName(user)} ${user.email} ${user.role}`.toLowerCase().includes(term));
  }, [search, users]);

  const openCreate = () => {
    setEditingTeam(null);
    setFormData(emptyForm);
    setSelectedUserIds([]);
    setSearch('');
    setModalOpen(true);
  };

  const openEdit = (team) => {
    setEditingTeam(team);
    setFormData({ name: team.name || '', description: team.description || '' });
    setSelectedUserIds((team.team_members || []).map((member) => member.user_id));
    setSearch('');
    setModalOpen(true);
  };

  const toggleUser = (userId) => {
    setSelectedUserIds((current) => current.includes(userId)
      ? current.filter((id) => id !== userId)
      : [...current, userId]);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (formData.name.trim().length < 2) {
      toast.error('Escribe un nombre de grupo válido');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.rpc('save_team_with_members', {
        target_team_id: editingTeam?.id || null,
        target_organization_id: activeOrganizationId,
        team_name: formData.name.trim(),
        team_description: formData.description.trim(),
        member_user_ids: selectedUserIds,
      });
      if (error) throw error;

      toast.success(editingTeam ? 'Grupo actualizado' : 'Grupo creado');
      setModalOpen(false);
      await fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'No fue posible guardar el grupo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await pb.collection('teams').delete(deleteTarget.id);
      toast.success('Grupo eliminado');
      setDeleteTarget(null);
      await fetchData();
    } catch (error) {
      console.error(error);
      toast.error('No fue posible eliminar el grupo');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Cargando grupos..." className="mt-20" />;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grupos</h1>
          <p className="text-muted-foreground mt-1">
            Organiza miembros en uno o varios grupos para asignarlos rápidamente a los servicios.
          </p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Crear grupo
        </Button>
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Miembros</TableHead>
                  <TableHead>Integrantes</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      Aún no hay grupos. Crea el primero y selecciona sus integrantes.
                    </TableCell>
                  </TableRow>
                ) : teams.map((team) => {
                  const members = (team.team_members || [])
                    .map((member) => userMap.get(member.user_id))
                    .filter(Boolean);
                  return (
                    <TableRow key={team.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="font-medium">{team.name}</div>
                        {team.description && <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">{team.description}</div>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-primary/20 text-primary">
                          {members.length} {members.length === 1 ? 'miembro' : 'miembros'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {members.length === 0 ? (
                            <span className="text-sm text-muted-foreground">Sin integrantes</span>
                          ) : members.slice(0, 4).map((member) => (
                            <Badge key={member.id} variant="secondary">{displayName(member)}</Badge>
                          ))}
                          {members.length > 4 && <Badge variant="secondary">+{members.length - 4}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">{team.status || 'active'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(team)} aria-label={`Editar ${team.name}`}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => setDeleteTarget(team)} aria-label={`Eliminar ${team.name}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingTeam ? 'Editar grupo' : 'Crear grupo'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="group-name">Nombre del grupo *</Label>
                <Input
                  id="group-name"
                  value={formData.name}
                  onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Ej. Grupo A"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-search">Buscar miembros</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="member-search" value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Nombre, correo o rol" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-description">Descripción</Label>
              <Textarea
                id="group-description"
                value={formData.description}
                onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                placeholder="Propósito o ministerio del grupo"
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Integrantes</Label>
              <Badge variant="secondary">{selectedUserIds.length} seleccionados</Badge>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border p-2">
              {filteredUsers.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">No se encontraron miembros activos.</p>
              ) : filteredUsers.map((user) => (
                <label key={user.id} htmlFor={`group-user-${user.id}`} className="flex cursor-pointer items-center gap-3 rounded-md p-3 hover:bg-muted/50">
                  <Checkbox id={`group-user-${user.id}`} checked={selectedUserIds.includes(user.id)} onCheckedChange={() => toggleUser(user.id)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{displayName(user)}</span>
                    <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                  </span>
                  <Badge variant="outline" className="capitalize">{user.role.replaceAll('_', ' ')}</Badge>
                </label>
              ))}
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar grupo'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}
        title="Eliminar grupo"
        description={`Se eliminará “${deleteTarget?.name || ''}”. Los servicios ya asignados conservarán a sus integrantes.`}
        confirmText={deleting ? 'Eliminando...' : 'Eliminar'}
        cancelText="Cancelar"
        onConfirm={handleDelete}
      />
    </div>
  );
}
