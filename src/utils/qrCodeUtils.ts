import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export class QRCodeManager {
  static async generateQRCode(data: string, size: number = 256): Promise<string> {
    try {
      return await QRCode.toDataURL(data, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('QR Code generation failed:', error);
      throw error;
    }
  }

  static async createPoster(
    title: string,
    content: string,
    qrCodeUrl: string,
    language: string = 'en'
  ): Promise<string> {
    // Create a virtual poster element
    const poster = document.createElement('div');
    poster.style.cssText = `
      width: 595px;
      height: 842px;
      padding: 40px;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      font-family: 'Inter', sans-serif;
      position: fixed;
      top: -9999px;
      left: -9999px;
      z-index: -1;
    `;

    poster.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #16A34A; font-size: 24px; font-weight: bold; margin-bottom: 10px;">
          ${language === 'hi' ? 'डिजिटल नोटिस बोर्ड' : 'Digital Notice Board'}
        </h1>
        <p style="color: #6B7280; font-size: 16px;">
          ${language === 'hi' ? 'ग्राम पंचायत सूचना प्रणाली' : 'Gram Panchayat Information System'}
        </p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 30px;">
        <h2 style="color: #1F2937; font-size: 20px; font-weight: 600; margin-bottom: 15px;">${title}</h2>
        <p style="color: #374151; font-size: 14px; line-height: 1.5;">${content}</p>
      </div>
      
      <div style="text-align: center; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <p style="color: #1F2937; font-size: 16px; font-weight: 600; margin-bottom: 20px;">
          ${language === 'hi' ? 'ऑडियो सुनने के लिए QR कोड स्कैन करें' : 'Scan QR Code to Listen Audio'}
        </p>
        <img src="${qrCodeUrl}" style="width: 200px; height: 200px; margin: 0 auto; display: block;" />
        <p style="color: #6B7280; font-size: 12px; margin-top: 15px;">
          ${language === 'hi' ? 'कोई इंटरनेट कनेक्शन आवश्यक नहीं' : 'No internet connection required'}
        </p>
      </div>
    `;

    document.body.appendChild(poster);

    try {
      const canvas = await html2canvas(poster, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      document.body.removeChild(poster);
      return url;
    } catch (error) {
      document.body.removeChild(poster);
      throw error;
    }
  }
}