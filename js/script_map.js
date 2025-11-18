// --- PHẦN 1: KHỞI TẠO BẢN ĐỒ ---
const map = L.map("map", {
  center: [10.122241670031254, 105.909057],
  zoom: 22,
  minZoom: 15,
  maxZoom: 22,
  zoomControl: false,
});

L.control.zoom({ position: "bottomright" }).addTo(map);

L.tileLayer(
  "https://api.maptiler.com/tiles/019a39b4-4745-700c-b991-07dc74d49321/{z}/{x}/{y}.png?key=SUK1Kacu0nBmruoAMGBy",
  {
    maxZoom: 22,
    minZoom: 15,
    attribution: "Bản đồ © TamNhaFarm | MapTiler",
  }
).addTo(map);

let currentMarker = null;

// --- PHẦN 2: KHAI BÁO BIẾN ---
const GAS_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbzlkrzRh3RVZpc1QzL-7AuttcHzSWnyfV32iDeq3giwxlvXKRrlKwr4BJAPkTC-4Tbh0w/exec";

const html5QrCode = new Html5Qrcode("scanner-container");

// UI Chính
const searchBarContainer = document.getElementById("search-bar-container");
const searchInput = document.getElementById("search-input");
const btnSearch = document.getElementById("btn-search");
const btnStartScanMain = document.getElementById("btn-start-scan-main");
const scannerPanel = document.getElementById("scanner-panel");
const btnClosePanel = document.getElementById("btn-close-panel");

// Panel bên trong
const scannerSection = document.getElementById("scanner-section");
const resultSection = document.getElementById("result-section");
const btnScanAgain = document.getElementById("btn-scan-again");
// Đã xóa biến btnSave
const btnSelectLocation = document.getElementById("btn-select-location");
const btnSearchCoords = document.getElementById("btn-search-coords");
const btnRemovePin = document.getElementById("btn-remove-pin");
const loadingSpinner = document.getElementById("loading-spinner");
const errorMessage = document.getElementById("error-message");
// Đã xóa biến saveStatus
const resultContainer = document.getElementById("result-container");

// Form
const resultId = document.getElementById("result-id");
const resultMaCay = document.getElementById("result-ma-cay");
const resultTen = document.getElementById("result-ten");
const resultTenKhoaHoc = document.getElementById("result-ten-khoa-hoc");
const resultTinhTrang = document.getElementById("result-tinh-trang");
const resultLat = document.getElementById("result-lat");
const resultLong = document.getElementById("result-long");
const resultNgayTrong = document.getElementById("result-ngay-trong");

// --- PHẦN 3: HÀM ĐIỀU KHIỂN UI VÀ SCANNER ---

// 3.1 Hiển thị Panel để QUÉT
function showScanPanel() {
  btnStartScanMain.classList.add("hidden");
  searchBarContainer.classList.add("hidden");
  scannerPanel.classList.remove("hidden");

  scannerSection.classList.remove("hidden");
  resultSection.classList.add("hidden");

  removePin();
  startScanner();
}

// 3.2 Hiển thị Panel để XEM KẾT QUẢ
function showResultPanelOnly() {
  btnStartScanMain.classList.add("hidden");
  searchBarContainer.classList.add("hidden");
  scannerPanel.classList.remove("hidden");

  // Ẩn scanner, hiện kết quả
  scannerSection.classList.add("hidden");
  resultSection.classList.remove("hidden");

  // Reset trạng thái
  errorMessage.classList.add("hidden");
}

// 3.3 Đóng Panel hoàn toàn
function hideScanPanel() {
  scannerPanel.classList.add("hidden");
  btnStartScanMain.classList.remove("hidden");
  searchBarContainer.classList.remove("hidden");

  html5QrCode.stop().catch((err) => console.warn("Scanner stop error."));
}

function startScanner() {
  const config = { fps: 10, qrbox: { width: 250, height: 250 } };
  html5QrCode
    .start({ facingMode: "environment" }, config, onScanSuccess, onScanFailure)
    .catch((err) => {
      console.error("Không thể khởi động camera", err);
      showError("Không thể khởi động camera. Vui lòng cấp quyền.");
      scannerSection.classList.add("hidden");
    });
}

const onScanSuccess = (decodedText, decodedResult) => {
  console.log(`Scan result: ${decodedText}`);
  html5QrCode
    .stop()
    .catch((err) => console.warn("Error stopping scanner:", err));

  showResultPanelOnly();

  loadingSpinner.classList.remove("hidden");
  resultContainer.classList.add("hidden");
  resultId.innerText = decodedText;
  fetchPlantData(decodedText);
};

const onScanFailure = (error) => {
  /* console.warn(`Scan error: ${error}`); */
};

