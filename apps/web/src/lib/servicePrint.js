import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import pb from '@/lib/supabaseClient';
import { getRepertoireSongView } from '@/lib/repertoireSongUtils.js';

export async function generateServicePdf(service) {
  const doc = new jsPDF();
  const serviceTitle = service.title || service.name || 'Service';
  const serviceDate = new Date(service.date);

  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text(`Service: ${serviceTitle}`, 20, 20);

  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${format(serviceDate, 'MMMM d, yyyy')} | Time: ${service.start_time || 'TBD'}`, 20, 30);
  doc.text(`Location: ${service.location || 'Main Sanctuary'}`, 20, 37);

  let y = 50;
  const assignments = await pb.collection('service_assignments').getFullList({
    filter: `service_id="${service.id}"`,
    expand: 'team_member_id',
    $autoCancel: false,
  });

  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('Team Schedule', 20, y);
  y += 8;

  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  if (assignments.length > 0) {
    assignments.forEach((assignment) => {
      const user = assignment.expand?.team_member_id;
      const name = user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email || 'Unknown';
      doc.text(`- ${name} - ${assignment.role}`, 25, y);
      y += 6;
    });
  } else {
    doc.text('No team members assigned yet.', 25, y);
    y += 6;
  }

  y += 10;
  if (service.repertoire_id) {
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('Repertoire & Chords', 20, y);
    y += 10;

    const repertoireSongs = await pb.collection('repertoire_songs').getFullList({
      filter: `repertoire_id="${service.repertoire_id}"`,
      sort: 'order',
      expand: 'song_id',
      $autoCancel: false,
    });

    if (repertoireSongs.length > 0) {
      for (let index = 0; index < repertoireSongs.length; index += 1) {
        const repertoireSong = repertoireSongs[index];
        const { song, originalKey, displayKey, content: displayChords } = getRepertoireSongView(repertoireSong);
        if (!song) continue;
        if (y > 260) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text(`${index + 1}. ${song.title}`, 20, y);
        y += 6;

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        const keyText = displayKey && displayKey !== originalKey
          ? `Orig: ${originalKey || 'N/A'} -> Transposed: ${displayKey}`
          : `Key: ${displayKey || originalKey || 'N/A'}`;
        doc.text(keyText, 25, y);
        y += 8;

        doc.setFont('courier', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        const lines = displayChords
          ? displayChords.split(/\r\n|\r|\n/).flatMap((line) => doc.splitTextToSize(line || ' ', 170))
          : ['No chord chart saved for this song.'];
        lines.forEach((line) => {
          if (y > 275) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, 25, y);
          y += 4;
        });
        y += 8;
        doc.setFont('helvetica', 'normal');
      }
    } else {
      doc.setFontSize(11);
      doc.text('No songs found in the attached repertoire.', 25, y);
    }
  } else {
    doc.setFontSize(11);
    doc.text('No repertoire attached to this service.', 20, y);
  }

  doc.save(`Service_Sheet_${format(serviceDate, 'yyyy-MM-dd')}.pdf`);
}
