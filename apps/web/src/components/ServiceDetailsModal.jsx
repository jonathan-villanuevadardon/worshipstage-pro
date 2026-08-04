import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Printer, Edit, Trash2, MapPin, Clock, Users, Music, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import apiServerClient from '@/lib/apiServerClient';
import { generateServicePdf } from '@/lib/servicePrint.js';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from './ConfirmDialog.jsx';

export default function ServiceDetailsModal({ service, open, onClose, onRefresh, onEdit }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  if (!service) return null;

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const canEdit = ['super_admin', 'church_admin', 'pastor', 'worship_leader'].includes(currentUser?.role);

  const handleDelete = async () => {
    if (!isSuperAdmin) {
      toast.error('Forbidden: Only Super Admins can delete services.');
      setDeleteConfirmOpen(false);
      return;
    }
    try {
      setIsDeleting(true);
      const response = await apiServerClient.fetch(`/services/${service.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete service');
      }
      toast.success('Service deleted successfully');
      setDeleteConfirmOpen(false);
      onClose();
      await onRefresh?.();
    } catch (error) {
      toast.error(error.message || 'An error occurred while deleting');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      toast.info('Generating PDF...');
      await generateServicePdf(service);
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex justify-between items-start pr-6">
              <div>
                <Badge variant="secondary" className="mb-2">{service.service_type}</Badge>
                <DialogTitle className="text-2xl">{service.title || service.name}</DialogTitle>
                <p className="text-muted-foreground mt-1">{format(new Date(service.date), 'EEEE, MMMM d, yyyy')}</p>
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span><span className="font-medium">Time:</span> {service.start_time || 'TBD'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span><span className="font-medium">Location:</span> {service.location || 'Not specified'}</span>
              </div>
              {service.theme && (
                <div className="flex items-center gap-3 text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span><span className="font-medium">Theme:</span> {service.theme}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Music className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Repertoire:</span>
                {service.expand?.repertoire_id ? (
                  <Button variant="link" className="h-auto p-0" onClick={() => navigate(`/repertoires/${service.repertoire_id}`)}>
                    {service.expand.repertoire_id.name}
                  </Button>
                ) : (
                  <span className="text-muted-foreground italic">None assigned</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>
                  <span className="font-medium">Team:</span>{' '}
                  {service.expand?.service_assignments_via_service_id?.length || 0} members assigned
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-border mt-4 justify-between">
            <Button variant="secondary" onClick={handlePrint} disabled={isPrinting} className="gap-2">
              <Printer className="w-4 h-4" /> {isPrinting ? 'Generating...' : 'Print Sheet'}
            </Button>

            <div className="flex gap-2">
              {canEdit && (
                <Button variant="outline" className="gap-2" onClick={() => onEdit?.(service)}>
                  <Edit className="w-4 h-4" /> Edit
                </Button>
              )}
              {isSuperAdmin && (
                <Button variant="destructive" className="gap-2" onClick={() => setDeleteConfirmOpen(true)}>
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Service"
        description="Are you sure you want to delete this service? This action cannot be undone."
        confirmText={isDeleting ? 'Deleting...' : 'Delete Service'}
        onConfirm={handleDelete}
      />
    </>
  );
}
