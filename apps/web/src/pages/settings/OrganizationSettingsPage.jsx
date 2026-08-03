import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Check, Loader2, Plus } from 'lucide-react';

const EMPTY_FORM = {
  name: '',
  slug: '',
  email: '',
  address: '',
  phone: '',
  website: '',
  description: '',
  subscription_plan: 'free',
  status: 'active',
};

const toSlug = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

export default function OrganizationSettingsPage() {
  const {
    organizations,
    activeOrganizationId,
    selectOrganization,
    refreshOrganizations,
  } = useAuth();
  const [editingId, setEditingId] = useState(activeOrganizationId);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!editingId && activeOrganizationId) setEditingId(activeOrganizationId);
  }, [activeOrganizationId, editingId]);

  useEffect(() => {
    if (editingId === 'new') {
      setFormData(EMPTY_FORM);
      return;
    }

    const organization = organizations.find((item) => item.id === editingId);
    if (!organization) return;
    setFormData({
      name: organization.name || '',
      slug: organization.slug || '',
      email: organization.email || '',
      address: organization.address || '',
      phone: organization.phone || '',
      website: organization.website || '',
      description: organization.description || '',
      subscription_plan: organization.subscription_plan || 'free',
      status: organization.status || 'active',
    });
  }, [editingId, organizations]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === 'name' && editingId === 'new' && !current.slug ? { slug: toSlug(value) } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        slug: toSlug(formData.slug || formData.name),
      };

      if (editingId === 'new') {
        const record = await pb.collection('organizations').create(payload, { $autoCancel: false });
        await refreshOrganizations();
        selectOrganization(record.id);
        setEditingId(record.id);
        toast.success('Iglesia creada correctamente');
      } else {
        await pb.collection('organizations').update(editingId, payload, { $autoCancel: false });
        await refreshOrganizations();
        toast.success('Iglesia actualizada correctamente');
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.slug?.message || 'No fue posible guardar la iglesia');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Iglesias</h1>
          <p className="text-muted-foreground mt-1">
            Administra las iglesias conectadas y cambia el contexto desde la barra superior.
          </p>
        </div>
        <Button onClick={() => setEditingId('new')} className="gap-2">
          <Plus className="w-4 h-4" /> Agregar iglesia
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        <Card className="card-base">
          <CardHeader>
            <CardTitle className="text-lg">Iglesias conectadas</CardTitle>
            <CardDescription>{organizations.length} registradas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {organizations.map((organization) => (
              <button
                type="button"
                key={organization.id}
                onClick={() => setEditingId(organization.id)}
                className={`w-full text-left rounded-xl border p-3 transition-colors ${
                  editingId === organization.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{organization.name}</p>
                      {organization.id === activeOrganizationId && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{organization.slug}</p>
                    <Badge variant="outline" className="mt-2 capitalize text-[10px]">
                      {organization.status || 'active'}
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardHeader>
            <CardTitle>{editingId === 'new' ? 'Nueva iglesia' : 'Información de la iglesia'}</CardTitle>
            <CardDescription>
              Cada iglesia tendrá sus propios usuarios, equipos, servicios, canciones y repertorios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Identificador</Label>
                  <Input id="slug" name="slug" value={formData.slug} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Sitio web</Label>
                  <Input id="website" name="website" type="url" value={formData.website} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Plan</Label>
                  <Select value={formData.subscription_plan} onValueChange={(value) => setFormData((current) => ({ ...current, subscription_plan: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Gratuito</SelectItem>
                      <SelectItem value="professional">Profesional</SelectItem>
                      <SelectItem value="enterprise">Empresarial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData((current) => ({ ...current, status: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activa</SelectItem>
                      <SelectItem value="inactive">Inactiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleChange} className="min-h-[110px]" />
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                {editingId !== 'new' && editingId !== activeOrganizationId && (
                  <Button type="button" variant="outline" onClick={() => selectOrganization(editingId)}>
                    Administrar esta iglesia
                  </Button>
                )}
                <Button type="submit" disabled={isSaving || !editingId}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId === 'new' ? 'Crear iglesia' : 'Guardar cambios'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