// --- PHẦN 4: HÀM XỬ LÝ DỮ LIỆU ---
async function fetchPlantData(plantId) {
  const url = `${GAS_WEB_APP_URL}?id=${encodeURIComponent(plantId)}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    loadingSpinner.classList.add("hidden");
    if (data.success) {
      const plant = data.plantData;
      resultMaCay.value = plant.maCay;
      resultTen.value = plant.tenThuongGoi;
      resultTenKhoaHoc.value = plant.tenKhoaHoc;
      resultTinhTrang.value = plant.tinhTrang;
      resultLat.value = plant.viTriLat;
      resultLong.value = plant.viTriLong;
      resultNgayTrong.value = plant.ngayTrong;

      resultContainer.classList.remove("hidden");

      if (plant.viTriLat && plant.viTriLong) {
        zoomToPlantLocation(plant.viTriLat, plant.viTriLong, plant.maCay);
      } else {
        alert("Cây này chưa có vị trí. Hãy chấm vào bản đồ để cập nhật.");
      }
    } else {
      resultContainer.classList.add("hidden");
      showError(`Không tìm thấy cây với Mã: ${plantId}`);
    }
  } catch (error) {
    console.error("Fetch Error:", error);
    loadingSpinner.classList.add("hidden");
    showError("Lỗi kết nối (GET). Vui lòng thử lại.");
  }
}

// ĐÃ XÓA HÀM savePlantData()
// ĐÃ XÓA HÀM showSaveError()

// --- PHẦN 5: HÀM HIỂN THỊ VÀ TÌM KIẾM ---
function zoomToPlantLocation(latStr, longStr, plantId) {
  removePin();
  try {
    const lat = parseFloat(latStr.slice(0, 2) + "." + latStr.slice(2));
    const long = parseFloat(longStr.slice(0, 3) + "." + longStr.slice(3));
    if (!isNaN(lat) && !isNaN(long)) {
      let popupContent = "Vị trí cây";
      if (plantId) {
        popupContent = `<b>${plantId}</b><br>Chạm để xem chi tiết`;
      }

      map.setView([lat, long], 22);

      currentMarker = L.marker([lat, long]).addTo(map);

      currentMarker.on("click", () => {
        if (plantId) {
          showResultPanelOnly();
          loadingSpinner.classList.remove("hidden");
          resultContainer.classList.add("hidden");
          resultId.innerText = plantId;
          fetchPlantData(plantId);
        } else {
          currentMarker
            .bindPopup("Vị trí này chưa có dữ liệu ID cây.")
            .openPopup();
        }
      });

      currentMarker.bindPopup(popupContent).openPopup();
    } else {
      console.error("Tọa độ không hợp lệ:", latStr, longStr);
    }
  } catch (e) {
    console.error("Lỗi xử lý tọa độ:", e);
  }
}

function selectLocationOnMap() {
  scannerPanel.classList.add("hidden");
  alert("Hãy chấm vào vị trí của cây trên bản đồ.");

  map.getContainer().style.cursor = "crosshair";

  map.once("click", (e) => {
    removePin();
    map.getContainer().style.cursor = "";

    const lat = e.latlng.lat;
    const long = e.latlng.lng;
    const latDb = lat.toString().replace(".", "").substring(0, 8);
    const longDb = long.toString().replace(".", "").substring(0, 9);

    scannerPanel.classList.remove("hidden");

    resultLat.value = latDb;
    resultLong.value = longDb;

    map.setView(e.latlng, 22);
    currentMarker = L.marker(e.latlng)
      .addTo(map)
      .bindPopup("Vị trí MỚI (Chưa lưu)")
      .openPopup();

    currentMarker.on("click", () => {
      scannerPanel.classList.remove("hidden");
    });
  });
}

function searchCoordsOnMap() {
  const latStr = resultLat.value;
  const longStr = resultLong.value;
  if (!latStr || !longStr) {
    alert("Vui lòng nhập cả Lat và Long để tìm.");
    return;
  }
  zoomToPlantLocation(latStr, longStr, resultMaCay.value);
}

function handleSearch(query) {
  if (!query) return;

  const parts = query.split(",");

  if (parts.length === 2) {
    let latStr = parts[0].trim();
    let longStr = parts[1].trim();

    if (latStr.includes(".")) {
      latStr = latStr.replace(".", "").substring(0, 8);
    }
    if (longStr.includes(".")) {
      longStr = longStr.replace(".", "").substring(0, 9);
    }

    resultLat.value = latStr;
    resultLong.value = longStr;

    zoomToPlantLocation(latStr, longStr, null);
    searchInput.value = "";
  } else {
    showResultPanelOnly();
    loadingSpinner.classList.remove("hidden");
    resultContainer.classList.add("hidden");

    resultId.innerText = query;
    fetchPlantData(query);
    searchInput.value = "";
  }
}

function removePin() {
  if (currentMarker) {
    currentMarker.remove();
    currentMarker = null;
  }
}

function showError(message) {
  errorMessage.innerText = message;
  errorMessage.classList.remove("hidden");
}

// --- PHẦN 6: GÁN SỰ KIỆN CHO CÁC NÚT ---
btnStartScanMain.addEventListener("click", showScanPanel);
btnClosePanel.addEventListener("click", hideScanPanel);

btnScanAgain.addEventListener("click", () => {
  resultSection.classList.add("hidden");
  scannerSection.classList.remove("hidden");
  removePin();
  startScanner();
});

// ĐÃ XÓA listener của btnSave
btnSelectLocation.addEventListener("click", selectLocationOnMap);
btnSearchCoords.addEventListener("click", searchCoordsOnMap);
btnRemovePin.addEventListener("click", removePin);

searchInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    handleSearch(e.target.value);
  }
});

btnSearch.addEventListener("click", () => {
  handleSearch(searchInput.value);
});
