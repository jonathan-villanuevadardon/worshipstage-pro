import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import pb from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';

export default function CreateTeamMemberModal({ open, onClose, onSuccess }) {
  const { currentUser, activeOrganizationId } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'volunteer',
    initialAvailability: 'available'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.role) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const tempPassword = crypto.randomUUID().slice(0, 12) + 'aA1!';
      
      const newUser = await pb.collection('users').create({
        email: formData.email,
        password: tempPassword,
        passwordConfirm: tempPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        role: formData.role,
        status: 'active',
        organization_id: activeOrganizationId
      }, { $autoCancel: false });

      toast.success('Team member created', {
        description: `Temporary password: ${tempPassword}`,
        duration: 20000,
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error?.message || error?.response?.message || 'Failed to create team member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input
                required
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="bg-background text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="pl-9 bg-background text-foreground"
                placeholder="member@church.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Role *</Label>
            <Select 
              value={formData.role} 
              onValueChange={(val) => setFormData(prev => ({ ...prev, role: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="worship_leader">Worship Leader</SelectItem>
                <SelectItem value="musician">Musician</SelectItem>
                <SelectItem value="volunteer">Volunteer</SelectItem>
                <SelectItem value="pastor">Pastor</SelectItem>
                {currentUser?.role === 'super_admin' && (
                  <SelectItem value="church_admin">Church Admin</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Initial Availability</Label>
            <Select 
              value={formData.initialAvailability} 
              onValueChange={(val) => setFormData(prev => ({ ...prev, initialAvailability: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Add Team Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
