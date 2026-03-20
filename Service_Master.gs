/**
 * VERSION: 000
 * 🧠 Service: Master Data Management
 * Version: 4.1 Checkbox Bugfix
 * -----------------------------------------------------------
 * [FIXED v4.1]: Created getRealLastRow_() to ignore pre-filled checkboxes.
 * Data will now append exactly after the last actual customer name.
 * Author: Elite Logistics Architect
 */

// ==========================================
// 1. IMPORT & SYNC
// ==========================================

/**
 * 🛠️ [NEW v4.1] Helper หาแถวสุดท้ายจริงๆ โดยดูจากคอลัมน์ชื่อลูกค้า (ข้าม Checkbox)
 */
function getRealLastRow_(sheet, columnIndex) {
  var data = sheet.getRange(1, columnIndex, sheet.getMaxRows(), 1).getValues();
  for (var i = data.length - 1; i >= 0; i--) {
    // ถ้าช่องนั้นไม่ว่างเปล่า ไม่เป็น null และไม่เป็น boolean (Checkbox)
    if (data[i][0] !== "" && data[i][0] !== null && typeof data[i][0] !== 'boolean') {
      return i + 1;
    }
  }
  return 1; // ถ้าชีตว่างเปล่าเลย
}

function syncNewDataToMaster() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) { 
    ui.alert("⚠️ ระบบคิวทำงาน", "มีผู้ใช้งานอื่นกำลังอัปเดตฐานข้อมูลอยู่ กรุณาลองใหม่ในอีก 15 วินาทีครับ", ui.ButtonSet.OK);
    return;
  }

  try {
    var sourceSheet = ss.getSheetByName(CONFIG.SOURCE_SHEET);
    var masterSheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    
    if (!sourceSheet || !masterSheet) { 
      ui.alert("❌ CRITICAL: ไม่พบ Sheet (Source หรือ Database)"); 
      return; 
    }

    var SRC_IDX = { 
      NAME: 12,      // Col 13 (M)
      LAT: 14,       // Col 15 (O)
      LNG: 15,       // Col 16 (P)
      SYS_ADDR: 18,  // Col 19 (S)
      DIST: 23,      // Col 24 (X)
      GOOG_ADDR: 24  // Col 25 (Y)
    };

    // [FIXED v4.1] ใช้ getRealLastRow_ เพื่อหลบ Checkbox ที่ทำเผื่อไว้ล่วงหน้า
    var lastRowM = getRealLastRow_(masterSheet, CONFIG.COL_NAME);
    var existingNames = new Set(); 
    
    // Load Existing Names
    if (lastRowM > 1) {
      var mData = masterSheet.getRange(2, CONFIG.COL_NAME, lastRowM - 1, 1).getValues();
      mData.forEach(function(r) { 
        if (r[0]) existingNames.add(normalizeText(r[0])); 
      });
    }

    var lastRowS = sourceSheet.getLastRow();
    if (lastRowS < 2) {
      ui.alert("ℹ️ ไม่มีข้อมูลในชีตต้นทาง");
      return;
    }
    
    // Read Source Data
    var sData = sourceSheet.getRange(2, 1, lastRowS - 1, 25).getValues();
    var newEntries = [];
    var currentBatch = new Set(); 

    sData.forEach(function(row) {
      var name = row[SRC_IDX.NAME];
      var lat = row[SRC_IDX.LAT];
      var lng = row[SRC_IDX.LNG];
      
      if (!name || !lat || !lng) return;
      
      var clean = normalizeText(name);
      
      if (!existingNames.has(clean) && !currentBatch.has(clean)) {
        var newRow = new Array(17).fill(""); 
        
        newRow[CONFIG.C_IDX.NAME] = name;
        newRow[CONFIG.C_IDX.LAT] = lat;
        newRow[CONFIG.C_IDX.LNG] = lng;
        newRow[CONFIG.C_IDX.VERIFIED] = false; 
        newRow[CONFIG.C_IDX.SYS_ADDR] = row[SRC_IDX.SYS_ADDR]; 
        newRow[CONFIG.C_IDX.GOOGLE_ADDR] = row[SRC_IDX.GOOG_ADDR]; 
        newRow[CONFIG.C_IDX.DIST_KM] = cleanDistance_Helper(row[SRC_IDX.DIST]); 
        
        newRow[CONFIG.C_IDX.UUID] = generateUUID(); 
        newRow[CONFIG.C_IDX.CREATED] = new Date(); 
        newRow[CONFIG.C_IDX.UPDATED] = new Date();
        
        newEntries.push(newRow);
        currentBatch.add(clean);
      }
    });

    if (newEntries.length > 0) {
      // เขียนต่อท้ายบรรทัดจริงๆ ไม่ใช่บรรทัด Checkbox
      masterSheet.getRange(lastRowM + 1, 1, newEntries.length, 17).setValues(newEntries);
      console.log("Sync Complete: Added " + newEntries.length + " rows.");
      ui.alert("✅ นำเข้าข้อมูลใหม่สำเร็จ: " + newEntries.length + " รายการ\nต่อท้ายที่แถว " + (lastRowM + 1));
    } else {
      ui.alert("👌 ฐานข้อมูลเป็นปัจจุบันแล้ว (ไม่มีข้อมูลลูกค้าใหม่จากชีตต้นทาง)");
    }

  } catch (error) {
    console.error("Sync Error: " + error.message);
    ui.alert("❌ เกิดข้อผิดพลาด: " + error.message);
  } finally {
    lock.releaseLock(); 
  }
}

