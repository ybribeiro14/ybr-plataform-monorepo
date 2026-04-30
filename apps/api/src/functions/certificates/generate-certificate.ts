import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
  certificates,
  courseModules,
  courses,
  creators,
  db,
  enrollments,
  lessonProgress,
  lessons,
  users,
} from "@ybr/database";
import { and, count, eq } from "drizzle-orm";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { uuidv7 } from "uuidv7";
import { R2_BUCKET, R2_PUBLIC_URL, r2 } from "../../infrastructure/storage/r2";

interface GenerateCertificateParams {
  courseId: string;
  userId: string;
}

interface CertificateResult {
  certificateId: string;
  verificationCode: string;
  certificateUrl: string | null;
  studentName: string;
  courseTitle: string;
  issuedAt: string;
}

const throwError = (
  message: string,
  statusCode: number,
  code: string,
): never => {
  const error = new Error(message) as Error & {
    statusCode: number;
    code: string;
  };
  error.statusCode = statusCode;
  error.code = code;
  throw error;
};

const buildCertificatePdf = async (
  studentName: string,
  courseTitle: string,
  creatorName: string,
  verificationCode: string,
  completionDate: Date,
): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();
  // A4 landscape
  const page = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const stone900 = rgb(0.11, 0.1, 0.09); // #1c1917
  const stone500 = rgb(0.47, 0.44, 0.42); // #78716c
  const stone300 = rgb(0.84, 0.82, 0.82); // #d6d3d1
  const gold = rgb(0.71, 0.53, 0.12); // warm gold accent

  // Outer border
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: stone300,
    borderWidth: 1,
  });

  // Inner decorative border
  page.drawRectangle({
    x: 32,
    y: 32,
    width: width - 64,
    height: height - 64,
    borderColor: gold,
    borderWidth: 0.5,
    opacity: 0.6,
  });

  // Gold top accent line
  page.drawRectangle({
    x: 32,
    y: height - 32,
    width: width - 64,
    height: 3,
    color: gold,
    opacity: 0.8,
  });

  // Gold bottom accent line
  page.drawRectangle({
    x: 32,
    y: 32,
    width: width - 64,
    height: 3,
    color: gold,
    opacity: 0.8,
  });

  // Header label
  const headerText = "CERTIFICADO DE CONCLUSÃO";
  const headerSize = 11;
  const headerWidth = fontBold.widthOfTextAtSize(headerText, headerSize);
  page.drawText(headerText, {
    x: (width - headerWidth) / 2,
    y: height - 90,
    size: headerSize,
    font: fontBold,
    color: gold,
  });

  // Decorative line below header
  page.drawRectangle({
    x: width / 2 - 60,
    y: height - 100,
    width: 120,
    height: 0.5,
    color: stone300,
  });

  // "Este certificado atesta que"
  const preText = "Este certificado atesta que";
  const preSize = 13;
  const preWidth = fontRegular.widthOfTextAtSize(preText, preSize);
  page.drawText(preText, {
    x: (width - preWidth) / 2,
    y: height - 145,
    size: preSize,
    font: fontRegular,
    color: stone500,
  });

  // Student name — large
  const nameSize = 42;
  const nameWidth = fontBold.widthOfTextAtSize(studentName, nameSize);
  const nameX = Math.max(48, (width - nameWidth) / 2);
  page.drawText(studentName, {
    x: nameX,
    y: height - 210,
    size: nameSize,
    font: fontBold,
    color: stone900,
    maxWidth: width - 96,
  });

  // Name underline
  const underlineWidth = Math.min(nameWidth, width - 96);
  page.drawRectangle({
    x: nameX,
    y: height - 216,
    width: underlineWidth,
    height: 1,
    color: gold,
    opacity: 0.5,
  });

  // "concluiu com êxito o curso"
  const midText = "concluiu com êxito o curso";
  const midSize = 13;
  const midWidth = fontRegular.widthOfTextAtSize(midText, midSize);
  page.drawText(midText, {
    x: (width - midWidth) / 2,
    y: height - 255,
    size: midSize,
    font: fontRegular,
    color: stone500,
  });

  // Course title — medium-large
  const titleSize = 26;
  const titleWidth = fontBold.widthOfTextAtSize(courseTitle, titleSize);
  page.drawText(courseTitle, {
    x: Math.max(48, (width - titleWidth) / 2),
    y: height - 305,
    size: titleSize,
    font: fontBold,
    color: stone900,
    maxWidth: width - 96,
  });

  // Instructor label
  const instructorLabel = `Instrutor(a): ${creatorName}`;
  const instructorSize = 11;
  const instructorWidth = fontItalic.widthOfTextAtSize(
    instructorLabel,
    instructorSize,
  );
  page.drawText(instructorLabel, {
    x: (width - instructorWidth) / 2,
    y: height - 350,
    size: instructorSize,
    font: fontItalic,
    color: stone500,
  });

  // Completion date
  const dateStr = completionDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const dateLabel = `Concluído em ${dateStr}`;
  const dateSize = 11;
  const dateWidth = fontRegular.widthOfTextAtSize(dateLabel, dateSize);
  page.drawText(dateLabel, {
    x: (width - dateWidth) / 2,
    y: height - 390,
    size: dateSize,
    font: fontRegular,
    color: stone500,
  });

  // Separator line
  page.drawRectangle({
    x: width / 2 - 80,
    y: height - 420,
    width: 160,
    height: 0.5,
    color: stone300,
  });

  // Verification code label
  const codeLabel = "Código de verificação:";
  const codeLabelSize = 8;
  const codeLabelWidth = fontRegular.widthOfTextAtSize(
    codeLabel,
    codeLabelSize,
  );
  page.drawText(codeLabel, {
    x: (width - codeLabelWidth) / 2,
    y: height - 445,
    size: codeLabelSize,
    font: fontRegular,
    color: stone500,
  });

  // Verification code value
  const codeText = verificationCode.toUpperCase();
  const codeSize = 9;
  const codeWidth = fontBold.widthOfTextAtSize(codeText, codeSize);
  page.drawText(codeText, {
    x: (width - codeWidth) / 2,
    y: height - 460,
    size: codeSize,
    font: fontBold,
    color: stone900,
  });

  // Bottom platform attribution
  const platformText = "Emitido pela YBR Platform";
  const platformSize = 8;
  const platformWidth = fontRegular.widthOfTextAtSize(
    platformText,
    platformSize,
  );
  page.drawText(platformText, {
    x: (width - platformWidth) / 2,
    y: 52,
    size: platformSize,
    font: fontRegular,
    color: stone500,
  });

  return pdfDoc.save();
};

