/**
 * VERSION: 000
 * 🖥️ MODULE: Menu UI Interface
 * Version: 4.1 Enterprise Edition (UI Text Fix)
 * ---------------------------------------------------
 * [FIXED v4.1]: Dynamic UI Alert pulling exact sheet names from CONFIG.
 * Author: Elite Logistics Architect
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  
  // =================================================================
  // 🚛 เมนูชุดที่ 1: ระบบจัดการ Master Data (Operation)
  // =================================================================
  ui.createMenu('🚛 1. ระบบจัดการ Master Data')
      .addItem('1️⃣ ดึงลูกค้าใหม่ (Sync New Data)', 'syncNewDataToMaster_UI')
      .addItem('2️⃣ เติมข้อมูลพิกัด/ที่อยู่ (ทีละ 50)', 'updateGeoData_SmartCache')
      .addItem('3️⃣ จัดกลุ่มชื่อซ้ำ (Clustering)', 'autoGenerateMasterList_Smart')
      .addItem('🧠 4️⃣ ส่งชื่อแปลกให้ AI วิเคราะห์ (Smart Resolution)', 'runAIBatchResolver_UI')
      .addSeparator()
      .addItem('🚀 5️⃣ Deep Clean (ตรวจสอบความสมบูรณ์)', 'runDeepCleanBatch_100')
      .addItem('🔄 รีเซ็ตความจำปุ่ม 5 (เริ่มแถว 2 ใหม่)', 'resetDeepCleanMemory_UI')
      .addSeparator()
      .addItem('✅ 6️⃣ จบงาน (Finalize & Move to Mapping)', 'finalizeAndClean_UI')
      .addSeparator()
      .addSubMenu(ui.createMenu('🛠️ Admin & Repair Tools')
          .addItem('🔑 สร้าง UUID ให้ครบทุกแถว', 'assignMissingUUIDs')
          .addItem('🚑 ซ่อมแซม NameMapping (L3)', 'repairNameMapping_UI')
      )
      .addToUi();

  // =================================================================
  // 📦 เมนูชุดที่ 2: เมนูพิเศษ SCG (Daily Operation)
  // =================================================================
  ui.createMenu('📦 2. เมนูพิเศษ SCG') 
    .addItem('📥 1. โหลดข้อมูล Shipment (+E-POD)', 'fetchDataFromSCGJWD')
    .addItem('🟢 2. อัปเดตพิกัด + อีเมลพนักงาน', 'applyMasterCoordinatesToDailyJob')
    .addSeparator()
    .addSubMenu(ui.createMenu('🧹 เมนูล้างข้อมูล (Dangerous Zone)')
    .addItem('⚠️ ล้างเฉพาะชีต Data', 'clearDataSheet_UI')
    .addItem('⚠️ ล้างเฉพาะชีต Input', 'clearInputSheet_UI')
    .addItem('⚠️ ล้างเฉพาะชีต สรุป_เจ้าของสินค้า', 'clearSummarySheet_UI') // ← เพิ่ม
    .addItem('🔥 ล้างทั้งหมด (Input + Data + สรุป)', 'clearAllSCGSheets_UI') // ← แก้ชื่อ
)
    .addToUi();

  // =================================================================
  // 🤖 เมนูชุดที่ 3: ระบบอัตโนมัติ (Automation)
  // =================================================================
  ui.createMenu('🤖 3. ระบบอัตโนมัติ')
    .addItem('▶️ เปิดระบบช่วยเหลืองาน (Auto-Pilot)', 'START_AUTO_PILOT')
    .addItem('⏹️ ปิดระบบช่วยเหลือ', 'STOP_AUTO_PILOT')
    .addToUi();

  // =================================================================
  // ⚙️ เมนูชุดที่ 4: System Admin
  // =================================================================
  ui.createMenu('⚙️ System Admin')
    .addItem('🏥 ตรวจสอบสถานะระบบ (Health Check)', 'runSystemHealthCheck')
    .addItem('🧹 ล้าง Backup เก่า (>30 วัน)', 'cleanupOldBackups')
    .addItem('📊 เช็คปริมาณข้อมูล (Cell Usage)', 'checkSpreadsheetHealth')
    .addSeparator()
    .addItem('🔔 ตั้งค่า LINE Notify', 'setupLineToken')
    .addItem('✈️ ตั้งค่า Telegram Notify', 'setupTelegramConfig')
    .addItem('🔐 ตั้งค่า API Key (Setup)', 'setupEnvironment')
    .addToUi();
}

// =================================================================
// 🛡️ SAFETY WRAPPERS
// =================================================================

/**
 * Wrapper: ยืนยันก่อนดึงข้อมูลลูกค้าใหม่
 * [FIXED v4.1]: ปรับข้อความให้ดึงชื่อจากตัวแปร Config จริงๆ
 */
