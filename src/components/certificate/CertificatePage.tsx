// src/components/certificate/CertificatePage.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Share2 } from "lucide-react";
import { useRef } from "react";

interface CertificatePageProps {
  certificate: any;
  user: any;
  attempt: any;
}

export default function CertificatePage({
  certificate,
  user,
  attempt,
}: CertificatePageProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    const element = certificateRef.current;
    if (!element) return;

    // Dynamic import to avoid SSR issues
    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).default;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape", "mm", "a4");

    const imgWidth = 297; // A4 landscape width
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`certificate-${certificate.certificateNumber}.pdf`);
  };

  const percentage = Math.round((attempt.totalScore / attempt.maxScore) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            🎉 Congratulations!
          </h1>
          <p className="text-gray-600">
            Your certificate has been generated successfully
          </p>
        </div>

        {/* Certificate */}
        <Card className="mb-8 overflow-hidden">
          <div
            ref={certificateRef}
            className="bg-gradient-to-br from-blue-50 to-indigo-100 p-12 text-center"
            style={{ minHeight: "600px" }}
          >
            <div className="border-8 border-blue-600 p-8 bg-white rounded-lg shadow-lg">
              <div className="mb-6">
                <h2 className="text-4xl font-bold text-blue-800 mb-2">
                  CERTIFICATE OF COMPLETION
                </h2>
                <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
              </div>

              <div className="mb-8">
                <p className="text-lg text-gray-600 mb-4">
                  This is to certify that
                </p>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">
                  {user.name}
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  has successfully completed the Integrity Assessment Quiz
                </p>
              </div>

              <div className="grid grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {attempt.totalScore}
                  </div>
                  <div className="text-sm text-gray-600">Score Achieved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {percentage}%
                  </div>
                  <div className="text-sm text-gray-600">Percentage</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {attempt.passScore}
                  </div>
                  <div className="text-sm text-gray-600">Pass Mark</div>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="text-left">
                  <div className="text-sm text-gray-600">
                    Certificate Number
                  </div>
                  <div className="font-mono text-sm">
                    {certificate.certificateNumber}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Date Issued</div>
                  <div className="font-semibold">
                    {certificate.issueDate.toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <Share2 className="w-4 h-4" />
            <span>Share Certificate</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
