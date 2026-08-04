import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, List, Users, Music, Plus, RefreshCw } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import pb from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { getServiceStatusDisplay } from '@/lib/assignmentValidationUtils';
import ServiceDetailsModal from '@/components/ServiceDetailsModal';
import ServiceFormModal from '@/components/ServiceFormModal';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function CalendarPage() {
  const { currentUser, activeOrganizationId } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const canManage = ['super_admin', 'pastor', 'worship_leader', 'church_admin'].includes(currentUser?.role);

  useEffect(() => {
    fetchServices();
  }, [currentDate, currentUser, activeOrganizationId]);

  const fetchServices = async () => {
    if (!activeOrganizationId) return;

    setLoading(true);
    setError(false);
    try {
      const records = await pb.collection('services').getFullList({
        filter: `organization_id = "${activeOrganizationId}"`,
        sort: 'date',
        expand: 'repertoire_id,service_assignments_via_service_id.team_member_id',
        $autoCancel: false
      });
      setServices(records);
    } catch (err) {
      console.error('Error fetching services:', err);
      toast.error('Failed to load services');
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousPeriod = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    }
  };

  const handleNextPeriod = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    }
  };

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setDetailsModalOpen(true);
  };

  const getServicesForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return services.filter(service => {
      const serviceDateStr = new Date(service.date).toISOString().split('T')[0];
      return serviceDateStr === dateStr;
    });
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="space-y-2">
        <div className="calendar-grid">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center font-semibold text-sm text-muted-foreground bg-muted">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-grid">
          {days.map(day => {
            const dayServices = getServicesForDate(day);
            return (
              <div
                key={day.toISOString()}
                className={`calendar-day ${!isSameMonth(day, currentDate) ? 'calendar-day-other-month' : ''} ${isToday(day) ? 'calendar-day-today' : ''}`}
              >
                <div className="calendar-day-header">{format(day, 'd')}</div>
                <div className="space-y-1">
                  {dayServices.map(service => (
                    <div
                      key={service.id}
                      className={`event-badge ${getServiceStatusDisplay(service.status).className}`}
                      onClick={() => handleServiceClick(service)}
                    >
                      {service.title || service.name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="flex flex-col gap-6">
        {days.map(day => {
          const dayServices = getServicesForDate(day);
          if (dayServices.length === 0) return null;

          return (
            <div key={day.toISOString()} className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-24 shrink-0 pt-2 text-center md:text-left">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{format(day, 'EEE')}</div>
                <div className="text-3xl font-bold">{format(day, 'dd')}</div>
              </div>
              
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                {dayServices.map(service => {
                  const assignments = service.expand?.service_assignments_via_service_id || [];
                  const repertoire = service.expand?.repertoire_id;
                  const statusInfo = getServiceStatusDisplay(service.status);

                  return (
                    <Card key={service.id} className="card-base card-hover p-5 cursor-pointer flex flex-col" onClick={() => handleServiceClick(service)}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <Badge variant="secondary" className="mb-2">{service.service_type}</Badge>
                          <h3 className="text-lg font-bold leading-tight">{service.title || service.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {service.start_time || 'TBD'} • {service.location || 'No location set'}
                          </p>
                        </div>
                        <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                      </div>

                      <div className="mt-auto space-y-4 pt-4">
                        {repertoire ? (
                          <div className="flex items-center gap-2 text-sm text-foreground/80 bg-secondary/20 p-2 rounded-lg">
                            <Music className="w-4 h-4 text-primary" />
                            <span className="truncate">{repertoire.name} ({repertoire.song_count || 0} songs)</span>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground italic flex items-center gap-2">
                            <Music className="w-4 h-4 opacity-50" /> No repertoire assigned
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-border pt-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{assignments.length} assigned</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
        {days.every(d => getServicesForDate(d).length === 0) && (
          <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border text-muted-foreground">
            No services scheduled for this week.
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Services Calendar - WorshipStage Pro</title>
      </Helmet>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Services & Schedule</h1>
            <p className="text-muted-foreground mt-1">Plan upcoming services and view schedule</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <Button 
                variant={view === 'week' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setView('week')}
                className="px-4"
              >
                List View
              </Button>
              <Button 
                variant={view === 'month' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setView('month')}
                className="px-4"
              >
                Calendar
              </Button>
            </div>
            {canManage && (
              <Button onClick={() => {
                setEditingService(null);
                setCreateModalOpen(true);
              }} className="gap-2">
                <Plus className="w-4 h-4" /> Crear Nuevo Servicio
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePreviousPeriod}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextPeriod}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <h2 className="text-xl font-semibold">
            {view === 'month' ? format(currentDate, 'MMMM yyyy') : `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`}
          </h2>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading schedule..." className="py-20" />
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive mb-4">Error loading services.</p>
            <Button variant="outline" onClick={fetchServices} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Try Again
            </Button>
          </div>
        ) : (
          <div>
            {view === 'month' ? renderMonthView() : renderWeekView()}
          </div>
        )}

        <ServiceDetailsModal
          service={selectedService}
          open={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          onEdit={(serviceToEdit) => {
            setDetailsModalOpen(false);
            setEditingService(serviceToEdit);
            setCreateModalOpen(true);
          }}
          onRefresh={() => {
            fetchServices();
            setDetailsModalOpen(false);
          }}
        />

        <ServiceFormModal 
          open={createModalOpen}
          service={editingService}
          onClose={() => {
            setCreateModalOpen(false);
            setEditingService(null);
          }}
          onSuccess={fetchServices}
        />
      </div>
    </>
  );
}
