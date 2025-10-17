// Chờ cho toàn bộ nội dung trang web được tải xong rồi mới chạy code
document.addEventListener("DOMContentLoaded", function () {
  // --- Cấu hình cho Language Switcher ---
  const switcherContainer = document.getElementById("language-switcher");
  if (switcherContainer) {
    const languages = [
      {
        code: "vn",
        flag: "https://flagcdn.com/w40/vn.png",
      },
      {
        code: "en",
        flag: "https://flagcdn.com/w40/gb.png",
      },
    ];
    let currentLanguageIndex = 0;

    function updateFlag() {
      const currentLang = languages[currentLanguageIndex];
      switcherContainer.innerHTML = `<img src="${currentLang.flag}" alt="${currentLang.code}" class="current-flag">`;
    }

    switcherContainer.addEventListener("click", function () {
      currentLanguageIndex = (currentLanguageIndex + 1) % languages.length;
      updateFlag();
    });

    updateFlag();
  }

  // --- Cấu hình cho Swiper Slider ---
  const swiper = new Swiper(".mySwiper", {
    loop: true, // Cho phép lặp lại vô tận
    autoplay: {
      delay: 2500, // Tự động trượt sau mỗi 2.5 giây
      disableOnInteraction: false, // Không dừng khi người dùng tương tác
    },
    effect: "fade", // Hiệu ứng chuyển slideแบบ mờ dần (fade)
    fadeEffect: {
      crossFade: true,
    },
  });
});
