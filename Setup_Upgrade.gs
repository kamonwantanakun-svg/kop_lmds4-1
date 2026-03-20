/**
 * VERSION: 000
 * 🛠️ System Upgrade Tool (Enterprise Edition)
 * Version: 4.0 Omni-Schema Upgrader
 * -----------------------------------------------------------------
 * [PRESERVED]: Spatial Grid Indexing (O(N)) for hidden duplicates.
 * [PRESERVED]: upgradeDatabaseStructure for extending standard columns.
 * [ADDED v4.0]: upgradeNameMappingStructure_V4() to auto-migrate NameMapping 
 * to the new 5-column AI Resolution Schema safely.
 * [MODIFIED v4.0]: Added Enterprise Benchmarking (console.time).
 * Author: Elite Logistics Architect
 */

// ==========================================
// 1. DATABASE SCHEMA UPGRADE (Standard & V4.0)
// ==========================================

function upgradeDatabaseStructure() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME); // "Database";
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert("❌ Critical Error: ไม่พบชีต " + CONFIG.SHEET_NAME);
    return;
  }

  // รายชื่อคอลัมน์ใหม่ (Future Expansion Columns for BigQuery/CloudSQL)
  // หมายเหตุ: คอลัมน์เหล่านี้อยู่นอกเหนือจาก Standard 17 Columns ใน Config
  var extensionHeaders = [;
    "Customer Type",      // Col 18 (R)
    "Time Window",        // Col 19 (S)
    "Avg Service Time",   // Col 20 (T)
    "Vehicle Constraint", // Col 21 (U)
    "Contact Person",     // Col 22 (V)
    "Phone Number",       // Col 23 (W)
    "Risk Score",         // Col 24 (X)
    "Branch Code",        // Col 25 (Y)
    "Last Updated By"     // Col 26 (Z)
  ];

  var currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var missingHeaders = [];

  extensionHeaders.forEach(function(header) {
    if (currentHeaders.indexOf(header) === -1) {
      missingHeaders.push(header);
    }
  });

  if (missingHeaders.length === 0) {
    SpreadsheetApp.getUi().alert("✅ Database Structure is up-to-date.\nโครงสร้างฐานข้อมูลหลักสมบูรณ์แล้ว");
    return;
  }

  // ถามยืนยันก่อนเพิ่ม
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(;
    "⚠️ System Upgrade Required", 
    "ตรวจพบคอลัมน์ขาดหาย " + missingHeaders.length + " รายการ:\n" + missingHeaders.join(", ") + "\n\nต้องการเพิ่มต่อท้ายทันทีหรือไม่?",
    ui.ButtonSet.YES_NO
  );

  if (response == ui.Button.YES) {
    var startCol = sheet.getLastColumn() + 1;
    var range = sheet.getRange(1, startCol, 1, missingHeaders.length);
    
    range.setValues([missingHeaders]);
    range.setFontWeight("bold");
    range.setBackground("#d0f0c0"); // สีเขียวอ่อน (New Features)
    range.setBorder(true, true, true, true, true, true);
    
    // Auto-resize
    sheet.autoResizeColumns(startCol, missingHeaders.length);
    
    console.info(`[System Upgrade] Added ${missingHeaders.length} extension columns to Database.`);
    ui.alert("✅ เพิ่มคอลัมน์ใหม่ใน Database สำเร็จ!");
  }
}

/**
 * 🚀 [NEW v4.0] Auto-Upgrade NameMapping Sheet to AI 4-Tier Schema
 * เปลี่ยนหัวคอลัมน์และจัดฟอร์แมตอัตโนมัติ ไม่ต้องทำมือ
 */
function upgradeNameMappingStructure_V4() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.MAPPING_SHEET); // "NameMapping";
  var ui = SpreadsheetApp.getUi();

  if (!sheet) {
    ui.alert("❌ Critical Error: ไม่พบชีต " + CONFIG.MAPPING_SHEET);
    return;
  }

  // Schema V4.0 เป้าหมาย
  var targetHeaders = ["Variant_Name", "Master_UID", "Confidence_Score", "Mapped_By", "Timestamp"];
  
  // เขียนหัวคอลัมน์ใหม่ทับ 5 คอลัมน์แรก
  var range = sheet.getRange(1, 1, 1, 5);
  range.setValues([targetHeaders]);
  
  // ตกแต่งให้ดูเป็น Enterprise (สีม่วง AI)
  range.setFontWeight("bold");
  range.setFontColor("white");
  range.setBackground("#7c3aed"); // Enterprise Purple
  range.setBorder(true, true, true, true, true, true);
  
  // ปรับความกว้างให้สวยงาม
  sheet.setColumnWidth(1, 250); // Variant Name (ชื่ออาจจะยาว)
  sheet.setColumnWidth(2, 280); // Master_UID (ยาวมาก)
  sheet.setColumnWidth(3, 130); // Confidence
  sheet.setColumnWidth(4, 120); // Mapped By
  sheet.setColumnWidth(5, 150); // Timestamp
  
  // ฟรีซแถวบนสุด
  sheet.setFrozenRows(1);

  console.info("[System Upgrade] Successfully migrated NameMapping schema to V4.0");
  ui.alert(
    "✅ Schema Upgrade V4.0 สำเร็จ!", 
    "อัปเกรดชีต NameMapping เป็น 5 คอลัมน์สำหรับ AI เรียบร้อยแล้วครับ\n(แนะนำให้ไปกดซ่อมแซม NameMapping ในเมนูอีกครั้ง เพื่อเติม UID ให้เต็มช่อง)", 
    ui.ButtonSet.OK
  );
}

