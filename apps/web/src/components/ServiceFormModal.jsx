import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

const initialForm = {
  name: '',
  date: '',
  time: '',
  service_type: '',
  location: '',
  description: '',
  repertoire_id: 'none',
};

export default function ServiceFormModal({ open, onClose, onSuccess }) {
  const { activeOrganizationId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [repertoires, setRepertoires] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState([]);
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (!open || !activeOrganizationId) return;
    const fetchOptions = async () => {
      setOptionsLoading(true);
      try {
        const [repertoireResult, teamResult] = await Promise.all([
          supabase
            .from('repertoires')
            .select('id, name, status, song_count')
            .eq('organization_id', activeOrganizationId)
            .order('name'),
          supabase
            .from('teams')
            .select('id, name, description, team_members(count)')
            .eq('organization_id', activeOrganizationId)
            .eq('status', 'active')
            .order('name'),
        ]);
        if (repertoireResult.error) throw repertoireResult.error;
        if (teamResult.error) throw teamResult.error;
        setRepertoires(repertoireResult.data || []);
        setTeams(teamResult.data || []);
      } catch (error) {
        console.error('Error loading service options:', error);
        toast.error('No fue posible cargar repertorios y grupos');
      } finally {
        setOptionsLoading(false);
      }
    };
    fetchOptions();
  }, [open, activeOrganizationId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const toggleTeam = (teamId) => {
    setSelectedTeamIds((current) => current.includes(teamId)
      ? current.filter((id) => id !== teamId)
      : [...current, teamId]);
  };

  const reset = () => {
    setFormData(initialForm);
    setSelectedTeamIds([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name || !formData.date || !formData.time || !formData.service_type) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      const localServiceDate = new Date(`${formData.date}T12:00:00`);
      const { error } = await supabase.rpc('create_service_with_groups', {
        target_organization_id: activeOrganizationId,
        service_name: formData.name.trim(),
        service_date: localServiceDate.toISOString(),
        service_start_time: formData.time,
        service_type: formData.service_type,
        service_location: formData.location.trim(),
        service_description: formData.description.trim(),
        target_repertoire_id: formData.repertoire_id === 'none' ? null : formData.repertoire_id,
        target_team_ids: selectedTeamIds,
      });
      if (error) throw error;

      toast.success('Servicio creado y miembros asignados');
      reset();
      await onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error(error.message || 'No fue posible crear el servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear nuevo servicio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del servicio <span className="text-destructive">*</span></Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Ej. Servicio dominical" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha <span className="text-destructive">*</span></Label>
              <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Hora <span className="text-destructive">*</span></Label>
              <Input id="time" name="time" type="time" value={formData.time} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo de servicio <span className="text-destructive">*</span></Label>
              <Select value={formData.service_type} onValueChange={(value) => setFormData((current) => ({ ...current, service_type: value }))} required>
                <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sunday Service">Servicio dominical</SelectItem>
                  <SelectItem value="Prayer Meeting">Reunión de oración</SelectItem>
                  <SelectItem value="Youth Service">Servicio de jóvenes</SelectItem>
                  <SelectItem value="Wedding">Boda</SelectItem>
                  <SelectItem value="Funeral">Funeral</SelectItem>
                  <SelectItem value="Conference">Conferencia</SelectItem>
                  <SelectItem value="Special Event">Evento especial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Repertorio</Label>
              <Select value={formData.repertoire_id} onValueChange={(value) => setFormData((current) => ({ ...current, repertoire_id: value }))} disabled={optionsLoading}>
                <SelectTrigger><SelectValue placeholder="Seleccionar repertorio" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin repertorio</SelectItem>
                  {repertoires.map((repertoire) => (
                    <SelectItem key={repertoire.id} value={repertoire.id}>
                      {repertoire.name} ({repertoire.song_count || 0} canciones)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Grupos asignados</Label>
              <Badge variant="secondary">{selectedTeamIds.length} seleccionados</Badge>
            </div>
            <div className="max-h-52 overflow-y-auto rounded-lg border p-2">
              {optionsLoading ? (
                <p className="p-4 text-center text-sm text-muted-foreground">Cargando grupos...</p>
              ) : teams.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">Crea grupos desde la sección Grupos para asignarlos aquí.</p>
              ) : teams.map((team) => {
                const memberCount = team.team_members?.[0]?.count || 0;
                return (
                  <label key={team.id} htmlFor={`service-team-${team.id}`} className="flex cursor-pointer items-center gap-3 rounded-md p-3 hover:bg-muted/50">
                    <Checkbox id={`service-team-${team.id}`} checked={selectedTeamIds.includes(team.id)} onCheckedChange={() => toggleTeam(team.id)} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{team.name}</span>
                      {team.description && <span className="block truncate text-xs text-muted-foreground">{team.description}</span>}
                    </span>
                    <Badge variant="outline">{memberCount} miembros</Badge>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">Los integrantes de los grupos quedarán asignados al servicio; una persona en varios grupos se agrega una sola vez.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="Ej. Santuario principal" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Detalles del servicio" rows={3} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading || optionsLoading}>{loading ? 'Creando...' : 'Crear servicio'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
