
const KROSS_CONFIG = {
  phoneDisplay: "0900 000 000",
  phoneRaw: "0900000000",
  zaloUrl: "https://zalo.me/0900000000",
  gasWebhookUrl: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
};

function openDrawer(){
  const drawer = document.getElementById("drawer");
  if(!drawer) return;
  drawer.classList.add("is-open");
  document.body.classList.add("drawer-open");
}
function closeDrawer(){
  const drawer = document.getElementById("drawer");
  if(!drawer) return;
  drawer.classList.remove("is-open");
  document.body.classList.remove("drawer-open");
}
document.addEventListener("keydown", (e)=>{
  if(e.key === "Escape") closeDrawer();
});
document.addEventListener("click", (e)=>{
  const link = e.target.closest("[data-close-drawer]");
  if(link) closeDrawer();
});

async function submitLead(){
  const name = document.getElementById("f-name")?.value.trim() || "";
  const phone = document.getElementById("f-phone")?.value.trim() || "";
  const level = document.getElementById("f-level")?.value || "";
  const goal = document.getElementById("f-goal")?.value || "";
  const time = document.getElementById("f-time")?.value || "";
  const msg = document.getElementById("form-msg");
  if(!msg) return;

  if(!name || !phone){
    msg.style.color = "#FF9A8F";
    msg.textContent = "Vui lòng nhập họ tên và số điện thoại/Zalo.";
    return;
  }
  const cleanPhone = phone.replace(/\s/g,"");
  if(!/^0\d{8,10}$/.test(cleanPhone)){
    msg.style.color = "#FF9A8F";
    msg.textContent = "Số điện thoại chưa đúng định dạng. Vui lòng nhập số bắt đầu bằng 0.";
    return;
  }

  if(KROSS_CONFIG.gasWebhookUrl.includes("YOUR_DEPLOYMENT_ID")){
    msg.style.color = "#FFB86B";
    msg.textContent = "Form đang ở chế độ test. Hãy thay GAS Webhook URL trước khi nhận lead thật.";
    return;
  }

  msg.style.color = "#B8C2D9";
  msg.textContent = "Đang gửi thông tin…";

  try{
    await fetch(KROSS_CONFIG.gasWebhookUrl, {
      method:"POST",
      mode:"no-cors",
      headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify({
        source:"homepage_v2",
        name, phone:cleanPhone, level, goal, time,
        page:location.pathname,
        referrer:document.referrer,
        ts:new Date().toISOString()
      })
    });
    msg.style.color = "#7FD6B8";
    msg.textContent = "Đã nhận thông tin. KROSS sẽ liên hệ qua Zalo trong 24 giờ làm việc.";
    ["f-name","f-phone"].forEach(id=>{
      const el = document.getElementById(id);
      if(el) el.value = "";
    });
  }catch(err){
    msg.style.color = "#FF9A8F";
    msg.textContent = "Gửi chưa thành công. Vui lòng nhắn Zalo trực tiếp cho KROSS.";
  }
}


function getFitValue(id){
  return document.getElementById(id)?.value || "";
}