function cleanDistance_Helper(val) {
  if (!val) return "";
  if (typeof val === 'number') return val;
  return parseFloat(val.toString().replace(/,/g, '').replace('km', '').trim()) || "";
}

// ==========================================
// (ส่วนที่เหลือทั้งหมดดึงมาจาก V4.0 เหมือนเดิม เพื่อให้ครบไฟล์)
// ==========================================

function updateGeoData_SmartCache() { runDeepCleanBatch_100(); }
function autoGenerateMasterList_Smart() { processClustering_GridOptimized(); }

function runDeepCleanBatch_100() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) return;

  var lastRow = getRealLastRow_(sheet, CONFIG.COL_NAME);
  if (lastRow < 2) return;

  var props = PropertiesService.getScriptProperties();
  var startRow = parseInt(props.getProperty('DEEP_CLEAN_POINTER') || '2');
  
  if (startRow > lastRow) {
    ui.alert("🎉 ตรวจครบทุกแถวแล้ว (Pointer Reset)");
    props.deleteProperty('DEEP_CLEAN_POINTER');
    return;
  }

  var endRow = Math.min(startRow + CONFIG.DEEP_CLEAN_LIMIT - 1, lastRow);
  var numRows = endRow - startRow + 1;
  
  var range = sheet.getRange(startRow, 1, numRows, 17);
  var values = range.getValues();
  
  var origin = CONFIG.DEPOT_LAT + "," + CONFIG.DEPOT_LNG;
  var updatedCount = 0;

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var lat = row[CONFIG.C_IDX.LAT];
    var lng = row[CONFIG.C_IDX.LNG];
    var changed = false;

    if (lat && lng && !row[CONFIG.C_IDX.GOOGLE_ADDR]) {
      try {
        var addr = GET_ADDR_WITH_CACHE(lat, lng); 
        if (addr && addr !== "Error") {
          row[CONFIG.C_IDX.GOOGLE_ADDR] = addr;
          changed = true;
        }
      } catch (e) { console.warn("Geo Error: " + e.message); }
    }

    if (lat && lng && !row[CONFIG.C_IDX.DIST_KM]) {
      var km = CALCULATE_DISTANCE_KM(origin, lat + "," + lng); 
      if (km) { row[CONFIG.C_IDX.DIST_KM] = km; changed = true; }
    }
    
    if (!row[CONFIG.C_IDX.UUID]) { 
      row[CONFIG.C_IDX.UUID] = generateUUID(); 
      row[CONFIG.C_IDX.CREATED] = row[CONFIG.C_IDX.CREATED] || new Date(); 
      changed = true; 
    }

    var gAddr = row[CONFIG.C_IDX.GOOGLE_ADDR];
    if (gAddr && (!row[CONFIG.C_IDX.PROVINCE] || !row[CONFIG.C_IDX.DISTRICT])) {
       var parsed = parseAddressFromText(gAddr); 
       if (parsed && parsed.province) {
         row[CONFIG.C_IDX.PROVINCE] = parsed.province;
         row[CONFIG.C_IDX.DISTRICT] = parsed.district;
         row[CONFIG.C_IDX.POSTCODE] = parsed.postcode;
         changed = true;
       }
    }

    if (changed) {
       row[CONFIG.C_IDX.UPDATED] = new Date();
       updatedCount++;
    }
  }

  if (updatedCount > 0) range.setValues(values);
  props.setProperty('DEEP_CLEAN_POINTER', (endRow + 1).toString());
  ss.toast("✅ Processed rows " + startRow + "-" + endRow + " (Updated: " + updatedCount + ")", "Deep Clean");
}

