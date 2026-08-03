import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import pb from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function AssignmentModal({ open, onClose, onSuccess, preselectedService = null }) {
  const { activeOrganizationId } = useAuth();
  const [services, setServices] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [memberAvailability, setMemberAvailability] = useState({});
  const [memberWorkload, setMemberWorkload] = useState({});
  
  const [selectedService, setSelectedService] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('pending');
  const [notes, setNotes] = useState('');
  
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchServices();
      fetchTeamMembers();
      if (preselectedService) {
        setSelectedService(preselectedService.id);
      }
    }
  }, [open, preselectedService, activeOrganizationId]);

  useEffect(() => {
    if (selectedService) {
      const s = preselectedService || services.find(srv => srv.id === selectedService);
      if (s?.date) {
        fetchAvailabilityAndWorkload(s.date);
      }
    }
  }, [selectedService, services]);

  const fetchServices = async () => {
    try {
      const records = await pb.collection('services').getFullList({
        filter: `organization_id = "${activeOrganizationId}"`,
        sort: 'date',
        $autoCancel: false
      });
      setServices(records);
    } catch (error) {
      toast.error('Failed to load services');
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const records = await pb.collection('users').getFullList({
        filter: `organization_id = "${activeOrganizationId}" && status = "active"`,
        sort: 'name',
        $autoCancel: false
      });
      setTeamMembers(records);
    } catch (error) {
      toast.error('Failed to load team members');
    }
  };

  const fetchAvailabilityAndWorkload = async (dateStr) => {
    const formattedDate = new Date(dateStr).toISOString().split('T')[0];
    try {
      // Fetch availability
      const availRecords = await pb.collection('team_availability').getFullList({
        filter: `team_member_id.organization_id = "${activeOrganizationId}" && date >= "${formattedDate}" && date <= "${formattedDate} 23:59:59"`,
        $autoCancel: false
      });
      const availMap = {};
      availRecords.forEach(a => {
        availMap[a.team_member_id] = a.availability_status;
      });
      setMemberAvailability(availMap);

      // Fetch workload (existing assignments for this date)
      const assignments = await pb.collection('service_assignments').getFullList({
        filter: `service_id.organization_id = "${activeOrganizationId}" && assigned_date >= "${formattedDate}" && assigned_date <= "${formattedDate} 23:59:59"`,
        $autoCancel: false
      });
      const loadMap = {};
      assignments.forEach(a => {
        loadMap[a.team_member_id] = (loadMap[a.team_member_id] || 0) + 1;
      });
      setMemberWorkload(loadMap);
      
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  useEffect(() => {
    if (selectedMember && memberAvailability[selectedMember] === 'unavailable') {
      setValidationError('This member is marked as unavailable for this date.');
    } else {
      setValidationError('');
    }
  }, [selectedMember, memberAvailability]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedService || !selectedMember || !role) {
      toast.error('Please fill all required fields');
      return;
    }
    if (validationError) {
      toast.error('Cannot assign: ' + validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const service = preselectedService || services.find(s => s.id === selectedService);
      const dateStr = new Date(service.date).toISOString().split('T')[0];

      await pb.collection('service_assignments').create({
        service_id: selectedService,
        team_member_id: selectedMember,
        assigned_date: dateStr,
        role,
        status,
        notes
      }, { $autoCancel: false });

      toast.success('Member assigned successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'TM';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Team Member</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {!preselectedService && (
            <div className="space-y-2">
              <Label>Service *</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                <SelectContent>
                  {services.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title || s.name} ({new Date(s.date).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Team Member *</Label>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger><SelectValue placeholder="Select team member" /></SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {teamMembers.map(member => {
                  const avail = memberAvailability[member.id] || 'available';
                  const load = memberWorkload[member.id] || 0;
                  const isUnavailable = avail === 'unavailable' || avail === 'rest';

                  return (
                    <SelectItem key={member.id} value={member.id} disabled={isUnavailable}>
                      <div className="flex items-center justify-between w-full min-w-[300px]">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={pb.files.getUrl(member, member.avatar)} />
                            <AvatarFallback className="text-[10px]">{getInitials(member.name || member.email)}</AvatarFallback>
                          </Avatar>
                          <span className={isUnavailable ? 'opacity-50' : ''}>{member.name || member.email}</span>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {load > 0 && <Badge variant="outline" className="text-[10px]">{load} assignments</Badge>}
                          {avail === 'unavailable' && <Badge variant="destructive" className="text-[10px]">Unavailable</Badge>}
                          {avail === 'rest' && <Badge className="bg-yellow-500 hover:bg-yellow-600 text-[10px]">Rest</Badge>}
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Worship Leader">Worship Leader</SelectItem>
                  <SelectItem value="Vocals">Vocals</SelectItem>
                  <SelectItem value="Acoustic Guitar">Acoustic Guitar</SelectItem>
                  <SelectItem value="Electric Guitar">Electric Guitar</SelectItem>
                  <SelectItem value="Bass">Bass</SelectItem>
                  <SelectItem value="Drums">Drums</SelectItem>
                  <SelectItem value="Keys">Keys</SelectItem>
                  <SelectItem value="Sound Tech">Sound Tech</SelectItem>
                  <SelectItem value="Lyrics Tech">Lyrics Tech</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes for this assignment"
              className="bg-background"
            />
          </div>

          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || !!validationError || !selectedMember || !role}>
              {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