function calculateFit(){
  const education = getFitValue("fit-education");
  const gpa = getFitValue("fit-gpa");
  const attendance = getFitValue("fit-attendance");
  const korean = getFitValue("fit-korean");
  const budget = getFitValue("fit-budget");
  const time = getFitValue("fit-time");
  const result = document.getElementById("fit-result");
  if(!result) return;

  const points = {
    education: {thpt:7, college:8, university:10},
    gpa: {high:22, mid:17, low:10, risk:4},
    attendance: {clean:20, some:12, risk:4},
    korean: {none:2, beginner:8, topik12:15, topik3:24},
    budget: {strong:22, stable:16, tight:9, risk:3},
    time: {fast:8, year:10, later:6}
  };

  let score = 0;
  score += points.education[education] || 0;
  score += points.gpa[gpa] || 0;
  score += points.attendance[attendance] || 0;
  score += points.korean[korean] || 0;
  score += points.budget[budget] || 0;
  score += points.time[time] || 0;
  score = Math.min(100, score);

  const risks = [];
  if(korean === "none" || korean === "beginner") risks.push("Tiếng Hàn cần chuẩn bị thêm");
  if(gpa === "low" || gpa === "risk") risks.push("Học lực cần chọn trường kỹ");
  if(attendance === "some" || attendance === "risk") risks.push("Chuyên cần / khoảng trống cần giải trình");
  if(budget === "tight" || budget === "risk") risks.push("Ngân sách cần kiểm tra theo khu vực");
  if(time === "fast" && (korean === "none" || attendance === "risk")) risks.push("Thời gian đi khá gấp so với hồ sơ");
  if(risks.length === 0) risks.push("Hồ sơ tương đối sạch, cần đối chiếu điều kiện trường");

  let route = "";
  let desc = "";
  let goal = "Chưa rõ, cần tư vấn";
  if(korean === "topik3" && score >= 70 && attendance !== "risk"){
    route = "Phù hợp kiểm tra tuyến D-2 chuyên ngành";
    desc = "Bạn có nền tiếng Hàn tốt hơn mặt bằng chung. KROSS nên kiểm tra ngành, trường, học bổng và yêu cầu TOPIK/GPA từng kỳ trước khi chọn trường.";
    goal = "Đại học / thạc sĩ D-2";
  }else if(score < 55 || attendance === "risk" || budget === "risk"){
    route = "Nên học thêm và ổn định hồ sơ tại Việt Nam trước";
    desc = "Hồ sơ có điểm cần xử lý trước khi nộp. KROSS nên đánh giá lại chuyên cần, ngân sách, tiếng Hàn và thời điểm xuất cảnh để giảm rủi ro.";
    goal = "Chưa rõ, cần tư vấn";
  }else{
    route = "Phù hợp tuyến D-4 học tiếng trước";
    desc = "Đây là tuyến an toàn cho học sinh chưa đủ TOPIK hoặc cần xây nền tiếng Hàn tại Hàn Quốc trước khi chuyển lên D-2.";
    goal = "Du học tiếng D-4";
  }

  result.hidden = false;
  result.innerHTML = `
    <div class="fit-result-top">
      <div>
        <h3>${route}</h3>
        <p>${desc}</p>
      </div>
      <div class="fit-score"><div><span>${score}</span><small>/100</small></div></div>
    </div>
    <div class="risk-tags">${risks.map(r => `<span>${r}</span>`).join("")}</div>
    <div class="fit-actions">
      <button class="btn btn-primary" type="button" onclick="sendFitToLead('${goal.replace(/'/g,"\\'")}')">Gửi kết quả cho KROSS</button>
      <a class="btn btn-ghost" href="${KROSS_CONFIG.zaloUrl}">Nhắn Zalo ngay</a>
    </div>
    <div class="fit-disclaimer">Kết quả này chỉ dùng để định hướng ban đầu, không phải cam kết nhập học hoặc visa. KROSS sẽ cần kiểm tra hồ sơ thật và thông báo chính thức của trường từng kỳ.</div>
  `;
  result.scrollIntoView({behavior:"smooth", block:"nearest"});
}

function sendFitToLead(goal){
  const goalSelect = document.getElementById("f-goal");
  if(goalSelect){
    [...goalSelect.options].forEach((opt, idx)=>{
      if(opt.textContent.trim() === goal) goalSelect.selectedIndex = idx;
    });
  }
  const levelMap = {
    none:"Chưa học",
    beginner:"Đang học sơ cấp",
    topik12:"TOPIK 1–2",
    topik3:"TOPIK 3 trở lên"
  };
  const levelText = levelMap[getFitValue("fit-korean")];
  const levelSelect = document.getElementById("f-level");
  if(levelSelect && levelText){
    [...levelSelect.options].forEach((opt, idx)=>{
      if(opt.textContent.trim() === levelText) levelSelect.selectedIndex = idx;
    });
  }
  location.hash = "tu-van";
  setTimeout(()=>document.getElementById("f-name")?.focus(), 350);
}