const generateCertificate = async ({
  courseId,
  userId,
}: GenerateCertificateParams): Promise<CertificateResult> => {
  // Check enrollment
  const [enrollment] = await db
    .select({ id: enrollments.id, status: enrollments.status })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, courseId),
        eq(enrollments.status, "active"),
      ),
    )
    .limit(1);

  if (!enrollment) {
    throwError("Not enrolled in this course", 403, "NOT_ENROLLED");
  }

  // Check if certificate already exists
  const [existing] = await db
    .select({
      id: certificates.id,
      verificationCode: certificates.verificationCode,
      certificateUrl: certificates.certificateUrl,
      issuedAt: certificates.issuedAt,
    })
    .from(certificates)
    .where(
      and(eq(certificates.userId, userId), eq(certificates.courseId, courseId)),
    )
    .limit(1);

  // Get student + course + creator info
  const [courseInfo] = await db
    .select({
      courseTitle: courses.title,
      creatorName: users.name,
    })
    .from(courses)
    .innerJoin(creators, eq(courses.creatorId, creators.id))
    .innerJoin(users, eq(creators.userId, users.id))
    .where(eq(courses.id, courseId))
    .limit(1);

  if (!courseInfo) {
    throwError("Course not found", 404, "COURSE_NOT_FOUND");
  }

  const [studentInfo] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!studentInfo) {
    throwError("User not found", 404, "USER_NOT_FOUND");
  }

  if (existing) {
    return {
      certificateId: existing.id,
      verificationCode: existing.verificationCode,
      certificateUrl: existing.certificateUrl,
      studentName: studentInfo!.name,
      courseTitle: courseInfo!.courseTitle,
      issuedAt: existing.issuedAt.toISOString(),
    };
  }

  // Calculate completion: all lessons must be marked complete
  const totalResult = await db
    .select({ totalLessons: count(lessons.id) })
    .from(lessons)
    .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
    .where(eq(courseModules.courseId, courseId));

  const completedResult = await db
    .select({ completedLessons: count(lessonProgress.id) })
    .from(lessonProgress)
    .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
    .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(courseModules.courseId, courseId),
      ),
    );

  const totalLessons = totalResult[0]?.totalLessons ?? 0;
  const completedLessons = completedResult[0]?.completedLessons ?? 0;

  if (totalLessons === 0 || completedLessons < totalLessons) {
    throwError(
      `Course not completed. Progress: ${completedLessons}/${totalLessons} lessons`,
      400,
      "COURSE_NOT_COMPLETED",
    );
  }

  const verificationCode = uuidv7();
  const issuedAt = new Date();

  // Generate PDF
  const pdfBytes = await buildCertificatePdf(
    studentInfo!.name,
    courseInfo!.courseTitle,
    courseInfo!.creatorName,
    verificationCode,
    issuedAt,
  );

  // Upload to R2 (optional — skip if R2 not configured)
  let certificateUrl: string | null = null;
  const r2Key = `certificates/${verificationCode}.pdf`;

  if (r2) {
    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: r2Key,
        Body: Buffer.from(pdfBytes),
        ContentType: "application/pdf",
        ContentDisposition: `inline; filename="certificado-${courseId}.pdf"`,
      }),
    );
    certificateUrl = R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${r2Key}` : null;
  }

  // Store in DB
  const [cert] = await db
    .insert(certificates)
    .values({
      userId,
      courseId,
      enrollmentId: enrollment!.id,
      certificateUrl,
      verificationCode,
    })
    .returning();

  if (!cert) {
    throwError(
      "Failed to create certificate record",
      500,
      "CERTIFICATE_CREATION_FAILED",
    );
  }

  return {
    certificateId: cert!.id,
    verificationCode: cert!.verificationCode,
    certificateUrl: cert!.certificateUrl,
    studentName: studentInfo!.name,
    courseTitle: courseInfo!.courseTitle,
    issuedAt: cert!.issuedAt.toISOString(),
  };
};

export { generateCertificate };
export type { CertificateResult };
