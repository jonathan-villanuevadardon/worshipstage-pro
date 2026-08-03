import pb from '@/lib/supabaseClient';

/**
 * Check if a team member is available on a specific date
 * @param {string} memberId - User ID of the team member
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<{available: boolean, status: string|null, reason: string|null}>}
 */
export async function isTeamMemberAvailable(memberId, date) {
  try {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];

    const availabilityRecords = await pb.collection('team_availability').getFullList({
      filter: `team_member_id = "${memberId}" && date >= "${date}" && date < "${nextDayStr}"`,
      $autoCancel: false
    });

    if (availabilityRecords.length === 0) {
      return { available: true, status: null, reason: null };
    }

    const record = availabilityRecords[0];
    return {
      available: record.availability_status === 'available',
      status: record.availability_status,
      reason: record.reason || null
    };
  } catch (error) {
    console.error('Error checking team member availability:', error);
    return { available: true, status: null, reason: null };
  }
}

/**
 * Get the number of service assignments for a team member on a specific date
 * @param {string} memberId - User ID of the team member
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<number>}
 */
export async function getTeamMemberWorkload(memberId, date) {
  try {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];

    const assignments = await pb.collection('service_assignments').getFullList({
      filter: `team_member_id = "${memberId}" && assigned_date >= "${date}" && assigned_date < "${nextDayStr}"`,
      $autoCancel: false
    });

    return assignments.length;
  } catch (error) {
    console.error('Error getting team member workload:', error);
    return 0;
  }
}

/**
 * Check if a team member can be assigned to a service on a specific date
 * @param {string} memberId - User ID of the team member
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<{valid: boolean, reason: string}>}
 */
export async function canAssignMember(memberId, date) {
  const MAX_SERVICES_PER_DAY = 5;

  const availabilityCheck = await isTeamMemberAvailable(memberId, date);
  
  if (!availabilityCheck.available) {
    if (availabilityCheck.status === 'unavailable') {
      const reason = availabilityCheck.reason 
        ? `Team member is unavailable: ${availabilityCheck.reason}`
        : 'Team member is unavailable on this date';
      return { valid: false, reason };
    }
    if (availabilityCheck.status === 'rest') {
      return { valid: false, reason: 'Team member is scheduled for rest on this date' };
    }
  }

  const workload = await getTeamMemberWorkload(memberId, date);
  
  if (workload >= MAX_SERVICES_PER_DAY) {
    return { 
      valid: false, 
      reason: `Team member has reached maximum assignments (${MAX_SERVICES_PER_DAY}) for this date` 
    };
  }

  return { valid: true, reason: '' };
}

/**
 * Get availability status for display
 * @param {string} status - Availability status (available/unavailable/rest)
 * @returns {object} - Display properties for the status
 */
export function getAvailabilityDisplay(status) {
  const displays = {
    available: {
      label: 'Available',
      className: 'availability-available',
      color: 'green'
    },
    unavailable: {
      label: 'Unavailable',
      className: 'availability-unavailable',
      color: 'red'
    },
    rest: {
      label: 'Rest Day',
      className: 'availability-rest',
      color: 'yellow'
    }
  };

  return displays[status] || displays.available;
}

/**
 * Get service status display properties
 * @param {string} status - Service status (planning/scheduled/completed/cancelled)
 * @returns {object} - Display properties for the status
 */
export function getServiceStatusDisplay(status) {
  const displays = {
    planning: {
      label: 'Planning',
      className: 'event-badge-pending',
      color: 'yellow'
    },
    scheduled: {
      label: 'Scheduled',
      className: 'event-badge-in-progress',
      color: 'blue'
    },
    completed: {
      label: 'Completed',
      className: 'event-badge-completed',
      color: 'green'
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-muted text-muted-foreground',
      color: 'gray'
    }
  };

  return displays[status] || displays.planning;
}