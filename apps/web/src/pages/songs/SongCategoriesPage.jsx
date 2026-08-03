import React, { useState, useEffect } from 'react';
import pb from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConfirmDialog from '@/components/ConfirmDialog';
import { toast } from 'sonner';

export default function SongCategoriesPage() {
  const { activeOrganizationId } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, [activeOrganizationId]);

  const fetchCategories = async () => {
    try {
      const result = await pb.collection('song_categories').getFullList({
        filter: `organization_id = "${activeOrganizationId}"`,
        sort: 'name',
        $autoCancel: false
      });
      setCategories(result);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCat) return;
    try {
      await pb.collection('song_categories').delete(selectedCat.id, { $autoCancel: false });
      setCategories(categories.filter(c => c.id !== selectedCat.id));
      toast.success('Category deleted');
    } catch (error) {
      toast.error('Failed to delete category');
    } finally {
      setShowDelete(false);
      setSelectedCat(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading categories..." className="mt-20" />;

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Song Categories</h1>
          <p className="text-muted-foreground mt-1">Manage genres and tags for your library</p>
        </div>
        <Button className="gap-2" onClick={() => toast.info('Category creation modal coming soon')}>
          <Plus className="w-4 h-4" /> New Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <Card key={cat.id} className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardContent className="p-5 flex items-start gap-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: cat.color ? `${cat.color}20` : 'var(--primary)', color: cat.color || 'var(--primary)' }}
              >
                <GripVertical className="w-5 h-5 opacity-50" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{cat.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{cat.description || 'No description'}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => { setSelectedCat(cat); setShowDelete(true); }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Category"
        description={`Are you sure you want to delete "${selectedCat?.name}"?`}
        confirmText="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
