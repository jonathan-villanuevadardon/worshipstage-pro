import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { Building2, Check, Loader2, Search, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function RegisterPage() {
  const { register } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationType, setRegistrationType] = useState('existing_church');
  const [churchSearch, setChurchSearch] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    organizationId: '',
    churchName: '',
  });

  useEffect(() => {
    let active = true;

    const loadOrganizations = async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id,name')
        .eq('status', 'active')
        .order('name');

      if (!active) return;
      if (error) {
        console.error('Organization catalog load failed:', error);
        toast.error('No se pudo cargar el catálogo de iglesias.');
      } else {
        setOrganizations(data || []);
      }
      setIsLoadingOrganizations(false);
    };

    loadOrganizations();
    return () => { active = false; };
  }, []);

  const filteredOrganizations = useMemo(() => {
    const query = churchSearch.trim().toLocaleLowerCase('es');
    if (!query) return organizations;
    return organizations.filter((organization) => (
      organization.name.toLocaleLowerCase('es').includes(query)
    ));
  }, [churchSearch, organizations]);

  const selectedOrganization = organizations.find(
    (organization) => organization.id === form.organizationId
  );

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const chooseRegistrationType = (type) => {
    setRegistrationType(type);
    if (type === 'existing_church') {
      updateForm('churchName', '');
    } else {
      updateForm('organizationId', '');
      setChurchSearch('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error('Escribe tu nombre y apellido.');
      return;
    }
    if (form.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (form.password !== form.passwordConfirmation) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }
    if (registrationType === 'existing_church' && !form.organizationId) {
      toast.error('Selecciona tu iglesia del catálogo.');
      return;
    }
    if (registrationType === 'new_church') {
      const churchName = form.churchName.trim();
      if (churchName.length < 3) {
        toast.error('Escribe el nombre completo de la nueva iglesia.');
        return;
      }
      const isAlreadyRegistered = organizations.some((organization) => (
        organization.name.trim().toLocaleLowerCase('es') === churchName.toLocaleLowerCase('es')
      ));
      if (isAlreadyRegistered) {
        toast.error('Esta iglesia ya está registrada. Selecciónala del catálogo.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        registrationType,
        organizationId: form.organizationId,
        churchName: form.churchName,
      });
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 sm:px-6 lg:px-8 relative overflow-hidden">
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
          Crea tu cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Únete a tu iglesia o registra una nueva comunidad
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10"
      >
        <div className="bg-card py-8 px-5 shadow-xl border border-border sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="first-name">Nombre</Label>
                <Input id="first-name" autoComplete="given-name" required className="mt-2" value={form.firstName} onChange={(event) => updateForm('firstName', event.target.value)} />
              </div>
              <div>
                <Label htmlFor="last-name">Apellido</Label>
                <Input id="last-name" autoComplete="family-name" required className="mt-2" value={form.lastName} onChange={(event) => updateForm('lastName', event.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="register-email">Correo electrónico</Label>
              <Input id="register-email" type="email" autoComplete="email" required className="mt-2" value={form.email} onChange={(event) => updateForm('email', event.target.value)} />
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-foreground">¿Tu iglesia ya usa WorshipStage?</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => chooseRegistrationType('existing_church')}
                  className={`rounded-xl border p-4 text-left transition-colors ${registrationType === 'existing_church' ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'}`}
                >
                  <Users className="mb-2 h-5 w-5 text-primary" />
                  <span className="block text-sm font-semibold">Sí, buscar mi iglesia</span>
                  <span className="mt-1 block text-xs text-muted-foreground">Tu perfil será Volunteer.</span>
                </button>
                <button
                  type="button"
                  onClick={() => chooseRegistrationType('new_church')}
                  className={`rounded-xl border p-4 text-left transition-colors ${registrationType === 'new_church' ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'}`}
                >
                  <Building2 className="mb-2 h-5 w-5 text-primary" />
                  <span className="block text-sm font-semibold">No, registrar una nueva</span>
                  <span className="mt-1 block text-xs text-muted-foreground">Tu perfil será Church Admin.</span>
                </button>
              </div>
            </fieldset>

            {registrationType === 'existing_church' ? (
              <div>
                <Label htmlFor="church-search">Busca y selecciona tu iglesia</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="church-search" className="pl-9" placeholder="Nombre de la iglesia" value={churchSearch} onChange={(event) => setChurchSearch(event.target.value)} />
                </div>
                <div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-border bg-background p-1">
                  {isLoadingOrganizations ? (
                    <div className="flex items-center justify-center py-6 text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cargando iglesias...</div>
                  ) : filteredOrganizations.length === 0 ? (
                    <p className="px-3 py-6 text-center text-sm text-muted-foreground">No encontramos una iglesia con ese nombre.</p>
                  ) : filteredOrganizations.map((organization) => (
                    <button
                      type="button"
                      key={organization.id}
                      onClick={() => updateForm('organizationId', organization.id)}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${form.organizationId === organization.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    >
                      <span>{organization.name}</span>
                      {form.organizationId === organization.id && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
                {selectedOrganization && <p className="mt-2 text-xs text-muted-foreground">Seleccionada: <span className="font-medium text-foreground">{selectedOrganization.name}</span></p>}
              </div>
            ) : (
              <div>
                <Label htmlFor="church-name">Nombre de la nueva iglesia</Label>
                <Input id="church-name" required className="mt-2" maxLength={120} placeholder="Ej. Iglesia Comunidad de Fe" value={form.churchName} onChange={(event) => updateForm('churchName', event.target.value)} />
                <div className="mt-3 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-foreground">
                  Al crearla serás <strong>Church Admin</strong>. Después deberás crear el perfil del líder de alabanza con el rol <strong>Musician</strong> para organizar el equipo.
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="register-password">Contraseña</Label>
                <Input id="register-password" type="password" autoComplete="new-password" minLength={8} required className="mt-2" value={form.password} onChange={(event) => updateForm('password', event.target.value)} />
              </div>
              <div>
                <Label htmlFor="password-confirmation">Confirmar contraseña</Label>
                <Input id="password-confirmation" type="password" autoComplete="new-password" minLength={8} required className="mt-2" value={form.passwordConfirmation} onChange={(event) => updateForm('passwordConfirmation', event.target.value)} />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isSubmitting || isLoadingOrganizations}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creando cuenta...</> : 'Crear mi cuenta'}
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary/80">Inicia sesión</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
