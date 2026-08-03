import { jsPDF } from "jspdf";

export const calculateTotalDuration = (songs) => {
  if (!songs || !Array.isArray(songs)) return 0;
  return songs.reduce((total, song) => {
    // Handle both expanded song objects and flat repertoire_song objects
    const duration = song.expand?.song_id?.duration_seconds || song.duration_seconds || 0;
    return total + duration;
  }, 0);
};

export const formatDuration = (seconds) => {
  if (!seconds) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const exportToText = (repertoire, songs) => {
  let content = `${repertoire.name}\n`;
  content += `Service Type: ${repertoire.service_type}\n`;
  content += `Date: ${new Date(repertoire.created).toLocaleDateString()}\n`;
  content += `Total Duration: ${formatDuration(calculateTotalDuration(songs))}\n\n`;
  content += `SONGS:\n`;
  content += `----------------------------------------\n`;

  songs.forEach((rs, index) => {
    const song = rs.expand?.song_id || {};
    content += `${index + 1}. ${song.title || 'Unknown Song'} - ${song.artist || 'Unknown Artist'}\n`;
    if (song.key || rs.key_adjustment) {
      content += `   Key: ${rs.key_adjustment || song.key || 'N/A'}\n`;
    }
    if (rs.notes) {
      content += `   Notes: ${rs.notes}\n`;
    }
    content += `\n`;
  });

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${repertoire.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_repertoire.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPDF = (repertoire, songs) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text(repertoire.name, 14, 22);
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Service Type: ${repertoire.service_type}`, 14, 32);
  doc.text(`Date: ${new Date(repertoire.created).toLocaleDateString()}`, 14, 38);
  doc.text(`Total Duration: ${formatDuration(calculateTotalDuration(songs))}`, 14, 44);
  
  doc.setLineWidth(0.5);
  doc.line(14, 48, 196, 48);
  
  let yPos = 58;
  doc.setTextColor(0);
  
  songs.forEach((rs, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    const song = rs.expand?.song_id || {};
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`${index + 1}. ${song.title || 'Unknown Song'}`, 14, yPos);
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100);
    doc.text(song.artist || 'Unknown Artist', 14, yPos + 6);
    
    doc.setTextColor(0);
    let detailsY = yPos + 12;
    
    if (song.key || rs.key_adjustment) {
      doc.text(`Key: ${rs.key_adjustment || song.key || 'N/A'}`, 20, detailsY);
      detailsY += 6;
    }
    
    if (rs.notes) {
      doc.text(`Notes: ${rs.notes}`, 20, detailsY);
      detailsY += 6;
    }
    
    yPos = detailsY + 8;
  });
  
  doc.save(`${repertoire.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_repertoire.pdf`);
};