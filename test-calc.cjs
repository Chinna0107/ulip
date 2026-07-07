const axios = require('axios');
(async () => {
  const mpRes = await axios.get('http://localhost:5001/api/records/Manpower%20');
  const calculateTotal = (res, columnKeywords) => {
    if (!res.data || !res.data.columns || !res.data.data) return 0;
    const { columns, data } = res.data;
    
    let totalKey = null;
    for (const keyword of columnKeywords) {
      let col = columns.find(c => c.header && c.header.trim().toLowerCase() === keyword.toLowerCase());
      if (!col) {
        col = columns.find(c => c.header && c.header.toLowerCase().includes(keyword.toLowerCase()));
      }
      if (col) {
        totalKey = col.accessor;
        console.log("Found key:", totalKey, "for keyword:", keyword);
        break;
      }
    }
    
    console.log("totalKey:", totalKey);
    if (!totalKey) return 0;
    
    return data.reduce((sum, row) => {
      const val = parseFloat(row[totalKey]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  };
  
  const total = calculateTotal({ data: mpRes.data }, ['Total Amount per month', 'Total Amount', 'Grand Total']);
  console.log("Calculated Total:", total);
})();
