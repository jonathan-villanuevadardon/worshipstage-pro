import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import pb from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import RepertoireForm from '@/components/RepertoireForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'sonner';

export default function RepertoireEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [repertoire, setRepertoire] = useState(null);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const repData = await pb.collection('repertoires').getOne(id, { $autoCancel: false });
        const songsData = await pb.collection('repertoire_songs').getFullList({
          filter: `repertoire_id="${id}"`,
          sort: 'order',
          expand: 'song_id',
          $autoCancel: false
        });
        
        setRepertoire(repData);
        setSongs(songsData);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load repertoire');
        navigate('/repertoires');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, navigate]);

  if (loading) return <LoadingSpinner text="Loading repertoire..." className="mt-20" />;
  if (!repertoire) return null;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(`/repertoires/${id}`)} className="mb-6 gap-2 -ml-4">
        <ArrowLeft className="w-4 h-4" /> Back to Details
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Repertoire</h1>
        <p className="text-muted-foreground mt-1">Update details and setlist for {repertoire.name}</p>
      </div>

      <RepertoireForm initialData={repertoire} initialSongs={songs} isEdit={true} />
    </div>
  );
}