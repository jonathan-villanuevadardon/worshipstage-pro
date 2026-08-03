import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    organization_id: ''
  });
  const [organizations, setOrganizations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const { register } = useAuth();

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const orgs = await pb.collection('organizations').getFullList({
          sort: 'name',
          $autoCancel: false
        });
        setOrganizations(orgs);
      } catch (err) {
        console.error('Failed to load organizations', err);
      } finally {
        setIsLoadingOrgs(false);
      }
    };
    fetchOrgs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOrgChange = (value) => {
    setFormData(prev => ({ ...prev, organization_id: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.organization_id) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await register({
        ...formData,
        passwordConfirm: formData.password,
        role: 'volunteer', // Default role for open signups
      });
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="flex justify-center mb-8">
          <img src="/worshipstage-icon.png" alt="WorshipStage Pro" className="w-20 h-20 rounded-2xl object-cover shadow-xl shadow-primary/20" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-foreground tracking-tight">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Join your organization's worship team
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-card py-8 px-4 shadow-xl border border-border sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <div className="mt-2">
                  <Input
                    id="first_name"
                    name="first_name"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    className="bg-background text-foreground"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <div className="mt-2">
                  <Input
                    id="last_name"
                    name="last_name"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    className="bg-background text-foreground"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email address</Label>
              <div className="mt-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-background text-foreground"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="mt-2">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-background text-foreground"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="organization">Organization</Label>
              <div className="mt-2">
                <Select value={formData.organization_id} onValueChange={handleOrgChange} disabled={isLoadingOrgs}>
                  <SelectTrigger className="bg-background text-foreground">
                    <SelectValue placeholder={isLoadingOrgs ? "Loading..." : "Select your organization"} />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map(org => (
                      <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-semibold"
                disabled={isSubmitting || isLoadingOrgs}
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
                ) : (
                  'Sign up'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground border-t border-border pt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
