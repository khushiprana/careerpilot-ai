export function exportAsPdf(filename: string, title: string, htmlContent: string) {
  const printWindow = window.open('', '_blank', 'width=850,height=950');
  if (!printWindow) {
    alert('Please allow popups to export PDF documents.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        <style>
          @page {
            margin: 15mm 15mm 20mm 15mm;
            size: A4 portrait;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            line-height: 1.5;
            padding: 24px;
            margin: 0 auto;
            max-width: 800px;
            background: #ffffff;
          }
          .header-banner {
            border-bottom: 2px solid #0284c7;
            padding-bottom: 12px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .header-title {
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
          }
          .header-sub {
            font-size: 11px;
            color: #64748b;
            margin-top: 4px;
          }
          h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 20px; margin-bottom: 10px; }
          h2 { font-size: 16px; font-weight: 700; color: #1e293b; margin-top: 18px; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
          h3 { font-size: 14px; font-weight: 600; color: #334155; margin-top: 14px; margin-bottom: 6px; }
          p, li { font-size: 12px; color: #334155; }
          ul, ol { padding-left: 20px; margin-top: 6px; margin-bottom: 10px; }
          li { margin-bottom: 4px; }
          .card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 12px;
          }
          .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-weight: 700;
            font-size: 11px;
            background: #e0f2fe;
            color: #0369a1;
          }
          .score-box {
            display: flex;
            align-items: center;
            gap: 12px;
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 10px 14px;
            margin-bottom: 16px;
          }
          .score-value {
            font-size: 24px;
            font-weight: 800;
            color: #0284c7;
          }
          .footer {
            margin-top: 30px;
            font-size: 10px;
            color: #94a3b8;
            text-align: center;
            border-top: 1px solid #f1f5f9;
            padding-top: 12px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="header-banner">
          <div>
            <div class="header-title">${title}</div>
            <div class="header-sub">CareerPilot AI • Executive Career Report • ${new Date().toLocaleDateString()}</div>
          </div>
        </div>
        ${htmlContent}
        <div class="footer">
          Generated via CareerPilot AI • AI Powered Career Intelligence
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
