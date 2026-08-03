import React, { useState } from 'react';
import { canAssignMember } from '@/lib/assignmentValidationUtils';
import pb from '@/lib/supabaseClient';
import { toast } from 'sonner';

export function useDragDropAssignment() {
  const [draggedMember, setDraggedMember] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  const handleDragStart = (member) => {
    setDraggedMember(member);
  };

  const handleDragEnd = () => {
    setDraggedMember(null);
    setDropTarget(null);
  };

  const handleDragOver = (e, service) => {
    e.preventDefault();
    setDropTarget(service?.id || null);
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = async (e, service, defaultRole = 'Team Member') => {
    e.preventDefault();
    setDropTarget(null);

    if (!draggedMember || !service) {
      return;
    }

    try {
      const dateStr = new Date(service.date).toISOString().split('T')[0];
      
      const validation = await canAssignMember(draggedMember.id, dateStr);

      if (!validation.valid) {
        toast.error(validation.reason);
        setDraggedMember(null);
        return;
      }

      await pb.collection('service_assignments').create({
        service_id: service.id,
        team_member_id: draggedMember.id,
        assigned_date: dateStr,
        role: defaultRole,
        status: 'pending',
        notes: 'Assigned via drag and drop'
      }, { $autoCancel: false });

      toast.success(`${draggedMember.name || draggedMember.email} assigned to ${service.name}`);
      setDraggedMember(null);
      
      return true;
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
      setDraggedMember(null);
      return false;
    }
  };

  const isValidDropZone = (service) => {
    return dropTarget === service?.id;
  };

  return {
    draggedMember,
    dropTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isValidDropZone
  };
}

export default function DragDropAssignmentHandler({ children, onAssignmentCreated }) {
  const dragDropHandlers = useDragDropAssignment();

  return children(dragDropHandlers);
}