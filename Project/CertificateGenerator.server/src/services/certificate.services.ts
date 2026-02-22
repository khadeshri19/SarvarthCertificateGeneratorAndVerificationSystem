import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import csvParser from 'csv-parser';
import archiver from 'archiver';
import * as certificateRepo from '../repository/certificate.repository';
import * as templateRepo from '../repository/template.repository';
import { generateCertificatePdf } from './pdf.services';
import { Certificate, BulkStudentData } from '../models/certificate.models';

export const generateSingleCertificate = async (
    userId: string,
    role: string,
    templateId: string,
    studentName: string,
    courseName: string,
    completionDate: string
) => {
    if (role === 'admin') {
        throw new Error('Admins are restricted from generating certificates. Only Users can generate certificates.');
    }

    const templateDetails = await templateRepo.getTemplateById(templateId, userId);
    if (!templateDetails) {
        throw new Error('Template not found.');
    }

    const fields = await templateRepo.getTemplateFields(templateId);

    const verificationCode = uuidv4().split('-')[0].toUpperCase();

    const certificate = await certificateRepo.createCertificate(
        templateId,
        userId,
        studentName,
        courseName,
        completionDate,
        verificationCode
    );

    const pdfPath = await generateCertificatePdf({
        certificate: {
            id: certificate.id,
            student_name: certificate.student_name,
            course_name: certificate.course_name,
            completion_date: certificate.completion_date,
            verification_code: certificate.verification_code
        },
        template: {
            template_image_path: templateDetails.template_image_path,
            canvas_width: templateDetails.canvas_width,
            canvas_height: templateDetails.canvas_height
        },
        fields: fields as any
    });

    await certificateRepo.updateCertificatePdfPath(certificate.id, pdfPath);

    return {
        certificate: { ...certificate, pdf_path: pdfPath },
        download_url: pdfPath
    };
};

export const generateBulkCertificates = async (
    userId: string,
    role: string,
    templateId: string,
    csvFilePath: string
) => {
    if (role === 'admin') {
        throw new Error('Admins are restricted from generating certificates. Only Users can generate certificates.');
    }

    const templateDetails = await templateRepo.getTemplateById(templateId, userId);
    if (!templateDetails) {
        throw new Error('Template not found.');
    }

    const fields = await templateRepo.getTemplateFields(templateId);
    const students: BulkStudentData[] = [];

    await new Promise<void>((resolve, reject) => {
        fs.createReadStream(csvFilePath)
            .pipe(csvParser())
            .on('data', (row: any) => {
                students.push({
                    student_name: row.Name || row.name || row.student_name,
                    course_name: row.Course || row.course || row.course_name,
                    completion_date: row['Completion Date'] || row.completion_date || row.date,
                });
            })
            .on('end', resolve)
            .on('error', reject);
    });

    if (students.length === 0) {
        throw new Error('CSV file is empty or has invalid format.');
    }

    const generatedCerts = [];
    const pdfPaths: string[] = [];

    for (const student of students) {
        const verificationCode = uuidv4().split('-')[0].toUpperCase();
        const certificate = await certificateRepo.createCertificate(
            templateId,
            userId,
            student.student_name,
            student.course_name,
            student.completion_date,
            verificationCode
        );

        const pdfPath = await generateCertificatePdf({
            certificate: {
                id: certificate.id,
                student_name: certificate.student_name,
                course_name: certificate.course_name,
                completion_date: certificate.completion_date,
                verification_code: certificate.verification_code
            },
            template: {
                template_image_path: templateDetails.template_image_path,
                canvas_width: templateDetails.canvas_width,
                canvas_height: templateDetails.canvas_height
            },
            fields: fields as any
        });

        await certificateRepo.updateCertificatePdfPath(certificate.id, pdfPath);
        generatedCerts.push({ ...certificate, pdf_path: pdfPath });
        // Normalize path for Windows: strip leading slash/backslash
        const normalizedPdfPath = pdfPath.replace(/^[/\\]+/, "");
        pdfPaths.push(path.join(__dirname, '..', '..', normalizedPdfPath));
    }

    // Create ZIP
    const zipFilename = `certificates_bulk_${Date.now()}.zip`;
    const zipPath = `/generated/${zipFilename}`;
    const zipFullPath = path.join(__dirname, '..', '..', 'generated', zipFilename);

    const output = fs.createWriteStream(zipFullPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);

    for (const pdfFullPath of pdfPaths) {
        if (fs.existsSync(pdfFullPath)) {
            archive.file(pdfFullPath, { name: path.basename(pdfFullPath) });
        }
    }

    await archive.finalize();

    return {
        message: `${generatedCerts.length} certificates generated.`,
        certificates: generatedCerts,
        zip_download_url: zipPath,
    };
};

export const getCertificates = async (userId: string) => {
    return await certificateRepo.getCertificatesByUserId(userId);
};

export const getCertificateDetails = async (id: string) => {
    const cert = await certificateRepo.getCertificateById(id);
    return cert;
};

export const getCertificatePdfPath = async (id: string) => {
    const cert = await certificateRepo.getCertificateById(id);
    if (!cert || !cert.pdf_path) return null;

    // Normalize path for Windows: strip leading slash/backslash
    const normalizedPdfPath = cert.pdf_path.replace(/^[/\\]+/, "");
    const pdfFullPath = path.join(__dirname, '..', '..', normalizedPdfPath);
    if (!fs.existsSync(pdfFullPath)) return null;

    return { path: pdfFullPath, filename: `certificate_${cert.student_name}.pdf` };
};
