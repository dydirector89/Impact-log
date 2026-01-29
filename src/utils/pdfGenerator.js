import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ACTIVITY_TYPES, formatCO2 } from './calculations';

/**
 * Generate PDF report for activities
 * @param {Object} options - Report options
 * @param {Array} activities - Activities to include
 * @param {Object} user - User info
 * @param {string} reportType - 'personal' | 'team'
 * @param {Object} stats - Statistics object
 */
export function generateActivityReport({ activities, user, reportType = 'personal', stats }) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Colors
    const primaryColor = [16, 185, 129]; // #10b981
    const darkColor = [30, 41, 59]; // #1e293b
    const grayColor = [100, 116, 139]; // #64748b

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ImpactLog', 14, 20);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('ESG & CSR Activity Report', 14, 30);

    // Report info
    doc.setTextColor(...darkColor);
    doc.setFontSize(10);
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    doc.text(`Generated: ${today}`, pageWidth - 14, 20, { align: 'right' });
    doc.text(reportType === 'personal' ? user?.full_name || 'Employee' : 'Team Report', pageWidth - 14, 30, { align: 'right' });

    // Summary Cards
    let yPos = 55;

    doc.setFillColor(240, 253, 244); // Light green
    doc.roundedRect(14, yPos, (pageWidth - 42) / 3, 30, 3, 3, 'F');
    doc.roundedRect(14 + (pageWidth - 42) / 3 + 7, yPos, (pageWidth - 42) / 3, 30, 3, 3, 'F');
    doc.roundedRect(14 + 2 * ((pageWidth - 42) / 3 + 7), yPos, (pageWidth - 42) / 3, 30, 3, 3, 'F');

    // Stats
    const cardWidth = (pageWidth - 42) / 3;
    const approvedActivities = activities.filter(a => a.status === 'approved');
    const totalCO2 = approvedActivities.reduce((sum, a) => sum + (a.co2_saved || 0), 0);
    const totalHours = approvedActivities
        .filter(a => ACTIVITY_TYPES[a.activity_type]?.unit === 'hours')
        .reduce((sum, a) => sum + (a.hours || a.quantity || 0), 0);
    const totalImpact = approvedActivities.reduce((sum, a) => sum + (a.impact_score || 0), 0);

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);

    doc.text(formatCO2(totalCO2), 14 + cardWidth / 2, yPos + 15, { align: 'center' });
    doc.text(`${totalHours}h`, 14 + cardWidth + 7 + cardWidth / 2, yPos + 15, { align: 'center' });
    doc.text(`${totalImpact.toFixed(0)}`, 14 + 2 * (cardWidth + 7) + cardWidth / 2, yPos + 15, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);

    doc.text('CO₂ Saved', 14 + cardWidth / 2, yPos + 24, { align: 'center' });
    doc.text('CSR Hours', 14 + cardWidth + 7 + cardWidth / 2, yPos + 24, { align: 'center' });
    doc.text('Impact Score', 14 + 2 * (cardWidth + 7) + cardWidth / 2, yPos + 24, { align: 'center' });

    yPos += 45;

    // Activities Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text('Activity Log', 14, yPos);

    yPos += 5;

    const tableData = activities.map(activity => [
        new Date(activity.activity_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ACTIVITY_TYPES[activity.activity_type]?.label || activity.activity_type,
        activity.description?.substring(0, 40) + (activity.description?.length > 40 ? '...' : '') || '-',
        `${activity.quantity || activity.hours || 0} ${ACTIVITY_TYPES[activity.activity_type]?.unit || ''}`,
        `${(activity.co2_saved || 0).toFixed(1)} kg`,
        activity.status.charAt(0).toUpperCase() + activity.status.slice(1),
    ]);

    doc.autoTable({
        startY: yPos,
        head: [['Date', 'Type', 'Description', 'Quantity', 'CO₂ Saved', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
        },
        bodyStyles: {
            fontSize: 8,
            textColor: darkColor,
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        columnStyles: {
            0: { cellWidth: 22 },
            1: { cellWidth: 30 },
            2: { cellWidth: 55 },
            3: { cellWidth: 25 },
            4: { cellWidth: 22 },
            5: { cellWidth: 22 },
        },
        margin: { left: 14, right: 14 },
    });

    // Activity breakdown by type (if space)
    const finalY = doc.lastAutoTable.finalY || yPos + 50;

    if (finalY < 200) {
        const typeStats = {};
        approvedActivities.forEach(a => {
            if (!typeStats[a.activity_type]) {
                typeStats[a.activity_type] = { count: 0, co2: 0 };
            }
            typeStats[a.activity_type].count++;
            typeStats[a.activity_type].co2 += a.co2_saved || 0;
        });

        const breakdownData = Object.entries(typeStats)
            .sort((a, b) => b[1].co2 - a[1].co2)
            .slice(0, 5)
            .map(([type, data]) => [
                ACTIVITY_TYPES[type]?.label || type,
                data.count,
                `${data.co2.toFixed(1)} kg`,
            ]);

        if (breakdownData.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Top Activities by CO₂ Impact', 14, finalY + 15);

            doc.autoTable({
                startY: finalY + 20,
                head: [['Activity Type', 'Count', 'CO₂ Saved']],
                body: breakdownData,
                theme: 'plain',
                headStyles: {
                    fillColor: [241, 245, 249],
                    textColor: darkColor,
                    fontStyle: 'bold',
                    fontSize: 9,
                },
                bodyStyles: {
                    fontSize: 9,
                    textColor: darkColor,
                },
                columnStyles: {
                    0: { cellWidth: 60 },
                    1: { cellWidth: 30 },
                    2: { cellWidth: 40 },
                },
                margin: { left: 14, right: 14 },
                tableWidth: 130,
            });
        }
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...grayColor);
        doc.text(
            `Page ${i} of ${pageCount} | ImpactLog ESG Report`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    // Generate filename with proper .pdf extension
    const fileName = reportType === 'personal'
        ? `ImpactLog_Report_${user?.full_name?.replace(/\s+/g, '_') || 'User'}_${new Date().toISOString().split('T')[0]}.pdf`
        : `ImpactLog_Team_Report_${new Date().toISOString().split('T')[0]}.pdf`;

    try {
        // Output as blob and force correct MIME type
        const blob = doc.output('blob');
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });

        // Create download link
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName); // Force filename
        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);

        console.log('PDF report generated:', fileName);
    } catch (error) {
        console.error('Error generating PDF:', error);
        // Last resort fallback
        doc.save(fileName);
    }

    return fileName;
}

/**
 * Generate CSV export
 * @param {Array} activities - Activities to export
 */
export function generateCSV(activities) {
    const headers = ['Date', 'Type', 'Description', 'Quantity', 'Unit', 'CO₂ Saved (kg)', 'Impact Score', 'Status', 'Location'];

    const rows = activities.map(a => [
        new Date(a.activity_date).toISOString().split('T')[0],
        ACTIVITY_TYPES[a.activity_type]?.label || a.activity_type,
        `"${(a.description || '').replace(/"/g, '""')}"`,
        a.quantity || a.hours || 0,
        ACTIVITY_TYPES[a.activity_type]?.unit || '',
        (a.co2_saved || 0).toFixed(2),
        (a.impact_score || 0).toFixed(2),
        a.status,
        a.location || '',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `impactlog_activities_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
