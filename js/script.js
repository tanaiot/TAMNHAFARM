document.addEventListener("DOMContentLoaded", function () {
  // --- Code cho Popup ảnh ---
  const popup = document.getElementById("image-popup");
  const popupImage = document.getElementById("popup-content");
  const closeBtn = document.getElementById("popup-close");
  const certCards = document.querySelectorAll(".cert-card");

  certCards.forEach((card) => {
    card.addEventListener("click", function () {
      const imgSrc = this.getAttribute("data-img-src");
      if (imgSrc) {
        popupImage.src = imgSrc;
        popup.style.display = "flex";
      }
    });
  });

  function closePopup() {
    popup.style.display = "none";
  }
  closeBtn.addEventListener("click", closePopup);
  popup.addEventListener("click", function (event) {
    if (event.target === popup) {
      closePopup();
    }
  });

  // --- Code cho Form liên hệ (Google Sheets) ---
  const form = document.getElementById("contact-form");
  const statusDiv = document.getElementById("form-status");

  const scriptURL =
    "https://script.google.com/macros/s/AKfycbzWKFUP-wTFzyPtMfI9uSmr0RsqW0gZDgPGtWdO0k6vq4QNGjMovbeNB0SWccEJB_8/exec";

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      statusDiv.textContent = "Đang gửi...";
      statusDiv.style.color = "#333";

      fetch(scriptURL, { method: "POST", body: new FormData(form) })
        .then((response) => {
          console.log("Success!", response);
          statusDiv.textContent =
            "Gửi thông tin thành công! Chúng tôi sẽ liên hệ với bạn sớm.";
          statusDiv.style.color = "green";
          form.reset();
        })
        .catch((error) => {
          console.error("Error!", error.message);
          statusDiv.textContent = "Đã có lỗi xảy ra. Vui lòng thử lại.";
          statusDiv.style.color = "red";
        });
    });
  }

  // --- Code cho menu di động ---
  const menuToggle = document.getElementById("mobile-menu-toggle");
  const navLinks = document.getElementById("nav-links-menu");

  if (menuToggle && navLinks) {
    // Khi nhấn vào nút hamburger
    menuToggle.addEventListener("click", () => {
      // Thêm hoặc xóa class 'show' để hiện hoặc ẩn menu
      navLinks.classList.toggle("show");
    });

    // Tự động đóng menu khi nhấn vào một link (hữu ích cho trang đơn)
    navLinks.addEventListener("click", (event) => {
      if (event.target.tagName === "A") {
        navLinks.classList.remove("show");
      }
    });
  }

  // --- Code cho nút trượt (Slider) ---
  // Tìm tất cả các .slider-wrapper trên trang
  document.querySelectorAll(".slider-wrapper").forEach(function (wrapper) {
    // Tìm các phần tử con bên trong mỗi wrapper
    const grid = wrapper.querySelector(".scroll-grid");
    const prevBtn = wrapper.querySelector(".scroll-btn.prev");
    const nextBtn = wrapper.querySelector(".scroll-btn.next");

    // Chỉ chạy code nếu các phần tử tồn tại
    if (grid && prevBtn && nextBtn) {
      // (MỚI) Biến để kiểm soát việc tự động cuộn
      let autoScrollInterval = null;

      // Hàm tính toán khoảng cách cuộn
      function getScrollAmount() {
        const card = grid.querySelector("div"); // Lấy thẻ con đầu tiên (bất kể là class gì)
        if (!card) return 300; // Giá trị dự phòng

        const gridStyle = window.getComputedStyle(grid);
        const cardGap = parseFloat(gridStyle.gap) || 24;

        // Cuộn đúng bằng chiều rộng 1 thẻ + 1 khoảng cách
        return card.offsetWidth + cardGap;
      }

      // (MỚI) Hàm để dừng tự động cuộn
      const stopAutoScroll = () => {
        if (autoScrollInterval) {
          clearInterval(autoScrollInterval);
          autoScrollInterval = null;
        }
      };

      // (MỚI) Hàm để bắt đầu tự động cuộn
      const startAutoScroll = () => {
        // Chỉ tự động cuộn trên màn hình điện thoại
        if (window.innerWidth >= 768) {
          stopAutoScroll(); // Đảm bảo dừng nếu đang chạy
          return;
        }

        // Dừng cái cũ nếu có
        stopAutoScroll();

        autoScrollInterval = setInterval(() => {
          const scrollAmount = getScrollAmount();
          const maxScrollLeft = grid.scrollWidth - grid.clientWidth;

          // Nếu đã cuộn đến cuối (hoặc gần cuối)
          if (grid.scrollLeft >= maxScrollLeft - 10) {
            // Quay lại đầu
            grid.scrollTo({ left: 0, behavior: "smooth" });
          } else {
            // Cuộn tiếp
            grid.scrollBy({ left: scrollAmount, behavior: "smooth" });
          }
        }, 3000); // 3000ms = 3 giây
      };

      // Gán sự kiện cho nút Next
      nextBtn.addEventListener("click", () => {
        stopAutoScroll(); // (MỚI) Dừng tự động cuộn khi nhấn nút
        grid.scrollBy({ left: getScrollAmount(), behavior: "smooth" });
      });

      // Gán sự kiện cho nút Prev
      prevBtn.addEventListener("click", () => {
        stopAutoScroll(); // (MỚI) Dừng tự động cuộn khi nhấn nút
        grid.scrollBy({ left: -getScrollAmount(), behavior: "smooth" });
      });

      // (MỚI) Dừng tự động cuộn khi người dùng chạm vào
      grid.addEventListener("touchstart", stopAutoScroll, { passive: true });

      // Hàm để ẩn/hiện nút khi cuộn đến đầu hoặc cuối
      function updateButtonState() {
        // Chỉ kiểm tra nếu các nút đang được hiển thị (trên mobile)
        if (
          window.getComputedStyle(prevBtn).display !== "none" ||
          window.getComputedStyle(nextBtn).display !== "none"
        ) {
          const scrollLeft = grid.scrollLeft;
          const maxScrollLeft = grid.scrollWidth - grid.clientWidth;

          prevBtn.classList.toggle("hidden", scrollLeft <= 5);
          nextBtn.classList.toggle("hidden", scrollLeft >= maxScrollLeft - 5);
        }
      }

      grid.addEventListener("scroll", updateButtonState);
      // Chạy hàm này khi tải trang (sau 1 chút để layout ổn định)
      setTimeout(updateButtonState, 100);

      // Chạy hàm này khi xoay màn hình/thay đổi kích thước
      window.addEventListener("resize", () => {
        updateButtonState();
        startAutoScroll(); // (MỚI) Khởi động lại logic tự động cuộn
      });

      // (MỚI) Bắt đầu tự động cuộn khi tải trang
      startAutoScroll();
    }
  });
});
