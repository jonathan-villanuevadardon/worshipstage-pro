import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      // Error is handled in context via toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <h2 className="text-center text-3xl font-extrabold text-foreground tracking-tight">
          Reset password
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Enter your email to receive recovery instructions
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-card py-8 px-4 shadow-xl border border-border sm:rounded-2xl sm:px-10">
          {isSubmitted ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground">Check your email</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We've sent password reset instructions to {email}
              </p>
              <div className="mt-6">
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Return to login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="email">Email address</Label>
                <div className="mt-2">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background text-foreground"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                  ) : (
                    'Send reset link'
                  )}
                </Button>
              </div>
            </form>
          )}

          {!isSubmitted && (
            <div className="mt-6 text-center text-sm text-muted-foreground border-t border-border pt-6">
              <Link to="/login" className="flex items-center justify-center font-medium text-primary hover:text-primary/80 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to login
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}