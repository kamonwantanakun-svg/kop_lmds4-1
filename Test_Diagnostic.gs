/**
 * VERSION: 000
 * 🏥 System Diagnostic Tool (Enterprise Edition)
 * Version: 4.0 Deep Scan & Schema Validation
 * -----------------------------------------------------------------
 * [PRESERVED]: Two-phase diagnostic approach (Engine & Sheets).
 * [ADDED v4.0]: Validates NameMapping V4.0 5-Column schema.
 * [ADDED v4.0]: Validates PostalRef sheet existence.
 * [ADDED v4.0]: Deep scan for LINE and Telegram tokens.
 * [MODIFIED v4.0]: Safe API Key extraction using try-catch for V4.0 Getter.
 * Author: Elite Logistics Architect
 */

// ==========================================
// 1. PHASE 1: ENGINE & DEPENDENCY CHECK
// ==========================================

/**
 * 🏥 System Diagnostic Tool (Phase 1: Engine Check)
 * สแกนหาฟังก์ชันหลักและ API Key ว่าเชื่อมต่อสมบูรณ์หรือไม่
 */
function RUN_SYSTEM_DIAGNOSTIC() {
  var ui = SpreadsheetApp.getUi();
  var logs = [];
  
  function pass(msg) { logs.push("✅ " + msg); }
  function warn(msg) { logs.push("⚠️ " + msg); }
  function fail(msg) { logs.push("❌ " + msg); }

  try {
    // 1. Config Check
    if (typeof CONFIG !== 'undefined') pass("System Variables: มองเห็นตัวแปร CONFIG");
    else fail("System Variables: มองไม่เห็นตัวแปร CONFIG");

    // 2. Utility Functions Check
    if (typeof md5 === 'function') pass("Core Utils: มองเห็นฟังก์ชัน md5()");
    else fail("Core Utils: มองไม่เห็นฟังก์ชัน md5()");

    if (typeof normalizeText === 'function') pass("Core Utils: มองเห็นฟังก์ชัน normalizeText()");
    else fail("Core Utils: มองไม่เห็นฟังก์ชัน normalizeText()");

    // 3. Geo Map API Check
    if (typeof GET_ADDR_WITH_CACHE === 'function') {
      try {
        var testGeo = GET_ADDR_WITH_CACHE(13.746, 100.539);
        if (testGeo && testGeo !== "Error") pass("Google Maps API: ทำงานปกติ (" + testGeo.substring(0, 20) + "...)");
        else warn("Google Maps API: โหลดได้แต่ส่งค่าแปลกๆ กลับมา");
      } catch (geoErr) {
        fail("Google Maps API: Error ระหว่างทดสอบ (" + geoErr.message + ")");
      }
    } else {
      fail("Google Maps API: ไม่พบฟังก์ชัน GET_ADDR_WITH_CACHE ใน Service_GeoAddr");
    }

    // 4. Security Vault Check (API Keys)
    var props = PropertiesService.getScriptProperties();
    
    // Gemini Key (V4.0 Safe Check)
    try {
      if (CONFIG && CONFIG.GEMINI_API_KEY) pass("AI Engine: ตรวจพบ GEMINI_API_KEY พร้อมใช้งาน");
    } catch (e) {
      fail("AI Engine: ไม่พบ GEMINI_API_KEY หรือตั้งค่าไม่ถูกต้อง (" + e.message + ")");
    }

    // Notifications Check
    if (props.getProperty('LINE_NOTIFY_TOKEN')) pass("Notifications: ตรวจพบ LINE Notify Token");
    else warn("Notifications: ยังไม่ได้ตั้งค่า LINE Notify");

    if (props.getProperty('TG_BOT_TOKEN') && props.getProperty('TG_CHAT_ID')) pass("Notifications: ตรวจพบ Telegram Config");
    else warn("Notifications: ยังไม่ได้ตั้งค่า Telegram");

    ui.alert("🏥 รายงานผลการสแกนระบบ (Engine V4.0):\n\n" + logs.join("\n"));
    console.info("[Diagnostic] Phase 1 (Engine) completed.");

  } catch (e) {
    console.error("[Diagnostic Error]: " + e.message);
    ui.alert("🚨 ระบบตรวจพบ Error ร้ายแรงระหว่างสแกน:\n" + e.message);
  }
}

// ==========================================
// 2. PHASE 2: DATA & STRUCTURE CHECK
// ==========================================

