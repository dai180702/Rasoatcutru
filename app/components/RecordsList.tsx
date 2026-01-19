'use client';

import { VerificationData } from '../page';
import { Timestamp } from 'firebase/firestore';

interface RecordsListProps {
  records: (VerificationData & { id: string; ngayKiemTra: string; createdAt?: Timestamp })[];
  onDelete: (id: string) => void;
}

function formatDateDdMmYyyy(input: string): string {
  if (!input) return '';

  // Already dd/mm/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(input.trim())) return input.trim();

  // yyyy-mm-dd or yyyy/mm/dd
  const m = input.trim().match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
  if (m) {
    const [, yyyy, mm, dd] = m;
    return `${dd}/${mm}/${yyyy}`;
  }

  return input;
}

function formatDateTime(createdAt?: Timestamp): string {
  if (!createdAt) return '';
  
  const date = createdAt.toDate();
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export default function RecordsList({ records, onDelete }: RecordsListProps) {
  const handleExportExcel = async () => {
    // ExcelJS để làm file giống mẫu (merge cells + border + căn lề)
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('PHỤ LỤC 1B - TẠM TRÚ');

    const thinBorder = {
      top: { style: 'thin' as const },
      left: { style: 'thin' as const },
      bottom: { style: 'thin' as const },
      right: { style: 'thin' as const },
    };

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = String(today.getFullYear());
    const ddMmYyyy = `${dd}/${mm}/${yyyy}`;

    // Set column widths (A..M)
    worksheet.columns = [
      { key: 'stt', width: 6 }, // A
      { key: 'hoten', width: 22 }, // B
      { key: 'ngaysinh', width: 16 }, // C
      { key: 'sodinhdanh', width: 20 }, // D
      { key: 'xaphuong', width: 18 }, // E
      { key: 'tinh', width: 18 }, // F
      { key: 'noio', width: 32 }, // G
      { key: 'datamtru', width: 10 }, // H
      { key: 'chuatamtru', width: 10 }, // I
      { key: 'nghenghiep', width: 18 }, // J
      { key: 'sdt', width: 16 }, // K
      { key: 'baucu', width: 12 }, // L
      { key: 'ngayGioNhap', width: 18 }, // M - Ngày giờ nhập
    ];

    // Title / header (giống mẫu)
    worksheet.mergeCells('A1:H1');
    worksheet.getCell('A1').value = 'TỔNG RÀ SOÁT KIỂM TRA CƯ TRÚ TRÊN ĐỊA BÀN PHƯỜNG TÂN UYÊN';
    worksheet.getCell('A1').font = { bold: true, size: 14 };
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

    worksheet.mergeCells('I1:J1');
    worksheet.getCell('I1').value = 'Ngày:';
    worksheet.getCell('I1').alignment = { horizontal: 'right', vertical: 'middle' };
    worksheet.getCell('I1').font = { bold: true };

    worksheet.mergeCells('K1:L1');
    worksheet.getCell('K1').value = ddMmYyyy;
    worksheet.getCell('K1').alignment = { horizontal: 'left', vertical: 'middle' };

    worksheet.mergeCells('J2:L2');
    worksheet.getCell('J2').value = 'PHỤ LỤC 1B\nTẠM TRÚ';
    worksheet.getCell('J2').font = { bold: true, size: 12 };
    worksheet.getCell('J2').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

    worksheet.getRow(1).height = 28;
    worksheet.getRow(2).height = 26;

    // Table header: 2 tầng, gộp ô "Hộ khẩu thường trú"
    // Row 3 + Row 4
    worksheet.getRow(3).height = 28;
    worksheet.getRow(4).height = 24;

    // Merge vertical header cells
    const mergeVertical = ['A', 'B', 'C', 'D', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
    mergeVertical.forEach((col) => worksheet.mergeCells(`${col}3:${col}4`));
    worksheet.mergeCells('E3:F3'); // Hộ khẩu thường trú

    worksheet.getCell('A3').value = 'STT';
    worksheet.getCell('B3').value = 'Họ tên';
    worksheet.getCell('C3').value = 'Ngày, tháng,\n năm sinh';
    worksheet.getCell('D3').value = 'Số định danh\ncá nhân';
    worksheet.getCell('E3').value = 'Hộ khẩu thường trú';
    worksheet.getCell('E4').value = 'Xã/phường';
    worksheet.getCell('F4').value = 'Tỉnh/thành phố';
    worksheet.getCell('G3').value = 'Nơi ở hiện tại\n(chi tiết)';
    worksheet.getCell('H3').value = 'Đã\nĐK\n tạm trú';
    worksheet.getCell('I3').value = 'Chưa\nĐK\n tạm trú';
    worksheet.getCell('J3').value = 'Nghề nghiệp';
    worksheet.getCell('K3').value = 'Số điện thoại';
    worksheet.getCell('L3').value = 'Đồng ý bầu cử\n tại Tân Uyên';
    worksheet.getCell('M3').value = 'Ngày giờ\nnhập';

    // Header styles + borders
    const headerCells = [
      'A3', 'B3', 'C3', 'D3', 'E3', 'E4', 'F4', 'G3', 'H3', 'I3', 'J3', 'K3', 'L3', 'M3',
      'F3', // merged range still needs style on top-left; adding for safety
      'A4', 'B4', 'C4', 'D4', 'G4', 'H4', 'I4', 'J4', 'K4', 'L4', 'M4',
    ];
    headerCells.forEach((addr) => {
      const cell = worksheet.getCell(addr);
      cell.font = { bold: true, size: 11 };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = thinBorder;
    });

    // Ensure border on full header area A3:M4
    for (let r = 3; r <= 4; r++) {
      for (let c = 1; c <= 13; c++) {
        const cell = worksheet.getRow(r).getCell(c);
        cell.border = thinBorder;
        if (!cell.alignment) {
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        }
      }
    }

    // Data rows start at row 5
    const startRow = 5;
    records.forEach((record, idx) => {
      const r = worksheet.getRow(startRow + idx);
      r.getCell(1).value = idx + 1; // STT
      r.getCell(2).value = record.hoTen;
      r.getCell(3).value = formatDateDdMmYyyy(record.ngaySinh);
      r.getCell(4).value = record.cccd;
      r.getCell(5).value = record.hkttXaPhuong;
      r.getCell(6).value = record.hkttTinhTP;
      r.getCell(7).value = record.noiOHienTai;
      r.getCell(8).value = record.dangKyTamTru === 'rồi' ? 'X' : '';
      r.getCell(9).value = record.dangKyTamTru === 'chưa' ? 'X' : '';
      r.getCell(10).value = record.ngheNghiep;
      r.getCell(11).value = record.soDienThoai;
      r.getCell(12).value = record.dangKyBauCuTanLap || '-';
      r.getCell(13).value = formatDateTime(record.createdAt);

      // Styles + borders
      for (let c = 1; c <= 13; c++) {
        const cell = r.getCell(c);
        cell.border = thinBorder;
        cell.alignment = {
          vertical: 'middle',
          horizontal: [1, 3, 4, 8, 9, 12, 13].includes(c) ? 'center' : 'left',
          wrapText: c === 7,
        };
      }
    });

    // Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PHU_LUC_1B_TAM_TRU_${dd}-${mm}-${yyyy}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (records.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p>Chưa có bản ghi nào. Hãy nhập thông tin để bắt đầu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Danh sách quản lý ({records.length} bản ghi)
        </h2>
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Xuất Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3">STT</th>
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">Ngày, tháng, năm sinh</th>
              <th className="px-4 py-3">Số định danh cá nhân</th>
              <th className="px-4 py-3">Xã/phường</th>
              <th className="px-4 py-3">Tỉnh/thành phố</th>
              <th className="px-4 py-3">Nơi ở hiện tại (chi tiết)</th>
              <th className="px-4 py-3 text-center">Đã ĐK tạm trú</th>
              <th className="px-4 py-3 text-center">Chưa ĐK tạm trú</th>
              <th className="px-4 py-3">Nghề nghiệp</th>
              <th className="px-4 py-3">Số điện thoại</th>
              <th className="px-4 py-3 text-center">Đồng ý bầu cử tại Tân Uyên</th>
              <th className="px-4 py-3 text-center">Ngày giờ nhập</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr
                key={record.id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                  {index + 1}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">
                  {record.hoTen}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">
                  {formatDateDdMmYyyy(record.ngaySinh)}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">
                  {record.cccd}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">
                  {record.hkttXaPhuong}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">
                  {record.hkttTinhTP}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-white max-w-xs">
                  <span className="block truncate">{record.noiOHienTai}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {record.dangKyTamTru === 'rồi' ? 'X' : ''}
                </td>
                <td className="px-4 py-3 text-center">
                  {record.dangKyTamTru === 'chưa' ? 'X' : ''}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">
                  {record.ngheNghiep}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">
                  {record.soDienThoai}
                </td>
                <td className="px-4 py-3 text-center text-gray-900 dark:text-white">
                  {record.dangKyBauCuTanLap || '-'}
                </td>
                <td className="px-4 py-3 text-center text-gray-900 dark:text-white text-xs">
                  {formatDateTime(record.createdAt)}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onDelete(record.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                    title="Xóa bản ghi"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