function resetDeepCleanMemory() {
  PropertiesService.getScriptProperties().deleteProperty('DEEP_CLEAN_POINTER');
  SpreadsheetApp.getActiveSpreadsheet().toast("🔄 Memory Reset: ระบบถูกรีเซ็ต จะเริ่มตรวจสอบแถวที่ 2 ในรอบถัดไป", "System Ready");
}

function finalizeAndClean_MoveToMapping() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { 
    ui.alert("⚠️ ระบบคิวทำงาน", "มีผู้ใช้งานอื่นกำลังแก้ไขฐานข้อมูล กรุณารอสักครู่", ui.ButtonSet.OK);
    return;
  }

  try {
    var masterSheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    var mapSheet = ss.getSheetByName(CONFIG.MAPPING_SHEET);
    
    if (!masterSheet || !mapSheet) { ui.alert("❌ Error: Missing Sheets"); return; }
    
    var lastRow = getRealLastRow_(masterSheet, CONFIG.COL_NAME);
    if (lastRow < 2) { ui.alert("ℹ️ Database is empty."); return; }

    var allData = masterSheet.getRange(2, 1, lastRow - 1, 17).getValues();
    var uuidMap = {};
    
    allData.forEach(function(row) {
      var uuid = row[CONFIG.C_IDX.UUID];
      if (uuid) {
        var n = normalizeText(row[CONFIG.C_IDX.NAME]);
        var s = normalizeText(row[CONFIG.C_IDX.SUGGESTED]);
        if (n) uuidMap[n] = uuid;
        if (s) uuidMap[s] = uuid;
      }
    });

    var backupName = "Backup_DB_" + Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd_HHmm");
    masterSheet.copyTo(ss).setName(backupName);

    var rowsToKeep = [];       
    var mappingToUpload = []; 
    var processedNames = new Set(); 

    for (var i = 0; i < allData.length; i++) {
      var row = allData[i];
      var rawName = row[CONFIG.C_IDX.NAME];
      var suggestedName = row[CONFIG.C_IDX.SUGGESTED];
      var isVerified = row[CONFIG.C_IDX.VERIFIED];    
      var currentUUID = row[CONFIG.C_IDX.UUID];

      if (isVerified === true) {
        rowsToKeep.push(row); 
      } 
      else if (suggestedName && suggestedName !== "") {
        if (rawName !== suggestedName && !processedNames.has(rawName)) {
          var targetUUID = uuidMap[normalizeText(suggestedName)] || currentUUID;
          var mapRow = new Array(5).fill("");
          mapRow[CONFIG.MAP_IDX.VARIANT] = rawName;
          mapRow[CONFIG.MAP_IDX.UID] = targetUUID;
          mapRow[CONFIG.MAP_IDX.CONFIDENCE] = 100;
          mapRow[CONFIG.MAP_IDX.MAPPED_BY] = "Human";
          mapRow[CONFIG.MAP_IDX.TIMESTAMP] = new Date();
          
          mappingToUpload.push(mapRow);
          processedNames.add(rawName);
        }
      }
    }

    if (mappingToUpload.length > 0) {
      var lastRowMap = mapSheet.getLastRow();
      mapSheet.getRange(lastRowMap + 1, 1, mappingToUpload.length, 5).setValues(mappingToUpload);
    }

    masterSheet.getRange(2, 1, lastRow, 17).clearContent();
    
    if (rowsToKeep.length > 0) {
      masterSheet.getRange(2, 1, rowsToKeep.length, 17).setValues(rowsToKeep);
      ui.alert("✅ Finalize Complete:\n- New Mappings: " + mappingToUpload.length + "\n- Active Master Data: " + rowsToKeep.length);
    } else {
      masterSheet.getRange(2, 1, allData.length, 17).setValues(allData);
      ui.alert("⚠️ Warning: No Verified rows found. Data restored to original state.");
    }
  } catch (e) {
    console.error("Finalize Error: " + e.message);
    ui.alert("❌ CRITICAL WRITE ERROR: " + e.message + "\nPlease check Backup Sheet.");
  } finally {
    lock.releaseLock();
  }
}

