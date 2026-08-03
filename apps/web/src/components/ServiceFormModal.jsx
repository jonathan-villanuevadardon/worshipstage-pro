import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/supabaseClient';
import { toast } from 'sonner';

export default function ServiceFormModal({ open, onClose, onSuccess }) {
  const { currentUser, activeOrganizationId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    service_type: '',
    location: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, service_type: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.date || !formData.time || !formData.service_type) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await pb.collection('services').create({
        name: formData.name,
        title: formData.name,
        date: formData.date,
        start_time: formData.time,
        service_type: formData.service_type,
        location: formData.location,
        description: formData.description,
        status: 'planning',
        organization_id: activeOrganizationId,
        created_by: currentUser.id
      }, { $autoCancel: false });

      toast.success('Service created successfully');
      setFormData({ name: '', date: '', time: '', service_type: '', location: '', description: '' });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Servicio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name <span className="text-destructive">*</span></Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Sunday Morning Worship" required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date <span className="text-destructive">*</span></Label>
              <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time <span className="text-destructive">*</span></Label>
              <Input id="time" name="time" type="time" value={formData.time} onChange={handleChange} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service_type">Service Type <span className="text-destructive">*</span></Label>
            <Select value={formData.service_type} onValueChange={handleSelectChange} required>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sunday Service">Sunday Service</SelectItem>
                <SelectItem value="Prayer Meeting">Prayer Meeting</SelectItem>
                <SelectItem value="Youth Service">Youth Service</SelectItem>
                <SelectItem value="Wedding">Wedding</SelectItem>
                <SelectItem value="Funeral">Funeral</SelectItem>
                <SelectItem value="Conference">Conference</SelectItem>
                <SelectItem value="Special Event">Special Event</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Main Sanctuary" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Any specific details..." rows={3} />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Service'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
