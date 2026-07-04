/* ============================================================
   JAVASCRIPT: LOGIC BẢNG GIÁ DỊCH VỤ CHI TIẾT & TÌM KIẾM,
   ĐA NGÔN NGỮ, FAQ, FORM ĐẶT LỊCH...
   ============================================================ */


        // Đóng mở Mobile Menu xổ xuống chuẩn mượt mà
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
                const icon = mobileMenuBtn.querySelector('i');
                if (mobileMenu.classList.contains('hidden')) {
                    icon.className = 'fa-solid fa-bars text-lg';
                } else {
                    icon.className = 'fa-solid fa-xmark text-lg';
                }
            });

            // Tự động đóng menu di động sau khi nhấn chọn một liên kết
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.add('hidden');
                    mobileMenuBtn.querySelector('i').className = 'fa-solid fa-bars text-lg';
                });
            });
        }

        window.addEventListener('DOMContentLoaded', () => {
            // Tự động phát hiện và áp dụng ngôn ngữ mặc định của thiết bị khách hàng
            const detectedLang = autoDetectDeviceLanguage();
            setLanguage(detectedLang);
            
            // Khởi tạo bảng giá & trình so sánh kéo trước sau
            renderServices(SERVICES_DATABASE);
            initBeforeAfterSlider();
        });

        // TRÌNH KÉO KÉO KHÁM PHÁ SO SÁNH TRƯỚC VÀ SAU PHẪU THUẬT
        function initBeforeAfterSlider() {
            const baSlider = document.getElementById('ba-slider');
            const baBeforeWrapper = document.getElementById('ba-before-wrapper');
            const baBeforeImg = document.getElementById('ba-before-img');
            const baHandle = document.getElementById('ba-handle');

            if (baSlider && baBeforeWrapper && baBeforeImg && baHandle) {
                function resizeBeforeImg() {
                    const sliderWidth = baSlider.offsetWidth;
                    baBeforeImg.style.width = sliderWidth + 'px';
                }

                resizeBeforeImg();
                window.addEventListener('resize', resizeBeforeImg);

                let isDragging = false;

                function updateSlider(clientX) {
                    const rect = baSlider.getBoundingClientRect();
                    const posX = clientX - rect.left;
                    let percentage = (posX / rect.width) * 100;

                    if (percentage < 0) percentage = 0;
                    if (percentage > 100) percentage = 100;

                    baBeforeWrapper.style.width = percentage + '%';
                    baHandle.style.left = percentage + '%';
                }

                baSlider.addEventListener('mousedown', (e) => {
                    isDragging = true;
                    updateSlider(e.clientX);
                });

                window.addEventListener('mousemove', (e) => {
                    if (!isDragging) return;
                    updateSlider(e.clientX);
                });

                window.addEventListener('mouseup', () => {
                    isDragging = false;
                });

                baSlider.addEventListener('touchstart', (e) => {
                    isDragging = true;
                    if (e.touches.length > 0) {
                        updateSlider(e.touches[0].clientX);
                    }
                });

                window.addEventListener('touchmove', (e) => {
                    if (!isDragging) return;
                    if (e.touches.length > 0) {
                        updateSlider(e.touches[0].clientX);
                    }
                });

                window.addEventListener('touchend', () => {
                    isDragging = false;
                });
            }
        }

        function renderServices(data) {
            const tableBody = document.getElementById('services-table-body');
            tableBody.innerHTML = '';

            if (data.length === 0) {
                tableBody.innerHTML = `
                    <div class="p-8 text-center text-brand-gold text-xs">
                        <i class="fa-solid fa-triangle-exclamation text-brand-gold text-lg mb-2"></i><br>
                        No matching services found.
                    </div>
                `;
                return;
            }

            data.forEach((service, index) => {
                const row = document.createElement('div');
                row.className = 'grid grid-cols-12 gap-4 p-4 items-center hover:bg-brand-goldbright transition duration-150 text-xs sm:text-sm';
                
                // Nếu không phải tiếng Việt, hiển thị phiên bản tên dịch vụ tiếng Anh cho người nước ngoài dễ nhìn
                let serviceName = service.name;
                if (activeLang !== 'vi') {
                    // Tách lấy phần tiếng Anh đằng trước dấu gạch ngang
                    const parts = service.name.split(' - ');
                    if (parts.length > 0) {
                        serviceName = parts[0];
                    }
                }

                row.innerHTML = `
                    <div class="col-span-2 sm:col-span-1 text-center font-bold text-brand-gold">${index + 1}</div>
                    <div class="col-span-10 sm:col-span-8">
                        <div class="font-bold text-brand-goldtext">${serviceName}</div>
                        <div class="text-[10px] text-brand-gold font-bold mt-1 uppercase tracking-wider">
                            ${service.category === 'facial' ? (activeLang === 'vi' ? 'Phẫu Thuật Khuôn Mặt (Facial)' : 'Facial Surgery') : (activeLang === 'vi' ? 'Nâng Ngực & Tạo Hình Cơ Thể (Body)' : 'Body Contouring')}
                        </div>
                    </div>
                    <div class="col-span-12 sm:col-span-3 text-right font-black text-brand-goldtext text-sm sm:text-base border-t sm:border-t-0 border-brand-goldsand/20 pt-2 sm:pt-0">
                        <span class="text-brand-gold text-xs font-semibold mr-1">USD</span>$${service.price.toLocaleString()}
                    </div>
                `;
                tableBody.appendChild(row);
            });
        }

        function filterCategory(category) {
            currentCategory = category;
            
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('bg-brand-goldtext', 'text-white', 'shadow-sm', 'active');
                btn.classList.add('bg-white', 'text-brand-goldtext', 'border-brand-goldsand');
            });

            const activeBtn = document.getElementById(`btn-${category}`);
            if (activeBtn) {
                activeBtn.classList.remove('bg-white', 'text-brand-goldtext', 'border-brand-goldsand');
                activeBtn.classList.add('bg-brand-goldtext', 'text-white', 'shadow-sm', 'active');
            }

            applyFilterAndSearch();
        }

        function searchServices() {
            applyFilterAndSearch();
        }

        function applyFilterAndSearch() {
            const searchQuery = document.getElementById('search-input').value.toLowerCase().trim();
            let filtered = SERVICES_DATABASE;

            if (currentCategory !== 'all') {
                filtered = filtered.filter(item => item.category === currentCategory);
            }

            if (searchQuery !== '') {
                filtered = filtered.filter(item => item.name.toLowerCase().includes(searchQuery));
            }

            renderServices(filtered);
        }

        function toggleFaq(button) {
            const content = button.nextElementSibling;
            const icon = button.querySelector('i');
            
            if (content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                icon.classList.add('rotate-180');
            } else {
                content.classList.add('hidden');
                icon.classList.remove('rotate-180');
            }
        }

        // ⚠️ DÁN URL WEB APP CỦA GOOGLE APPS SCRIPT VÀO ĐÂY (sau khi Deploy > Web app)
        const APPOINTMENT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxv-56TWCijcDCT0QDKwkhm4CWawRrphGqn5cYoOIH0N0IYZ5iIfk5JeoKXcfzjE-mp/exec";

        function handleFormSubmit(event) {
            event.preventDefault();

            const name = document.getElementById('form-name').value;
            const phone = document.getElementById('form-phone').value;
            const service = document.getElementById('form-service').value;
            const date = document.getElementById('form-date').value;
            const message = document.getElementById('form-message').value;
            const messageBox = document.getElementById('submit-message');
            const submitBtn = event.target.querySelector('button[type="submit"]');

            // Dữ liệu gửi sang Google Apps Script (khớp với d.xxx trong doPost)
            const payload = {
                thoiGian: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
                name: name,
                phone: phone,
                service: service,
                date: date,
                message: message,
                lang: activeLang || 'vi',
            };

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.add('opacity-60', 'cursor-not-allowed');
            }

            // Gửi lên Apps Script. Dùng text/plain để tránh preflight CORS phức tạp
            // (Apps Script doPost đọc qua e.postData.contents nên Content-Type không quan trọng).
            // KHÔNG dùng no-cors ở đây để có thể đọc response thật và debug lỗi qua Console (F12).
            fetch(APPOINTMENT_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload),
            })
            .then((res) => res.json())
            .then((data) => {
                if (data.result !== 'success') {
                    console.error('Apps Script trả lỗi:', data);
                } else {
                    console.log('Đã gửi đăng ký tư vấn thành công:', data);
                }
            })
            .catch((err) => {
                // Nếu thấy lỗi "Failed to fetch" hoặc CORS ở đây, kiểm tra lại:
                // 1) URL có đúng dạng .../exec không (không phải /dev)
                // 2) Deploy "Who has access" phải là "Anyone"
                // 3) Phải tạo deployment MỚI (hoặc New version) sau khi sửa code .gs
                console.error('Gửi đăng ký tư vấn thất bại:', err);
            })
            .finally(() => {
                let successTitle = "Đăng ký thành công!";
                let successDesc = `Chào anh/chị ${name}, Dr. Tùng Dương đã nhận được yêu cầu của anh/chị. Trợ lý y khoa sẽ liên hệ ngay qua số điện thoại ${phone} trong vòng 15 phút.`;

                if (activeLang === 'en') {
                    successTitle = "Registration Successful!";
                    successDesc = `Dear ${name}, Dr. Tung Duong has received your inquiry. Our medical assistant will contact you at ${phone} within 15 minutes.`;
                } else if (activeLang === 'zh') {
                    successTitle = "预约登记成功！";
                    successDesc = `尊敬的 ${name}，杨松医生的团队已收到您的信息。我们将在15分钟内拨打 ${phone} 与您确认。`;
                } else if (activeLang === 'id') {
                    successTitle = "Pendaftaran Berhasil!";
                    successDesc = `Halo ${name}, Dr. Tung Duong telah menerima permintaan Anda. Asisten medis kami akan segera menghubungi Anda di ${phone} (WhatsApp) dalam waktu 15 menit.`;
                } else if (activeLang === 'th') {
                    successTitle = "ลงทะเบียนสำเร็จ!";
                    successDesc = `สวัสดีค่ะ คุณ ${name} Dr. Tung Duong ได้รับข้อมูลเรียบร้อยแล้วค่ะ เจ้าหน้าที่จะติดต่อกลับที่เบอร์ ${phone} (WhatsApp) ภายใน 15 นาทีค่ะ`;
                } else if (activeLang === 'ms') {
                    successTitle = "Pendaftaran Berjaya!";
                    successDesc = `Salam ${name}, Dr. Tung Duong telah menerima permohonan anda. Pembantu perubatan akan menghubungi anda di ${phone} (WhatsApp) dalam masa 15 minit.`;
                } else if (activeLang === 'ph') {
                    successTitle = "Matagumpay na Rehistrasyon!";
                    successDesc = `Kumusta ${name}, natanggap na ni Dr. Tung Duong ang inyong kahilingan. Tatawag ang aming medikal na katulong sa ${phone} (WhatsApp) sa loob ng 15 minuto.`;
                }

                messageBox.className = "p-4 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100 mb-4";
                messageBox.innerHTML = `
                    <div class="flex items-start gap-2.5">
                        <i class="fa-solid fa-circle-check text-base text-emerald-600 mt-0.5"></i>
                        <div>
                            <span class="block font-bold">${successTitle}</span>
                            <span class="block text-[11px] font-medium mt-0.5">${successDesc}</span>
                        </div>
                    </div>
                `;
                messageBox.classList.remove('hidden');

                document.getElementById('appointment-form').reset();

                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('opacity-60', 'cursor-not-allowed');
                }

                setTimeout(() => {
                    messageBox.classList.add('hidden');
                }, 8000);
            });
        }