function assignMissingUUIDs() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  var lastRow = getRealLastRow_(sheet, CONFIG.COL_NAME);
  if (lastRow < 2) return;

  var range = sheet.getRange(2, CONFIG.COL_UUID, lastRow - 1, 1);
  var values = range.getValues();
  var count = 0;

  var newValues = values.map(function(r) {
    if (!r[0]) {
      count++;
      return [generateUUID()];
    }
    return [r[0]];
  });

  if (count > 0) {
    range.setValues(newValues);
    ui.alert("✅ Generated " + count + " new UUIDs.");
  } else {
    ui.alert("ℹ️ All rows already have UUIDs.");
  }
}

function repairNameMapping_Full() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  var dbSheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  var mapSheet = ss.getSheetByName(CONFIG.MAPPING_SHEET);
  
  var dbData = dbSheet.getRange(2, 1, getRealLastRow_(dbSheet, CONFIG.COL_NAME) - 1, CONFIG.COL_UUID).getValues();
  var uuidMap = {};
  dbData.forEach(function(r) {
    if (r[CONFIG.C_IDX.UUID]) {
       uuidMap[normalizeText(r[CONFIG.C_IDX.NAME])] = r[CONFIG.C_IDX.UUID];
    }
  });

  var mapRange = mapSheet.getRange(2, 1, mapSheet.getLastRow() - 1, 5);
  var mapValues = mapRange.getValues();
  var cleanList = [];
  var seen = new Set();

  mapValues.forEach(function(r) {
    var oldN = r[CONFIG.MAP_IDX.VARIANT];
    var uid = r[CONFIG.MAP_IDX.UID];
    var conf = r[CONFIG.MAP_IDX.CONFIDENCE] || 100; 
    var by = r[CONFIG.MAP_IDX.MAPPED_BY] || "System_Repair";
    var ts = r[CONFIG.MAP_IDX.TIMESTAMP] || new Date();
    
    var normOld = normalizeText(oldN);
    if (!normOld) return;
    
    if (!uid) uid = uuidMap[normalizeText(r[1])] || generateUUID();
    
    if (!seen.has(normOld)) {
      seen.add(normOld);
      var mapRow = new Array(5).fill("");
      mapRow[CONFIG.MAP_IDX.VARIANT] = oldN;
      mapRow[CONFIG.MAP_IDX.UID] = uid;
      mapRow[CONFIG.MAP_IDX.CONFIDENCE] = conf;
      mapRow[CONFIG.MAP_IDX.MAPPED_BY] = by;
      mapRow[CONFIG.MAP_IDX.TIMESTAMP] = ts;
      cleanList.push(mapRow);
    }
  });

  if (cleanList.length > 0) {
    mapSheet.getRange(2, 1, mapSheet.getLastRow(), 5).clearContent();
    mapSheet.getRange(2, 1, cleanList.length, 5).setValues(cleanList);
    ui.alert("✅ Repair Complete. Total Mappings: " + cleanList.length);
  } else {
    ui.alert("ℹ️ No repair needed or mapping is empty.");
  }
}

