import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/supabaseClient';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AssignRepertoireModal({ open, onClose, service, onSuccess }) {
  const { activeOrganizationId } = useAuth();
  const [repertoires, setRepertoires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    if (open && service) {
      fetchRepertoires();
      setSelectedId(service.repertoire_id || 'none');
    }
  }, [open, service]);

  const fetchRepertoires = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('repertoires').getFullList({
        filter: `organization_id = "${activeOrganizationId}"`,
        sort: '-created',
        $autoCancel: false
      });
      setRepertoires(records);
    } catch (error) {
      console.error('Error fetching repertoires:', error);
      toast.error('Failed to load repertoires');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const repertoireValue = selectedId === 'none' ? null : selectedId;
      await pb.collection('services').update(service.id, {
        repertoire_id: repertoireValue
      }, { $autoCancel: false });

      toast.success('Repertoire assigned successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating repertoire:', error);
      toast.error('Failed to assign repertoire');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Asignar Repertorio</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {loading ? (
            <LoadingSpinner text="Loading repertoires..." />
          ) : (
            <RadioGroup value={selectedId} onValueChange={setSelectedId} className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="none" id="rep-none" />
                <Label htmlFor="rep-none" className="flex-1 cursor-pointer font-medium">None (Remove Repertoire)</Label>
              </div>
              
              {repertoires.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No repertoires found.</p>
              ) : (
                repertoires.map(rep => (
                  <div key={rep.id} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={rep.id} id={`rep-${rep.id}`} />
                    <Label htmlFor={`rep-${rep.id}`} className="flex flex-col flex-1 cursor-pointer">
                      <span className="font-medium">{rep.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {rep.song_count || 0} songs • {rep.status}
                      </span>
                    </Label>
                  </div>
                ))
              )}
            </RadioGroup>
          )}
        </div>

        <DialogFooter className="pt-4 border-t border-border mt-auto">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save Repertoire'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
