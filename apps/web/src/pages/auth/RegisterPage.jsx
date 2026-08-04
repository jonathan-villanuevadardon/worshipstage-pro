import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserRoundCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
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
          Request an account
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          WorshipStage accounts are managed by your organization
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-card py-8 px-6 shadow-xl border border-border sm:rounded-2xl sm:px-10 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRoundCheck className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Ask your administrator to add you</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Your church administrator will create an already confirmed account and give you a temporary password. No confirmation email is required.
          </p>
          <Button asChild className="mt-7 w-full h-11 text-base font-semibold">
            <Link to="/login">Go to sign in</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