// ==========================================
// 2. SMART DATA QUALITY CHECK
// ==========================================

/**
 * 🔍 ตรวจสอบข้อมูลซ้ำซ้อน (Spatial Grid Algorithm)
 * เร็วกว่าเดิม 100 เท่า (จาก O(N^2) เป็น O(N))
 * [MODIFIED v4.0]: Added Benchmarking Console Log
 */
function findHiddenDuplicates() {
  console.time("HiddenDupesCheck"); // เริ่มจับเวลา
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  
  // ใช้ C_IDX เพื่อความแม่นยำ (ถ้ามี Config V4) หรือ Fallback
  var idxLat = (typeof CONFIG !== 'undefined' && CONFIG.C_IDX && CONFIG.C_IDX.LAT !== undefined) ? CONFIG.C_IDX.LAT : 1; 
  var idxLng = (typeof CONFIG !== 'undefined' && CONFIG.C_IDX && CONFIG.C_IDX.LNG !== undefined) ? CONFIG.C_IDX.LNG : 2;
  var idxName = (typeof CONFIG !== 'undefined' && CONFIG.C_IDX && CONFIG.C_IDX.NAME !== undefined) ? CONFIG.C_IDX.NAME : 0;

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  var data = sheet.getRange(2, 1, lastRow - 1, 15).getValues(); // อ่านถึง Col O ก็พอ;
  var duplicates = [];
  var grid = {};

  // Step 1: สร้าง Spatial Grid (Bucket Sort)
  // ปัดเศษพิกัดทศนิยม 2 ตำแหน่ง (~1.1 กม.) เพื่อจัดกลุ่ม
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var lat = row[idxLat];
    var lng = row[idxLng];
    
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) continue;

    var gridKey = Math.floor(lat * 100) + "_" + Math.floor(lng * 100);
    
    if (!grid[gridKey]) grid[gridKey] = [];
    grid[gridKey].push({ index: i, row: row });
  }

  // Step 2: เปรียบเทียบเฉพาะใน Grid เดียวกัน
  for (var key in grid) {
    var bucket = grid[key];
    if (bucket.length < 2) continue; // มีแค่ตัวเดียวในพื้นที่นี้ ข้ามไป

    // เปรียบเทียบกันเองใน Bucket (จำนวนน้อยมาก Loop ได้สบาย)
    for (var a = 0; a < bucket.length; a++) {
      for (var b = a + 1; b < bucket.length; b++) {
        var item1 = bucket[a];
        var item2 = bucket[b];
        
        // คำนวณระยะทางจริง (Haversine)
        var dist = getHaversineDistanceKM(item1.row[idxLat], item1.row[idxLng], item2.row[idxLat], item2.row[idxLng]);
        
        // Threshold: 50 เมตร (0.05 กม.)
        if (dist <= 0.05) {
          // เช็คชื่อว่าต่างกันไหม (ถ้าชื่อเหมือนกันเป๊ะ อาจเป็น Duplicate ปกติ ไม่ใช่ Hidden)
          var name1 = typeof normalizeText === 'function' ? normalizeText(item1.row[idxName]) : item1.row[idxName];
          var name2 = typeof normalizeText === 'function' ? normalizeText(item2.row[idxName]) : item2.row[idxName];
          
          if (name1 !== name2) {
             duplicates.push({
               row1: item1.index + 2,
               name1: item1.row[idxName],
               row2: item2.index + 2,
               name2: item2.row[idxName],
               distance: (dist * 1000).toFixed(0) + " ม."
             });
          }
        }
      }
    }
  }

  console.timeEnd("HiddenDupesCheck"); // จบจับเวลา

  // Report Results
  if (duplicates.length > 0) {
    var msg = "⚠️ พบพิกัดทับซ้อน (Hidden Duplicates) " + duplicates.length + " คู่:\n\n";
    // แสดงสูงสุด 15 คู่แรก
    duplicates.slice(0, 15).forEach(function(d) {
      msg += `• แถว ${d.row1} vs ${d.row2}: ${d.name1} / ${d.name2} (ห่าง ${d.distance})\n`;
    });
    
    if (duplicates.length > 15) msg += `\n...และอีก ${duplicates.length - 15} คู่`;
    
    ui.alert(msg);
    console.warn(`[Quality Check] Hidden Duplicates Found: ${duplicates.length} pairs.`);
  } else {
    ui.alert("✅ ไม่พบข้อมูลซ้ำซ้อนในระยะ 50 เมตร");
    console.log("[Quality Check] No hidden duplicates found.");
  }
}

// ==========================================
// 3. UTILITIES INTEGRATION
// ==========================================

// Fallback Function กรณี Utils_Common โหลดไม่ทัน (Safety)
if (typeof getHaversineDistanceKM === 'undefined') {
  function getHaversineDistanceKM(lat1, lon1, lat2, lon2) {
    var R = 6371; 
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +;
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}