/**
 * 🕵️‍♂️ Sheet Diagnostic Tool (Phase 2: Data & Silent Exit Check)
 * ตรวจสอบว่ามีชีตครบตาม Config และมีโครงสร้างคอลัมน์ถูกต้องหรือไม่
 */
function RUN_SHEET_DIAGNOSTIC() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var logs = [];

  function pass(msg) { logs.push("✅ " + msg); }
  function warn(msg) { logs.push("⚠️ " + msg); }
  function fail(msg) { logs.push("❌ " + msg); }

  try {
    // 1. ตรวจสอบ Database Sheet
    var dbName = (typeof CONFIG !== 'undefined' && CONFIG.SHEET_NAME) ? CONFIG.SHEET_NAME : "Database";
    var dbSheet = ss.getSheetByName(dbName);
    if (dbSheet) {
      var rows = dbSheet.getLastRow();
      if (rows >= 2) pass("Master DB: พบชีต '" + dbName + "' (มีข้อมูล " + rows + " แถว)");
      else warn("Master DB: พบชีต '" + dbName + "' แต่ข้อมูลว่างเปล่า (มี " + rows + " แถว)");
    } else {
      fail("Master DB: ไม่พบชีตชื่อ '" + dbName + "' (ตรวจสอบเว้นวรรคท้ายชื่อด้วย)");
    }

    // 2. ตรวจสอบ Source Sheet
    var srcName = (typeof CONFIG !== 'undefined' && CONFIG.SOURCE_SHEET) ? CONFIG.SOURCE_SHEET : "SCGนครหลวงJWDภูมิภาค";
    var srcSheet = ss.getSheetByName(srcName);
    if (srcSheet) {
      pass("Source Data: พบชีต '" + srcName + "' (มีข้อมูล " + srcSheet.getLastRow() + " แถว)");
    } else {
      warn("Source Data: ไม่พบชีต '" + srcName + "'");
    }

    // 3. ตรวจสอบ Mapping Sheet (V4.0 Schema Check)
    var mapName = (typeof CONFIG !== 'undefined' && CONFIG.MAPPING_SHEET) ? CONFIG.MAPPING_SHEET : "NameMapping";
    var mapSheet = ss.getSheetByName(mapName);
    if (mapSheet) {
      var mapCols = mapSheet.getLastColumn();
      if (mapCols >= 5) {
        pass("Name Mapping: พบชีต '" + mapName + "' (โครงสร้าง 5 คอลัมน์ V4.0 ถูกต้อง)");
      } else {
        warn("Name Mapping: พบชีต '" + mapName + "' แต่มีแค่ " + mapCols + " คอลัมน์ (แนะนำให้ใช้เมนู Upgrade NameMapping เป็น V4.0)");
      }
    } else {
      fail("Name Mapping: ไม่พบชีต '" + mapName + "'");
    }

    // 4. ตรวจสอบ SCG Daily Data Sheet
    if (typeof SCG_CONFIG !== 'undefined') {
      var scgDataName = SCG_CONFIG.SHEET_DATA || "Data";
      var scgInputName = SCG_CONFIG.SHEET_INPUT || "Input";
      
      if (ss.getSheetByName(scgDataName)) pass("SCG Operation: พบชีต '" + scgDataName + "'");
      else warn("SCG Operation: ไม่พบชีต '" + scgDataName + "'");
      
      if (ss.getSheetByName(scgInputName)) pass("SCG Operation: พบชีต '" + scgInputName + "'");
      else warn("SCG Operation: ไม่พบชีต '" + scgInputName + "'");
    }

    // 5. ตรวจสอบ PostalRef Sheet (New V4.0 Requirement)
    var postalName = (typeof CONFIG !== 'undefined' && CONFIG.SHEET_POSTAL) ? CONFIG.SHEET_POSTAL : "PostalRef";
    if (ss.getSheetByName(postalName)) {
      pass("Geo Database: พบชีต '" + postalName + "' สำหรับอ้างอิงรหัสไปรษณีย์");
    } else {
      warn("Geo Database: ไม่พบชีต '" + postalName + "' (การแกะที่อยู่แบบ Offline อาจไม่แม่นยำ 100%)");
    }

    ui.alert("🕵️‍♂️ รายงานผลการสแกนชีต (Silent Exit Check):\n\n" + logs.join("\n"));
    console.info("[Diagnostic] Phase 2 (Sheets) completed.");

  } catch (e) {
    console.error("[Diagnostic Error]: " + e.message);
    ui.alert("🚨 เกิด Error ระหว่างตรวจสอบชีต:\n" + e.message);
  }
}


