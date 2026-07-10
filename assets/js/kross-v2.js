
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
