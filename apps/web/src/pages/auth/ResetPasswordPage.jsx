import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await updatePassword(password);
      toast.success('Password updated successfully.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Could not update the password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Choose a new password</h1>
          <p className="text-sm text-muted-foreground mt-2">Use at least eight characters.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <Input id="new-password" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : 'Update password'}
        </Button>
      </form>
    </div>
  );
}