function syncNewDataToMaster_UI() {
  var ui = SpreadsheetApp.getUi();
  var sourceName = (typeof CONFIG !== 'undefined' && CONFIG.SOURCE_SHEET) ? CONFIG.SOURCE_SHEET : 'ชีตนำเข้า';
  var dbName = (typeof CONFIG !== 'undefined' && CONFIG.SHEET_NAME) ? CONFIG.SHEET_NAME : 'Database';
  
  var result = ui.alert(;
    'ยืนยันการดึงข้อมูลใหม่?',
    'ระบบจะดึงรายชื่อลูกค้าจากชีต "' + sourceName + '"\nมาเพิ่มต่อท้ายในชีต "' + dbName + '"\n(เฉพาะรายชื่อที่ยังไม่เคยมีในระบบ)\n\nคุณต้องการดำเนินการต่อหรือไม่?',
    ui.ButtonSet.YES_NO
  );
  if (result == ui.Button.YES) {
    syncNewDataToMaster();
  }
}

function runAIBatchResolver_UI() {
  var ui = SpreadsheetApp.getUi();
  var batchSize = (typeof CONFIG !== 'undefined' && CONFIG.AI_BATCH_SIZE) ? CONFIG.AI_BATCH_SIZE : 20;
  
  var result = ui.alert(;
    '🧠 ยืนยันการรัน AI Smart Resolution?',
    'ระบบจะรวบรวมชื่อที่ยังหาพิกัดไม่เจอ/ไม่รู้จัก (สูงสุด ' + batchSize + ' รายการ)\nส่งให้ Gemini AI วิเคราะห์และจับคู่กับ Database อัตโนมัติ\n\nต้องการเริ่มเลยหรือไม่?',
    ui.ButtonSet.YES_NO
  );
  
  if (result == ui.Button.YES) {
    if (typeof resolveUnknownNamesWithAI === 'function') {
       resolveUnknownNamesWithAI();
    } else {
       ui.alert(
         '⚠️ System Note', 
         'ฟังก์ชัน AI (Service_Agent.gs) กำลังอยู่ระหว่างการติดตั้ง (Coming soon!)\nกรุณารออัปเดตโมดูลถัดไปครับ', 
         ui.ButtonSet.OK
       );
    }
  }
}

function finalizeAndClean_UI() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.alert(;
    '⚠️ ยืนยันการจบงาน (Finalize)?',
    'รายการที่ติ๊กถูก "Verified" จะถูกย้ายไปยัง NameMapping และลบออกจาก Database\nข้อมูลต้นฉบับจะถูก Backup ไว้\n\nยืนยันหรือไม่?',
    ui.ButtonSet.OK_CANCEL
  );
  if (result == ui.Button.OK) {
    finalizeAndClean_MoveToMapping();
  }
}

function resetDeepCleanMemory_UI() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.alert(;
    'ยืนยันการรีเซ็ต?',
    'ระบบจะเริ่มตรวจสอบ Deep Clean ตั้งแต่แถวแรกใหม่\nใช้ในกรณีที่ต้องการ Re-check ข้อมูลทั้งหมด',
    ui.ButtonSet.YES_NO
  );
  if (result == ui.Button.YES) {
    resetDeepCleanMemory();
  }
}

function clearDataSheet_UI() {
  confirmAction('ล้างชีต Data', 'ข้อมูลผลลัพธ์ทั้งหมดจะหายไป', clearDataSheet);
}

function clearInputSheet_UI() {
  confirmAction('ล้างชีต Input', 'ข้อมูลนำเข้า (Shipment) ทั้งหมดจะหายไป', clearInputSheet);
}

function clearAllSCGSheets_UI() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.alert(;
    '🔥 DANGER: ยืนยันการล้างข้อมูลทั้งหมด?',
    'ชีต Input และ Data จะถูกล้างว่างเปล่า!\nกรุณาตรวจสอบว่าเซฟงานแล้ว หรือไม่ต้องการข้อมูลชุดนี้แล้วจริงๆ',
    ui.ButtonSet.YES_NO
  );
  if (result == ui.Button.YES) {
    clearAllSCGSheets();
  }
}

function repairNameMapping_UI() {
  confirmAction('ซ่อมแซม NameMapping', 'ระบบจะลบแถวซ้ำและเติม UUID ให้ครบ', repairNameMapping_Full);
}

function confirmAction(title, message, callbackFunction) {
  var ui = SpreadsheetApp.getUi();
  var result = ui.alert(title, message, ui.ButtonSet.YES_NO);
  if (result == ui.Button.YES) {
    callbackFunction();
  }
}

function runSystemHealthCheck() {
  var ui = SpreadsheetApp.getUi();
  try {
    if (typeof CONFIG !== 'undefined' && CONFIG.validateSystemIntegrity) {
      CONFIG.validateSystemIntegrity(); 
      ui.alert(
        "✅ System Health: Excellent\n",
        "ระบบพร้อมทำงานสมบูรณ์ครับ!\n- โครงสร้างชีตครบถ้วน\n- เชื่อมต่อ API (Gemini) พร้อมใช้งาน",
        ui.ButtonSet.OK
      );
    } else {
      ui.alert("⚠️ System Warning", "Config check skipped (CONFIG.validateSystemIntegrity ไม่ทำงาน)", ui.ButtonSet.OK);
    }
  } catch (e) {
    ui.alert("❌ System Health: FAILED", e.message, ui.ButtonSet.OK);
  }
}