function processClustering_GridOptimized() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  var lastRow = getRealLastRow_(sheet, CONFIG.COL_NAME);
  if (lastRow < 2) return;

  var range = sheet.getRange(2, 1, lastRow - 1, 15); 
  var values = range.getValues();
  
  var clusters = [];      
  var grid = {};          

  for (var i = 0; i < values.length; i++) {
    var r = values[i];
    var lat = r[CONFIG.C_IDX.LAT];
    var lng = r[CONFIG.C_IDX.LNG];
    
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) continue;

    var gridKey = Math.floor(lat * 10) + "_" + Math.floor(lng * 10);
    
    if (!grid[gridKey]) grid[gridKey] = [];
    grid[gridKey].push(i);

    if (r[CONFIG.C_IDX.VERIFIED] === true) {
      clusters.push({
        lat: lat,
        lng: lng,
        name: r[CONFIG.C_IDX.SUGGESTED] || r[CONFIG.C_IDX.NAME],
        rowIndexes: [i],
        hasLock: true,
        gridKey: gridKey
      });
    }
  }

  for (var i = 0; i < values.length; i++) {
    if (values[i][CONFIG.C_IDX.VERIFIED] === true) continue; 

    var lat = values[i][CONFIG.C_IDX.LAT];
    var lng = values[i][CONFIG.C_IDX.LNG];
    if (!lat || !lng) continue;

    var myGridKey = Math.floor(lat * 10) + "_" + Math.floor(lng * 10);
    var found = false;

    for (var c = 0; c < clusters.length; c++) {
      if (clusters[c].gridKey === myGridKey) { 
        var dist = getHaversineDistanceKM(lat, lng, clusters[c].lat, clusters[c].lng);
        if (dist <= CONFIG.DISTANCE_THRESHOLD_KM) {
          clusters[c].rowIndexes.push(i);
          found = true;
          break;
        }
      }
    }

    if (!found) {
      clusters.push({
        lat: lat,
        lng: lng,
        rowIndexes: [i],
        hasLock: false,
        name: null,
        gridKey: myGridKey
      });
    }
  }

  var updateCount = 0;
  clusters.forEach(function(g) {
    var candidateNames = [];
    g.rowIndexes.forEach(function(idx) { 
        var rawName = values[idx][CONFIG.C_IDX.NAME];
        var existingSuggested = values[idx][CONFIG.C_IDX.SUGGESTED];
        candidateNames.push(rawName); 
        if (existingSuggested && existingSuggested !== rawName) {
            candidateNames.push(existingSuggested, existingSuggested, existingSuggested);
        }
    });

    var winner = g.hasLock ? g.name : getBestName_Smart(candidateNames);
    var confidence = g.rowIndexes.length; 

    g.rowIndexes.forEach(function(idx) {
      if (values[idx][CONFIG.C_IDX.VERIFIED] !== true) {
         var currentSuggested = values[idx][CONFIG.C_IDX.SUGGESTED];
         var currentConfidence = values[idx][CONFIG.C_IDX.CONFIDENCE];
         
         if (currentSuggested !== winner || currentConfidence !== confidence) {
             values[idx][CONFIG.C_IDX.SUGGESTED] = winner;
             values[idx][CONFIG.C_IDX.CONFIDENCE] = confidence;
             values[idx][CONFIG.C_IDX.NORMALIZED] = normalizeText(winner);
             updateCount++;
         }
      }
    });
  });

  if (updateCount > 0) {
    range.setValues(values);
    ss.toast("✅ จัดกลุ่มสำเร็จ! พร้อมอัปเกรดชื่อที่ฉลาดขึ้น (Updated: " + updateCount + " rows)", "Clustering V4.1");
  } else {
    ss.toast("ℹ️ ข้อมูลจัดกลุ่มเรียบร้อยดีอยู่แล้ว ไม่มีการเปลี่ยนแปลง", "Clustering V4.1");
  }
}