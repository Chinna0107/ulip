import * as XLSX from 'xlsx';

// The path to the excel file in the public or assets folder.
// Since it's in src/assets, we can import it directly to get a URL, or fetch it if we put it in public.
// But Vite allows importing assets as URLs:
import excelFileUrl from '../assets/ULIP Budget.xlsx?url';

export const fetchExcelData = async () => {
  try {
    const response = await fetch(excelFileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const parsedData = {};

    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      if (jsonData.length === 0) {
        parsedData[sheetName] = { columns: [], data: [] };
        return;
      }

      // Check if the first row is just a title (very few columns compared to the next row)
      // or if it has a giant merged cell title.
      // A common pattern in this file is:
      // Row 0: ['TITLE', null, null, Total...]
      // Row 1: ['Header 1', 'Header 2', ...]
      // Row 2+: Data
      let headerRowIndex = 0;
      
      // If the second row has more items than the first, or the first row has many empty items,
      // it's highly likely the second row is the actual header.
      if (jsonData.length > 1) {
        const row0 = jsonData[0].filter(Boolean);
        const row1 = jsonData[1].filter(Boolean);
        
        // If row 1 has more actual text items than row 0, assume row 1 is the header
        if (row1.length > row0.length) {
          headerRowIndex = 1;
        }
      }

      const headers = jsonData[headerRowIndex] || [];
      // Clean up headers (remove undefined, convert to string, replace spaces with underscores for accessors)
      const columns = [];
      const validHeaderIndices = [];
      
      headers.forEach((header, index) => {
        if (header && String(header).trim() !== '') {
          columns.push({
            header: String(header).trim(),
            accessor: `col_${index}`
          });
          validHeaderIndices.push(index);
        }
      });

      // Extract data rows
      const dataRows = [];
      for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        
        // Skip completely empty rows
        if (!row || row.length === 0 || row.every(val => val == null || String(val).trim() === '')) {
          continue;
        }
        
        const rowData = {};
        let hasData = false;
        
        validHeaderIndices.forEach(colIndex => {
          const val = row[colIndex];
          if (val != null && String(val).trim() !== '') {
            rowData[`col_${colIndex}`] = val;
            hasData = true;
          }
        });

        if (hasData) {
          dataRows.push(rowData);
        }
      }

      parsedData[sheetName] = { columns, data: dataRows };
    });

    return parsedData;
  } catch (error) {
    console.error("Error reading Excel file:", error);
    return null;
  }
};
