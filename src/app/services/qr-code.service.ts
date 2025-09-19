import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QrCodeService {

  generateTournamentQR(tournamentId: string): string {
    const baseUrl = window.location.origin;
    const viewUrl = `${baseUrl}/scoreboard/${tournamentId}?access=view`;
    return this.generateQRCodeDataURL(viewUrl);
  }

  private generateQRCodeDataURL(text: string): string {
    // Simple QR code generation using a public API
    const size = 200;
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
  }

  downloadQRCode(tournamentId: string, tournamentName: string) {
    const qrUrl = this.generateTournamentQR(tournamentId);
    
    // Create download link
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `${tournamentName}-scoreboard-qr.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  printQRCode(tournamentId: string, tournamentName: string) {
    const qrUrl = this.generateTournamentQR(tournamentId);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Tournament QR Code - ${tournamentName}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px; 
              }
              .qr-container { 
                border: 2px solid #000; 
                padding: 20px; 
                margin: 20px auto; 
                width: fit-content; 
              }
              h1 { font-size: 24px; margin-bottom: 10px; }
              h2 { font-size: 18px; margin-bottom: 20px; }
              img { margin: 20px 0; }
              .instructions { 
                font-size: 14px; 
                margin-top: 20px; 
                max-width: 300px; 
                margin-left: auto; 
                margin-right: auto; 
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h1>${tournamentName}</h1>
              <h2>Live Scoreboard</h2>
              <img src="${qrUrl}" alt="QR Code" />
              <div class="instructions">
                Scan this QR code to view live tournament scores and standings
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }
}