
    (function(){
      // Kiểm tra xem thiết bị có phải di động hay không
      var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
     
      // 1. Chặn chuột phải (Trên máy tính chặn toàn diện, loại trừ biểu mẫu)
      document.addEventListener('contextmenu', function(e){ 
        var tagName = e.target.tagName.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
          return true;
        }
        e.preventDefault(); 
        return false; 
      });
     
      // 2. Chặn các tổ hợp phím tắt F12, Ctrl+U, Ctrl+Shift+I (Chỉ chạy trên Desktop)
      if (!isMobile) {
        document.addEventListener('keydown', function(e){
          if(
            e.key === 'F12' ||
            (e.ctrlKey && e.key === 'u') ||
            (e.ctrlKey && e.shiftKey && ['i','I','j','J','c','C','g','G'].includes(e.key)) ||
            (e.ctrlKey && ['i','I','j','J','c','C','g','G','f','F','d','D'].includes(e.key)) ||
            (e.metaKey && e.altKey && ['i','I','j','J','c','C','g','G'].includes(e.key))
          ){
            e.preventDefault();
            return false;
          }
        });
      }
     
      // 3. Chặn kéo chọn văn bản & sao chép (Bảo vệ thông tin nhưng không phá hủy trải nghiệm vuốt cảm ứng)
      document.addEventListener('selectstart', function(e){ 
        var tagName = e.target.tagName.toLowerCase();
        // Không chặn bôi đen trên Input, Textarea và không chặn kéo vuốt trên khu vực so sánh Before/After
        if (tagName === 'input' || tagName === 'textarea' || tagName === 'select' || e.target.closest('#ba-slider')) {
          return;
        }
        e.preventDefault(); 
      });
      
      document.addEventListener('copy', function(e){ 
        var tagName = e.target.tagName.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea') {
          return;
        }
        e.preventDefault(); 
      });
      
      document.addEventListener('dragstart', function(e){ 
        // Cho phép thao tác kéo ảnh trượt Before/After hoạt động bình thường
        if (e.target.closest('#ba-slider')) {
          return;
        }
        e.preventDefault(); 
      });
     

      if (!isMobile) {
        var devOpen = false;
        var threshold = 160;
        setInterval(function(){
          var widthDiff  = window.outerWidth  - window.innerWidth  > threshold;
          var heightDiff = window.outerHeight - window.innerHeight > threshold;
          if((widthDiff || heightDiff) && !devOpen){
            devOpen = true;
            document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;font-size:20px;color:#1E293B;background:#fff;flex-direction:column;gap:12px"><div style="font-size:48px">🔒</div><strong>Nội dung không thể truy cập</strong><span style="font-size:14px;color:#64748B">Vui lòng đóng DevTools để tiếp tục.</span></div>';
          }
          if(!widthDiff && !heightDiff && devOpen){
            devOpen = false;
            location.reload();
          }
        }, 1000);
      }
     
      // 5. Thêm CSS vô hiệu hóa bôi đen nhưng loại trừ hoàn toàn các thẻ form nhập liệu và thanh trượt Before/After
      var style = document.createElement('style');
      style.innerHTML = 'body, body * { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; } ' +
                        'input, textarea, select, #ba-slider, #ba-slider * { -webkit-user-select: text !important; -moz-user-select: text !important; -ms-user-select: text !important; user-select: text !important; }';
      document.head.appendChild(style);
    })();