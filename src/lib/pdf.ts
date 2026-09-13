import { jsPDF } from 'jspdf';
import { Commitment, UnresolvedIssue } from '../types';

interface PDFReportOptions {
  title: string;
  subtitle: string;
  generatedAt: string;
  stats: {
    totalCommitments: number;
    pending: number;
    completed: number;
    overdue: number;
    repeated: number;
    totalDecisions: number;
    recurringIssuesCount: number;
  };
  commitments: Commitment[];
  issues: UnresolvedIssue[];
}

export function generateAccountabilityPDF(options: PDFReportOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  let y = margin;

  // Header Background bar
  doc.setFillColor(15, 23, 42); // deep slate/navy
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('MeetMind AI', margin, 16);

  // Sub-brand
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('Cross-Meeting Accountability & Intelligence Report', margin, 23);

  // Date Generated
  const dateStr = new Date(options.generatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Generated: ${dateStr}`, pageWidth - margin - 50, 16);

  y = 48;

  // Report Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text(options.title, margin, y);
  y += 7;

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  const splitSubtitle = doc.splitTextToSize(options.subtitle, pageWidth - margin * 2);
  doc.text(splitSubtitle, margin, y);
  y += splitSubtitle.length * 5 + 6;

  // Metrics Bar
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 20, 3, 3, 'F');

  const statItems = [
    { label: 'Total Tracked', val: options.stats.totalCommitments.toString() },
    { label: 'Completed', val: options.stats.completed.toString() },
    { label: 'Pending', val: options.stats.pending.toString() },
    { label: 'Overdue', val: options.stats.overdue.toString() },
    { label: 'Repeated Issues', val: options.stats.recurringIssuesCount.toString() },
  ];

  const colWidth = (pageWidth - margin * 2) / statItems.length;
  statItems.forEach((stat, i) => {
    const xPos = margin + i * colWidth + colWidth / 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(stat.val, xPos, y + 8, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(stat.label.toUpperCase(), xPos, y + 15, { align: 'center' });
  });

  y += 28;

  // Table of Commitments
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Commitments & Accountability Audit Trail', margin, y);
  y += 6;

  // Table Header
  doc.setFillColor(226, 232, 240);
  doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('PERSON', margin + 3, y + 5.5);
  doc.text('COMMITMENT / DELIVERABLE', margin + 32, y + 5.5);
  doc.text('DEADLINE', margin + 115, y + 5.5);
  doc.text('STATUS', margin + 145, y + 5.5);
  y += 10;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const commitmentsToPrint = options.commitments.slice(0, 14); // fits on one page cleanly
  for (const c of commitmentsToPrint) {
    if (y > 260) {
      doc.addPage();
      y = margin;
    }

    // Person
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(c.person, margin + 3, y + 4);

    // Description (truncate if long)
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const desc = c.description.length > 55 ? c.description.substring(0, 52) + '...' : c.description;
    doc.text(desc, margin + 32, y + 4);

    // Deadline
    const dl = c.deadline ? c.deadline.split('T')[0] : 'None';
    doc.text(dl, margin + 115, y + 4);

    // Status Badge text
    if (c.status === 'COMPLETED') {
      doc.setTextColor(16, 149, 106); // green
      doc.setFont('helvetica', 'bold');
      doc.text('COMPLETED', margin + 145, y + 4);
    } else if (c.status === 'OVERDUE') {
      doc.setTextColor(220, 38, 38); // red
      doc.setFont('helvetica', 'bold');
      doc.text('OVERDUE', margin + 145, y + 4);
    } else if (c.status === 'REPEATED_UNRESOLVED') {
      doc.setTextColor(217, 119, 6); // amber
      doc.setFont('helvetica', 'bold');
      doc.text('REPEATED', margin + 145, y + 4);
    } else {
      doc.setTextColor(59, 130, 246); // blue
      doc.setFont('helvetica', 'bold');
      doc.text('PENDING', margin + 145, y + 4);
    }

    // Origin/Mention line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    const origin = `Origin: ${c.meetingTitle || 'Meeting'} | Last mentioned: ${c.lastMentionedMeetingTitle || c.meetingTitle || 'Meeting'}`;
    doc.text(origin, margin + 32, y + 8);

    // Divider
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 10, pageWidth - margin, y + 10);

    y += 12;
  }

  // Repeated Issues Section if present
  if (options.issues && options.issues.length > 0 && y < 240) {
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Recurring Blockers (Appeared in Multiple Meetings)', margin, y);
    y += 6;

    for (const issue of options.issues.slice(0, 3)) {
      doc.setFillColor(254, 243, 199);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 10, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(146, 64, 14);
      doc.text(`Repeated in ${issue.timesRepeated} meetings:`, margin + 4, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const issText = issue.description.length > 75 ? issue.description.substring(0, 72) + '...' : issue.description;
      doc.text(issText, margin + 44, y + 6);
      y += 13;
    }
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'MeetMind AI — Autonomous Cross-Meeting Accountability Engine',
      margin,
      doc.internal.pageSize.getHeight() - 10
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin - 20,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  // Download
  const filename = `${options.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.pdf`;
  doc.save(filename);
}
