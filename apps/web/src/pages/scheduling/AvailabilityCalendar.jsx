import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import pb from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { getAvailabilityDisplay } from '@/lib/assignmentValidationUtils';
import { toast } from 'sonner';

export default function AvailabilityCalendar() {
  const { currentUser } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailability();
  }, [currentDate, currentUser]);

  const fetchAvailability = async () => {
    if (!currentUser?.id) return;

    setLoading(true);
    try {
      const records = await pb.collection('team_availability').getFullList({
        filter: `team_member_id = "${currentUser.id}"`,
        $autoCancel: false
      });

      const availabilityMap = {};
      records.forEach(record => {
        const dateStr = new Date(record.date).toISOString().split('T')[0];
        availabilityMap[dateStr] = record;
      });

      setAvailability(availabilityMap);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = async (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const currentAvailability = availability[dateStr];

    const statusCycle = ['available', 'unavailable', 'rest'];
    const currentStatus = currentAvailability?.availability_status || null;
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];

    try {
      if (currentAvailability) {
        await pb.collection('team_availability').update(currentAvailability.id, {
          availability_status: nextStatus
        }, { $autoCancel: false });
      } else {
        await pb.collection('team_availability').create({
          team_member_id: currentUser.id,
          date: dateStr,
          availability_status: nextStatus,
          reason: ''
        }, { $autoCancel: false });
      }

      await fetchAvailability();
      toast.success(`Availability updated to ${nextStatus}`);
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="space-y-2">
        {/* Week day headers */}
        <div className="calendar-grid">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center font-semibold text-sm text-muted-foreground bg-muted">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="calendar-grid">
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayAvailability = availability[dateStr];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);

            const statusDisplay = dayAvailability 
              ? getAvailabilityDisplay(dayAvailability.availability_status)
              : null;

            return (
              <div
                key={day.toISOString()}
                className={`calendar-day cursor-pointer ${!isCurrentMonth ? 'calendar-day-other-month' : ''} ${isTodayDate ? 'calendar-day-today' : ''}`}
                onClick={() => handleDayClick(day)}
              >
                <div className="calendar-day-header">
                  {format(day, 'd')}
                </div>
                {statusDisplay && (
                  <div className="mt-2">
                    <Badge className={`${statusDisplay.className} text-xs w-full justify-center`}>
                      {statusDisplay.label}
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>My availability - WorshipStage Pro</title>
        <meta name="description" content="Manage your availability for service assignments" />
      </Helmet>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">My availability</h1>
          <p className="text-muted-foreground">Click on any day to toggle your availability status</p>
        </div>

        {/* Calendar Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <h2 className="text-xl font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium text-muted-foreground">Status:</span>
          <Badge className="availability-available">Available</Badge>
          <Badge className="availability-unavailable">Unavailable</Badge>
          <Badge className="availability-rest">Rest day</Badge>
          <span className="text-sm text-muted-foreground ml-2">Click to cycle through statuses</span>
        </div>

        {/* Calendar */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading calendar...</p>
          </div>
        ) : (
          <Card className="p-4">
            {renderCalendar()}
          </Card>
        )}
      </div>
    </>
  );
}