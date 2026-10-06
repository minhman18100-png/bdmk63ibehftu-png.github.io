/* =====================================================================
  UNIVERSE PORTFOLIO INTERACTIVE LOGIC - BÙI ĐỨC MINH
  Cosmic Canvas, Interactive Planets, Web Audio Synth, Incoterms Simulator
  ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ===================================================================
  // 1. COSMIC CANVAS: STARFIELD, METEORS & CONSTELLATION INTERACTION
  // ===================================================================
  const canvas = document.getElementById('cosmic-canvas');
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initStars();
  });

  // Star Particles
  const STAR_COUNT = Math.min(Math.floor((width * height) / 3800), 220);
  const stars = [];
  const mouse = { x: null, y: null, radius: 120 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  function initStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.4,
        baseAlpha: Math.random() * 0.7 + 0.3,
        alpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
        color: getRandomStarColor(),
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15
      });
    }
  }

  function getRandomStarColor() {
    const colors = [
      'rgba(255, 255, 255,',      // Pure white
      'rgba(0, 242, 254,',        // Cyan starlight
      'rgba(168, 85, 247,',       // Nebula violet
      'rgba(251, 191, 36,'        // Golden amber
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Shooting Stars / Meteors
  const meteors = [];
  function spawnMeteor() {
    meteors.push({
      x: Math.random() * width * 1.2,
      y: Math.random() * height * 0.4,
      length: Math.random() * 120 + 80,
      speed: Math.random() * 8 + 12,
      angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1),
      alpha: 1,
      decay: Math.random() * 0.02 + 0.015,
      thickness: Math.random() * 2 + 1
    });
    // Next meteor in 3 to 7 seconds
    setTimeout(spawnMeteor, Math.random() * 4000 + 3000);
  }
  setTimeout(spawnMeteor, 1500);

  function animateCosmicSpace() {
    ctx.clearRect(0, 0, width, height);

    // Draw and update stars
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];

      // Twinkle
      star.alpha += star.twinkleSpeed * star.twinkleDir;
      if (star.alpha >= 1) {
        star.alpha = 1;
        star.twinkleDir = -1;
      } else if (star.alpha <= star.baseAlpha * 0.4) {
        star.twinkleDir = 1;
      }

      // Slow galactic drift
      star.x += star.vx;
      star.y += star.vy;
      if (star.x < 0) star.x = width;
      if (star.x > width) star.x = 0;
      if (star.y < 0) star.y = height;
      if (star.y > height) star.y = 0;

      // Draw star
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `${star.color} ${star.alpha})`;
      ctx.shadowBlur = star.size > 1.4 ? 8 : 0;
      ctx.shadowColor = '#00f2fe';
      ctx.fill();

      // Constellation link to mouse
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - star.x;
        const dy = mouse.y - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(mouse.x, mouse.y);
          const linkAlpha = (1 - dist / mouse.radius) * 0.35;
          ctx.strokeStyle = `rgba(0, 242, 254, ${linkAlpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    // Draw and update meteors
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x -= Math.cos(m.angle) * m.speed;
      m.y += Math.sin(m.angle) * m.speed;
      m.alpha -= m.decay;

      if (m.alpha <= 0) {
        meteors.splice(i, 1);
        continue;
      }

      const tailX = m.x + Math.cos(m.angle) * m.length;
      const tailY = m.y - Math.sin(m.angle) * m.length;

      const gradient = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${m.alpha})`);
      gradient.addColorStop(0.3, `rgba(0, 242, 254, ${m.alpha * 0.7})`);
      gradient.addColorStop(1, 'rgba(157, 78, 221, 0)');

      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = m.thickness;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f2fe';
      ctx.stroke();
    }

    requestAnimationFrame(animateCosmicSpace);
  }

  initStars();
  animateCosmicSpace();

  // ===================================================================
  // 2. PARALLAX EFFECT FOR BACKGROUND PLANETS & INTERACTION
  // ===================================================================
  const celestialBodies = document.querySelectorAll('.celestial-body');

  window.addEventListener('mousemove', (e) => {
    const mouseXNorm = (e.clientX / window.innerWidth) - 0.5;
    const mouseYNorm = (e.clientY / window.innerHeight) - 0.5;

    celestialBodies.forEach(body => {
      const speed = parseFloat(body.getAttribute('data-scroll-speed')) || 0.05;
      const moveX = mouseXNorm * 40 * speed * 10;
      const moveY = mouseYNorm * 40 * speed * 10;
      body.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  });

  // Clicking on background planets scrolls to key milestones
  const planetSaturn = document.querySelector('.planet-saturn');
  if (planetSaturn) {
    planetSaturn.addEventListener('click', () => {
      document.getElementById('education').scrollIntoView({ behavior: 'smooth' });
      playBeepTone(440);
    });
  }

  const planetTerra = document.querySelector('.planet-terra');
  if (planetTerra) {
    planetTerra.addEventListener('click', () => {
      document.getElementById('simulator').scrollIntoView({ behavior: 'smooth' });
      playBeepTone(520);
    });
  }

  const planetMars = document.querySelector('.planet-mars');
  if (planetMars) {
    planetMars.addEventListener('click', () => {
      document.getElementById('experience').scrollIntoView({ behavior: 'smooth' });
      playBeepTone(660);
    });
  }

  const planetNeptune = document.querySelector('.planet-neptune');
  if (planetNeptune) {
    planetNeptune.addEventListener('click', () => {
      document.getElementById('skills').scrollIntoView({ behavior: 'smooth' });
      playBeepTone(580);
    });
  }

  // ===================================================================
  // 3. HERO SECTION: DYNAMIC TYPING EFFECT
  // ===================================================================
  const typingElement = document.getElementById('typing-text');
  const roles = [
    "Thực Tập Sinh Logistics & Xuất Nhập Khẩu",
    "Kinh Tế Đối Ngoại CLC — ĐH Ngoại Thương",
    "IELTS 7.5 // Incoterms 2020 // MOS Master",
    "Lead Ban Đối Ngoại Cuộc Thi INTERCHAIN 2025",
    "Founding Leader — CLB Trạng Chuyên"
  ];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingDelay = 80;

  function typeRole() {
    const currentRole = roles[roleIndex];
    if (isDeleting) {
      typingElement.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingDelay = 40;
    } else {
      typingElement.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingDelay = 90;
    }

    if (!isDeleting && charIndex === currentRole.length) {
      isDeleting = true;
      typingDelay = 2200; // Pause at end of text
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingDelay = 500;
    }

    setTimeout(typeRole, typingDelay);
  }
  setTimeout(typeRole, 600);

  // ===================================================================
  // 4. INCOTERMS 2020 INTERACTIVE LOGISTICS SIMULATOR
  // ===================================================================
  const termData = {
    EXW: {
      title: "EXW — Ex Works (Giao tại xưởng / cơ sở người bán)",
      mode: "Áp dụng: Mọi phương thức vận tải (Đường bộ, biển, hàng không, đa phương thức)",
      seller: "Người bán chỉ có trách nhiệm chuẩn bị hàng hóa sẵn sàng tại kho/xưởng của mình, cung cấp hóa đơn thương mại và hỗ trợ lấy chứng từ xuất khẩu nếu có yêu cầu.",
      buyer: "Người mua chịu toàn bộ chi phí và rủi ro từ lúc nhận hàng tại xưởng người bán: bốc xếp lên xe, vận chuyển nội địa, làm thủ tục hải quan xuất khẩu, cước tàu chính và thông quan nhập khẩu.",
      risk: "Rủi ro chuyển giao ngay tại kho/xưởng của Người Bán khi hàng được đặt dưới quyền định đoạt của người mua.",
      shipPosition: "10%",
      stages: {
        factory: { party: "Người Bán", class: "party-seller" },
        originPort: { party: "Người Mua", class: "party-buyer" },
        customsExport: { party: "Người Mua", class: "party-buyer" },
        seaTransit: { party: "Người Mua", class: "party-buyer" },
        destPort: { party: "Người Mua", class: "party-buyer" },
        warehouse: { party: "Người Mua", class: "party-buyer" }
      }
    },
    FOB: {
      title: "FOB — Free On Board (Giao lên tàu cảng bốc quy định)",
      mode: "Áp dụng: Vận tải đường biển & đường thủy nội địa",
      seller: "Chịu mọi chi phí vận chuyển nội địa, đóng gói, làm thủ tục thông quan xuất khẩu và chi phí bốc hàng lên tàu tại cảng bốc hàng chỉ định (Port of Loading).",
      buyer: "Ký hợp đồng vận chuyển đường biển quốc tế (chịu cước biển Ocean Freight), mua bảo hiểm hàng hải và chịu mọi rủi ro mất mát từ thời điểm hàng đã đặt an toàn trên boong tàu.",
      risk: "Rủi ro chuyển giao khi hàng hóa đã được xếp an toàn lên con tàu do người mua chỉ định tại cảng xuất khẩu.",
      shipPosition: "45%",
      stages: {
        factory: { party: "Người Bán", class: "party-seller" },
        originPort: { party: "Người Bán", class: "party-seller" },
        customsExport: { party: "Người Bán", class: "party-seller" },
        seaTransit: { party: "Người Mua", class: "party-buyer" },
        destPort: { party: "Người Mua", class: "party-buyer" },
        warehouse: { party: "Người Mua", class: "party-buyer" }
      }
    },
    CIF: {
      title: "CIF — Cost, Insurance and Freight (Tiền hàng, Bảo hiểm & Cước phí)",
      mode: "Áp dụng: Vận tải đường biển & đường thủy nội địa",
      seller: "Chịu chi phí thông quan xuất khẩu, tiền cước biển (Freight) vận chuyển hàng đến cảng đến chỉ định, và bắt buộc phải mua bảo hiểm hàng hải (tối thiểu loại C) cho lô hàng để bảo vệ cho người mua.",
      buyer: "Người mua chịu rủi ro mất mát kể từ khi hàng đã lên tàu ở cảng xuất. Người mua làm thủ tục thông quan nhập khẩu và chịu chi phí dỡ hàng / vận chuyển nội địa về kho đích.",
      risk: "Lưu ý quan trọng: Điểm chuyển giao chi phí là Cảng đến, nhưng điểm chuyển giao rủi ro vẫn là Cảng xuất (khi hàng lên tàu)!",
      shipPosition: "68%",
      stages: {
        factory: { party: "Người Bán", class: "party-seller" },
        originPort: { party: "Người Bán", class: "party-seller" },
        customsExport: { party: "Người Bán", class: "party-seller" },
        seaTransit: { party: "Người Bán", class: "party-seller" },
        destPort: { party: "Người Mua", class: "party-buyer" },
        warehouse: { party: "Người Mua", class: "party-buyer" }
      }
    },
    DDP: {
      title: "DDP — Delivered Duty Paid (Giao hàng đã nộp thuế tại đích)",
      mode: "Áp dụng: Mọi phương thức vận tải — Nghĩa vụ người bán tối đa",
      seller: "Người bán chịu trách nhiệm cao nhất: lo toàn bộ quá trình vận chuyển, thông quan xuất khẩu, cước quốc tế, nộp thuế nhập khẩu và giao hàng đến tận kho người mua.",
      buyer: "Người mua chỉ việc nhận hàng hóa tại kho của mình và hỗ trợ người bán dỡ hàng (nếu có thỏa thuận). Không phải chịu bất kỳ thủ tục hải quan nào.",
      risk: "Rủi ro chuyển giao tại kho của Người Mua khi hàng đã sẵn sàng dỡ khỏi phương tiện vận tải.",
      shipPosition: "92%",
      stages: {
        factory: { party: "Người Bán", class: "party-seller" },
        originPort: { party: "Người Bán", class: "party-seller" },
        customsExport: { party: "Người Bán", class: "party-seller" },
        seaTransit: { party: "Người Bán", class: "party-seller" },
        destPort: { party: "Người Bán", class: "party-seller" },
        warehouse: { party: "Người Bán", class: "party-seller" }
      }
    }
  };

  const termButtons = document.querySelectorAll('.term-btn');
  const infoTermCode = document.getElementById('info-term-code');
  const sellerDuty = document.getElementById('seller-duty');
  const buyerDuty = document.getElementById('buyer-duty');
  const riskPoint = document.getElementById('risk-point');
  const cargoShip = document.getElementById('cargo-ship');

  const tags = {
    factory: document.getElementById('tag-factory'),
    originPort: document.getElementById('tag-origin-port'),
    customsExport: document.getElementById('tag-customs-export'),
    seaTransit: document.getElementById('tag-sea-transit'),
    destPort: document.getElementById('tag-dest-port'),
    warehouse: document.getElementById('tag-warehouse')
  };

  function updateIncoterm(termKey) {
    const data = termData[termKey];
    if (!data) return;

    // Update active button
    termButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-term') === termKey);
    });

    // Update info text
    infoTermCode.textContent = data.title;
    sellerDuty.textContent = data.seller;
    buyerDuty.textContent = data.buyer;
    riskPoint.textContent = data.risk;

    // Update tags
    Object.keys(tags).forEach(key => {
      const stageInfo = data.stages[key];
      if (tags[key] && stageInfo) {
        tags[key].textContent = stageInfo.party;
        tags[key].className = `step-party-tag ${stageInfo.class}`;
      }
    });

    // Animate cargo ship
    if (cargoShip) {
      cargoShip.style.transform = `scale(1.05)`;
      setTimeout(() => {
        cargoShip.style.transform = `scale(1)`;
      }, 300);
    }

    playBeepTone(550);
  }

  termButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const term = btn.getAttribute('data-term');
      updateIncoterm(term);
    });
  });

  // Initialize with FOB
  updateIncoterm('FOB');

  // ===================================================================
  // 5. WEB AUDIO API SYNTHESIZER (SPACE DRONE & SFX - HOÀN TOÀN TỰ ĐỘNG)
  // ===================================================================
  let audioCtx = null;
  let isPlayingAudio = false;
  let masterGain = null;
  let droneNodes = [];
  let stellarArpTimer = null;

  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioIcon = document.getElementById('audio-icon');
  const audioLabel = document.getElementById('audio-label');

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();

      // Master Gain: Âm lượng rõ ràng (~0.35), không quá to, không quá nhỏ
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.35, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }
    return audioCtx;
  }

  // Âm thanh báo hiệu tức thì khi bật nút (Cosmic Chime Chord)
  function playCosmicActivationChime() {
    try {
      const ctx = getAudioContext();
      const chordFrequencies = [523.25, 659.25, 783.99, 1046.50]; // Hợp âm C Major êm dịu
      chordFrequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);

        noteGain.gain.setValueAtTime(0, ctx.currentTime + index * 0.08);
        noteGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + index * 0.08 + 0.03);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + index * 0.08 + 1.2);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(ctx.currentTime + index * 0.08);
        osc.stop(ctx.currentTime + index * 0.08 + 1.3);
      });
    } catch (e) {
      console.warn("Lỗi phát chime:", e);
    }
  }

  // Chuỗi nốt nhạc lấp lánh như các vì sao (Stellar Bells)
  function playStellarBell() {
    if (!isPlayingAudio) return;
    try {
      const ctx = getAudioContext();
      const scale = [587.33, 659.25, 880.0, 987.77, 1174.66, 1318.51];
      const freq = scale[Math.floor(Math.random() * scale.length)];

      const bellOsc = ctx.createOscillator();
      const bellGain = ctx.createGain();
      const bellFilter = ctx.createBiquadFilter();

      bellOsc.type = 'triangle';
      bellOsc.frequency.setValueAtTime(freq, ctx.currentTime);

      bellFilter.type = 'lowpass';
      bellFilter.frequency.setValueAtTime(1600, ctx.currentTime);

      bellGain.gain.setValueAtTime(0, ctx.currentTime);
      bellGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.04);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.4);

      bellOsc.connect(bellFilter);
      bellFilter.connect(bellGain);
      bellGain.connect(masterGain);

      bellOsc.start(ctx.currentTime);
      bellOsc.stop(ctx.currentTime + 2.5);
    } catch (e) { }
  }

  async function startCosmicDrone() {
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      stopCosmicDrone();

      // Phát tiếng ping báo hiệu bật ngay lập tức
      playCosmicActivationChime();

      // Dải tần số không gian sâu (Hans Zimmer / Interstellar Ambient Pad)
      // D minor 9th: D3 (146.83Hz), A3 (220.0Hz), F4 (349.23Hz), C5 (523.25Hz)
      const droneFreqs = [146.83, 220.0, 349.23, 523.25];

      droneFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Bộ lọc trầm ấm
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320 + idx * 70, ctx.currentTime);
        filter.Q.setValueAtTime(2, ctx.currentTime);

        // LFO tạo hiệu ứng sóng không gian thở nhẹ nhàng
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.12 + idx * 0.04, ctx.currentTime);
        lfoGain.gain.setValueAtTime(0.05, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(oscGain.gain);
        lfo.start();

        // Âm lượng êm dịu, ấm áp
        oscGain.gain.setValueAtTime(0.14, ctx.currentTime);

        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start();
        droneNodes.push({ osc, lfo });
      });

      // Lặp lại tiếng chuông sao lấp lánh mỗi 2.8 giây
      stellarArpTimer = setInterval(playStellarBell, 2800);

      isPlayingAudio = true;
      audioToggleBtn.classList.add('playing');
      audioIcon.className = 'fa-solid fa-volume-high';
      audioLabel.textContent = 'Âm Thanh Vũ Trụ: ĐANG BẬT';
      showToast('🎵 Đã bật âm thanh vũ trụ! (Hãy kiểm tra loa hoặc tai nghe của bạn)');

    } catch (err) {
      console.error("Không thể khởi động Web Audio:", err);
      showToast('⚠️ Không thể bật âm thanh. Hãy kiểm tra cài đặt loa trình duyệt!');
    }
  }

  function stopCosmicDrone() {
    if (droneNodes.length > 0) {
      droneNodes.forEach(item => {
        try {
          item.osc.stop();
          item.lfo.stop();
        } catch (e) { }
      });
      droneNodes = [];
    }

    if (stellarArpTimer) {
      clearInterval(stellarArpTimer);
      stellarArpTimer = null;
    }

    isPlayingAudio = false;
    audioToggleBtn.classList.remove('playing');
    audioIcon.className = 'fa-solid fa-volume-xmark';
    audioLabel.textContent = 'Âm Thanh Vũ Trụ: TẮT';
  }

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (isPlayingAudio) {
        stopCosmicDrone();
      } else {
        await startCosmicDrone();
      }
    });
  }

  function playBeepTone(freq = 600, duration = 0.08) {
    if (!isPlayingAudio) return;
    try {
      const ctx = getAudioContext();
      const beepOsc = ctx.createOscillator();
      const beepGain = ctx.createGain();
      beepOsc.type = 'sine';
      beepOsc.frequency.setValueAtTime(freq, ctx.currentTime);
      beepGain.gain.setValueAtTime(0.18, ctx.currentTime);
      beepGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      beepOsc.connect(beepGain);
      beepGain.connect(masterGain);
      beepOsc.start();
      beepOsc.stop(ctx.currentTime + duration);
    } catch (e) { }
  }

  // ===================================================================
  // 6. COPY TO CLIPBOARD & TOAST SYSTEM
  // ===================================================================
  const toast = document.getElementById('cosmic-toast');
  const toastText = document.getElementById('toast-text');
  let toastTimer = null;

  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  const copyButtons = document.querySelectorAll('.btn-copy-coord');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Đã sao chép: ${textToCopy}`);
          playBeepTone(880);
        });
      } else {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast(`Đã sao chép: ${textToCopy}`);
        playBeepTone(880);
      }
    });
  });

  // ===================================================================
  // 7. CONTACT FORM SUBMISSION (REAL TRANSMISSION + GMAIL INTEGRATION)
  // ===================================================================
  const contactForm = document.getElementById('cosmic-contact-form');
  const transmissionStatus = document.getElementById('transmission-status');
  const btnSubmit = document.getElementById('btn-submit-transmission');
  const inboxList = document.getElementById('inbox-list');
  const inboxCount = document.getElementById('inbox-count');

  function renderInbox(messages) {
    if (!inboxList || !inboxCount) return;
    inboxCount.textContent = `${messages.length} tín hiệu`;
    if (!messages || messages.length === 0) {
      inboxList.innerHTML = `<div class="inbox-empty">Chưa có tín hiệu nào được lưu. Hãy thử gửi tin nhắn đầu tiên ở trên!</div>`;
      return;
    }

    inboxList.innerHTML = messages.map(msg => `
        <div class="inbox-item">
          <div class="inbox-item-head">
            <span class="inbox-item-name"><i class="fa-solid fa-satellite"></i> ${escapeHtml(msg.name || 'Vô danh')}</span>
            <span class="inbox-item-time">${escapeHtml(msg.received_at || 'Vừa xong')}</span>
          </div>
          <div class="inbox-item-msg">${escapeHtml(msg.message || '')}</div>
          <div class="inbox-item-meta"><i class="fa-solid fa-envelope"></i> ${escapeHtml(msg.email || '')} • Chủ đề: ${escapeHtml(msg.subject || 'Liên hệ')}</div>
        </div>
      `).join('');
  }

  function fetchMessages() {
    fetch('/api/messages')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) renderInbox(data);
      })
      .catch(() => { });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Load existing messages on page load
  fetchMessages();

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const senderName = document.getElementById('sender-name').value.trim();
      const senderEmail = document.getElementById('sender-email').value.trim();
      const senderSubjectEl = document.getElementById('sender-subject');
      const senderSubject = senderSubjectEl.options[senderSubjectEl.selectedIndex].text;
      const senderMessage = document.getElementById('sender-message').value.trim();

      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `<span><i class="fa-solid fa-spinner fa-spin"></i> Đang Phát Tín Hiệu...</span>`;
      playBeepTone(750);

      // Create payload
      const payload = {
        name: senderName,
        email: senderEmail,
        subject: senderSubject,
        message: senderMessage
      };

      // Prepare Gmail direct link
      const emailSubject = encodeURIComponent(`[Portfolio FTU] ${senderSubject} - Từ ${senderName}`);
      const emailBody = encodeURIComponent(`Xin chào Bùi Đức Minh,\n\nTôi là: ${senderName}\nEmail liên hệ: ${senderEmail}\n\nNội dung tin nhắn:\n${senderMessage}\n\n---\n(Tin nhắn gửi từ Portfolio Vũ Trụ)`);
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=minhman18100@gmail.com&su=${emailSubject}&body=${emailBody}`;

      try {
        // Send real POST to local server
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<span><i class="fa-solid fa-satellite-dish"></i> Phát Tín Hiệu Tin Nhắn</span><div class="btn-warp-aura"></div>`;
        transmissionStatus.className = 'transmission-status success';
        transmissionStatus.innerHTML = `
            <div style="margin-bottom: 10px;">
              <i class="fa-solid fa-circle-check" style="font-size: 20px; color: #34d399;"></i><br/>
              <strong>Tín hiệu đã được máy chủ ghi nhận và lưu trữ thành công!</strong><br />
              Cảm ơn bạn <strong>${escapeHtml(senderName)}</strong> (${escapeHtml(senderEmail)}).
            </div>
            <a href="${gmailUrl}" target="_blank" class="btn-cosmic-glow" style="display: inline-flex; font-size: 12px; padding: 7px 14px; margin-top: 6px;">
              <i class="fa-brands fa-google"></i> Mở Gmail gửi trực tiếp vào hòm thư minhman18100@gmail.com
            </a>
          `;

        showToast(`🛰️ Tín hiệu từ ${senderName} đã được lưu thành công!`);
        playBeepTone(920);

        // Fetch updated messages to update live list
        fetchMessages();
        contactForm.reset();

      } catch (err) {
        // Even if local server had issue, fallback to Gmail link
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<span><i class="fa-solid fa-satellite-dish"></i> Phát Tín Hiệu Tin Nhắn</span><div class="btn-warp-aura"></div>`;
        transmissionStatus.className = 'transmission-status success';
        transmissionStatus.innerHTML = `
            <strong>Đã tạo sẵn thư!</strong> Bấm vào nút bên dưới để gửi thẳng vào Gmail của Bùi Đức Minh:<br />
            <a href="${gmailUrl}" target="_blank" class="btn-cosmic-glow" style="display: inline-flex; font-size: 12px; padding: 7px 14px; margin-top: 8px;">
              <i class="fa-brands fa-google"></i> Bấm Để Gửi Qua Gmail Tới minhman18100@gmail.com
            </a>
          `;
      }
    });
  }

  // ===================================================================
  // 8. NAVIGATION SCROLLSPY & MOBILE MENU
  // ===================================================================
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
      }
    });
  });

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      const sectionHeight = section.clientHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

});
