import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext.jsx';
import pb from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
  const { currentUser } = useAuth();
  const { theme, toggleTheme, resolvedTheme } = useTheme();
  
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: currentUser?.first_name || '',
    last_name: currentUser?.last_name || '',
    phone: currentUser?.phone || '',
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    receive_assignments: currentUser?.notification_preferences?.receive_assignments ?? true,
    receive_messages: currentUser?.notification_preferences?.receive_messages ?? true,
    receive_service_changes: currentUser?.notification_preferences?.receive_service_changes ?? true,
    receive_availability_changes: currentUser?.notification_preferences?.receive_availability_changes ?? true,
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePrefChange = (key, checked) => {
    setNotificationPrefs(prev => ({ ...prev, [key]: checked }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await pb.collection('users').update(currentUser.id, {
        ...formData,
        notification_preferences: notificationPrefs
      }, { $autoCancel: false });
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information and preferences.</p>
      </div>

      <form onSubmit={handleProfileSubmit} className="space-y-8">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input 
                  id="first_name" 
                  name="first_name" 
                  value={formData.first_name} 
                  onChange={handleChange} 
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input 
                  id="last_name" 
                  name="last_name" 
                  value={formData.last_name} 
                  onChange={handleChange} 
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={currentUser?.email || ''} 
                  disabled 
                  className="bg-muted text-muted-foreground opacity-70"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  className="bg-background text-foreground"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how WorshipStage Pro looks on your device.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Switch 
                  checked={resolvedTheme === 'dark'} 
                  onCheckedChange={toggleTheme} 
                />
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Choose what updates you want to receive.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Service Assignments</Label>
                <p className="text-sm text-muted-foreground">Get notified when you are assigned to a service.</p>
              </div>
              <Switch checked={notificationPrefs.receive_assignments} onCheckedChange={(v) => handlePrefChange('receive_assignments', v)} />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Chat Messages</Label>
                <p className="text-sm text-muted-foreground">Receive alerts for new messages and mentions.</p>
              </div>
              <Switch checked={notificationPrefs.receive_messages} onCheckedChange={(v) => handlePrefChange('receive_messages', v)} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Service Changes</Label>
                <p className="text-sm text-muted-foreground">Alerts when a service you are part of changes.</p>
              </div>
              <Switch checked={notificationPrefs.receive_service_changes} onCheckedChange={(v) => handlePrefChange('receive_service_changes', v)} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Availability Changes</Label>
                <p className="text-sm text-muted-foreground">Updates on your team's availability.</p>
              </div>
              <Switch checked={notificationPrefs.receive_availability_changes} onCheckedChange={(v) => handlePrefChange('receive_availability_changes', v)} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-border pt-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save All Settings
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}