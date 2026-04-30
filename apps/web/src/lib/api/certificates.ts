import type { ApiResponse } from "@ybr/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

const handleResponse = async <T>(response: Response): Promise<T> => {
  const body: ApiResponse<T> = await response.json();
  if (!response.ok || body.status === "error") {
    throw new Error(body.message ?? "Request failed");
  }
  return body.data as T;
};

export interface CertificateData {
  certificateId: string;
  verificationCode: string;
  certificateUrl: string | null;
  studentName: string;
  courseTitle: string;
  issuedAt: string;
}

export interface VerifiedCertificate {
  certificateId: string;
  verificationCode: string;
  studentName: string;
  courseTitle: string;
  creatorName: string;
  issuedAt: string;
  certificateUrl: string | null;
}

const generateCertificate = async (
  courseId: string,
  accessToken: string,
): Promise<CertificateData> => {
  const res = await fetch(`${BASE_URL}/student/certificates/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ courseId }),
  });
  return handleResponse<CertificateData>(res);
};

const verifyCertificate = async (
  code: string,
): Promise<VerifiedCertificate> => {
  const res = await fetch(
    `${BASE_URL}/certificates/${encodeURIComponent(code)}/verify`,
  );
  return handleResponse<VerifiedCertificate>(res);
};

export { generateCertificate, verifyCertificate };
