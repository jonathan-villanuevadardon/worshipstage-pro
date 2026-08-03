import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import RepertoireForm from '@/components/RepertoireForm';

export default function RepertoireCreatePage() {
  const navigate = useNavigate();

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/repertoires')} className="mb-6 gap-2 -ml-4">
        <ArrowLeft className="w-4 h-4" /> Back to Repertoires
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create New Repertoire</h1>
        <p className="text-muted-foreground mt-1">Plan a new service and build your setlist.</p>
      </div>

      <RepertoireForm isEdit={false} />
    </div>
  );
}