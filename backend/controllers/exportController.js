// backend/controllers/exportController.js
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');

// Generate Excel export
exports.generateExcel = (eventTitle, attendanceList) => {
    try {
        const ws = XLSX.utils.json_to_sheet(attendanceList.map((item, idx) => ({
            'No': idx + 1,
            'Nama': item.name,
            'Email': item.email,
            'No. Telp': item.phone,
            'Tipe': item.is_member ? 'Member' : 'Guest',
            'Status': item.status === 'attended' ? 'Hadir ✓' : 'Tidak Hadir',
            'Waktu Upload': item.uploaded_at ? new Date(item.uploaded_at).toLocaleString('id-ID') : '-'
        })));

        // Set column widths
        ws['!cols'] = [
            { wch: 5 },    // No
            { wch: 20 },   // Nama
            { wch: 25 },   // Email
            { wch: 15 },   // No. Telp
            { wch: 10 },   // Tipe
            { wch: 15 },   // Status
            { wch: 20 }    // Waktu Upload
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Kehadiran');

        // Generate buffer
        return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    } catch (err) {
        console.error('❌ Generate Excel Error:', err);
        throw err;
    }
};

// Generate PDF export
exports.generatePDF = (eventTitle, attendanceList) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40 });
            let buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // Title
            doc.fontSize(20).font('Helvetica-Bold').text('Laporan Kehadiran Peserta', { align: 'center' });
            doc.fontSize(14).text(eventTitle, { align: 'center' });
            doc.fontSize(10).text(`Tanggal: ${new Date().toLocaleString('id-ID')}`, { align: 'center' });

            doc.moveDown();

            // Summary
            const totalParticipants = attendanceList.length;
            const attended = attendanceList.filter(a => a.status === 'attended').length;
            const notAttended = totalParticipants - attended;
            const attendanceRate = totalParticipants > 0 ? Math.round((attended / totalParticipants) * 100) : 0;

            doc.fontSize(11).font('Helvetica-Bold').text('Ringkasan:');
            doc.fontSize(10).font('Helvetica');
            doc.text(`Total Peserta: ${totalParticipants} orang`);
            doc.text(`Hadir: ${attended} orang`);
            doc.text(`Tidak Hadir: ${notAttended} orang`);
            doc.text(`Persentase Kehadiran: ${attendanceRate}%`);

            doc.moveDown();

            // Table header
            doc.fontSize(10).font('Helvetica-Bold');
            const startY = doc.y;
            const colWidths = [30, 80, 100, 70, 60, 60];
            const columns = ['No', 'Nama', 'Email', 'No. Telp', 'Status', 'Tipe'];

            let x = 40;
            columns.forEach((col, idx) => {
                doc.text(col, x, startY);
                x += colWidths[idx];
            });

            // Draw line
            doc.moveTo(40, startY + 15).lineTo(550, startY + 15).stroke();

            // Table rows
            doc.fontSize(9).font('Helvetica');
            let y = startY + 25;
            const pageHeight = doc.page.height;
            const margin = 40;
            const maxY = pageHeight - margin;

            attendanceList.forEach((item, idx) => {
                if (y > maxY - 20) {
                    doc.addPage();
                    y = margin;
                }

                x = 40;
                doc.text(String(idx + 1), x, y, { width: colWidths[0] });
                x += colWidths[0];
                doc.text(item.name.substring(0, 20), x, y, { width: colWidths[1] });
                x += colWidths[1];
                doc.text(item.email.substring(0, 25), x, y, { width: colWidths[2] });
                x += colWidths[2];
                doc.text(item.phone || '-', x, y, { width: colWidths[3] });
                x += colWidths[3];
                const statusText = item.status === 'attended' ? 'Hadir ✓' : 'Tidak Hadir';
                doc.text(statusText, x, y, { width: colWidths[4] });
                x += colWidths[4];
                const typeText = item.is_member ? 'Member' : 'Guest';
                doc.text(typeText, x, y, { width: colWidths[5] });

                y += 20;
            });

            // Final line
            doc.moveTo(40, y).lineTo(550, y).stroke();

            // Footer
            doc.fontSize(8).text('Dokumen ini diproduksi oleh Sistem Kehadiran Event GLI', 40, maxY + 10, { align: 'center' });

            doc.end();

        } catch (err) {
            console.error('❌ Generate PDF Error:', err);
            reject(err);
        }
    });
};

// Export attendance as Excel
exports.exportAttendanceExcel = async (req, res) => {
    try {
        const { event_id } = req.params;
        const db = require('../config/db');

        // Get event
        const eventDoc = await db.collection('events').doc(event_id).get();
        if (!eventDoc.exists) {
            return res.status(404).json({ success: false, message: 'Event tidak ditemukan' });
        }

        // Get all registrations
        const regsSnap = await db.collection('event_registrations')
            .where('event_id', '==', event_id)
            .get();

        const attendanceList = [];

        for (const regDoc of regsSnap.docs) {
            const regData = regDoc.data();
            const proofSnap = await db.collection('attendance_proofs')
                .where('registration_id', '==', regDoc.id)
                .limit(1)
                .get();

            let proofData = null;
            if (!proofSnap.empty) {
                proofData = proofSnap.docs[0].data();
            }

            attendanceList.push({
                name: regData.name,
                email: regData.email,
                phone: regData.phone || '',
                is_member: regData.is_gli_member === 1,
                status: proofData ? 'attended' : 'not_attended',
                uploaded_at: proofData?.uploaded_at?.toDate?.().toISOString() || null
            });
        }

        const excelBuffer = exports.generateExcel(eventDoc.data().title, attendanceList);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Kehadiran_${eventDoc.data().title}_${Date.now()}.xlsx"`);
        res.send(excelBuffer);

    } catch (err) {
        console.error('❌ Export Excel Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Export attendance as PDF
exports.exportAttendancePDF = async (req, res) => {
    try {
        const { event_id } = req.params;
        const db = require('../config/db');

        // Get event
        const eventDoc = await db.collection('events').doc(event_id).get();
        if (!eventDoc.exists) {
            return res.status(404).json({ success: false, message: 'Event tidak ditemukan' });
        }

        // Get all registrations
        const regsSnap = await db.collection('event_registrations')
            .where('event_id', '==', event_id)
            .get();

        const attendanceList = [];

        for (const regDoc of regsSnap.docs) {
            const regData = regDoc.data();
            const proofSnap = await db.collection('attendance_proofs')
                .where('registration_id', '==', regDoc.id)
                .limit(1)
                .get();

            let proofData = null;
            if (!proofSnap.empty) {
                proofData = proofSnap.docs[0].data();
            }

            attendanceList.push({
                name: regData.name,
                email: regData.email,
                phone: regData.phone || '',
                is_member: regData.is_gli_member === 1,
                status: proofData ? 'attended' : 'not_attended',
                uploaded_at: proofData?.uploaded_at?.toDate?.().toISOString() || null
            });
        }

        const pdfBuffer = await exports.generatePDF(eventDoc.data().title, attendanceList);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Kehadiran_${eventDoc.data().title}_${Date.now()}.pdf"`);
        res.send(pdfBuffer);

    } catch (err) {
        console.error('❌ Export PDF Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
