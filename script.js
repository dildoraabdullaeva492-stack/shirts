const cart = JSON.parse(localStorage.getItem("ax_cart") || "[]");
let users = JSON.parse(localStorage.getItem("ax_users") || "[]");
const renderCart = () => {
  localStorage.setItem("ax_cart", JSON.stringify(cart));
  document
    .querySelectorAll(".cart-count")
    .forEach((el) => (el.textContent = cart.length));
  const box = document.getElementById("cartItems");
  if (box)
    box.innerHTML =
      cart
        .map(
          (i, k) =>
            `<div class="cart-row"><span><b>${i.title}</b> (${i.size})</span><span>${i.price} <button data-rm="${k}" class="demo-btn">✕</button></span></div>`
        )
        .join("") || "<p>Savatcha bo‘sh.</p>";
};
const renderProfile = () => {
  const u = JSON.parse(localStorage.getItem("ax_active_user") || "null"),
    box = document.getElementById("profileBox");
  if (box)
    box.innerHTML = u
      ? `<h4>${u.name} · ${u.tier || "AX VIP"}</h4><p>Email: ${
          u.email
        } · Tel: ${
          u.phone || "+998 90 123 45 67"
        }</p><button id="logoutBtn" class="btn-accent" style="margin-top:10px;padding:7px 14px">Profildan chiqish</button>`
      : `<h4>Mehmon profil</h4><p>JSON hisobingizga kiring yoki yangi hisob oching.</p>`;
};
window.addEventListener("DOMContentLoaded", async () => {
  setTimeout(
    () => document.getElementById("preloader")?.classList.add("done"),
    2150
  );
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in-view");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.08 }
  );
  document.querySelectorAll(".reveal-item").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 65}ms`;
    io.observe(el);
  });
  if (!users.length) {
    users = await fetch("/users.json")
      .then((r) => r.json())
      .catch(() => []);
    localStorage.setItem("ax_users", JSON.stringify(users));
  }
  renderCart();
  renderProfile();
});
document.addEventListener("click", (e) => {
  const t = e.target;
  if (t.matches(".zoom-img")) {
    document.getElementById("lightboxImg").src = t.src;
    document.getElementById("lightboxCap").textContent = t.alt;
    document.getElementById("lightbox")?.classList.add("open");
  }
  if (t.matches("#closeLightbox, #lightbox"))
    document.getElementById("lightbox")?.classList.remove("open");
  if (t.matches(".hero-switch-btn")) {
    document
      .querySelectorAll(".hero-switch-btn")
      .forEach((b) => b.classList.remove("active"));
    t.classList.add("active");
    document.getElementById("heroMainImg").src = t.dataset.img;
  }
  if (t.matches(".filter-btn")) {
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    t.classList.add("active");
    document
      .querySelectorAll(".product-card")
      .forEach((c) =>
        c.classList.toggle(
          "hidden-card",
          t.dataset.filter !== "all" && c.dataset.cat !== t.dataset.filter
        )
      );
  }
  if (t.matches(".size-btn")) {
    t.parentElement
      .querySelectorAll(".size-btn")
      .forEach((b) => b.classList.remove("active"));
    t.classList.add("active");
  }
  if (t.matches(".add-btn")) {
    const c = t.closest(".product-card");
    cart.push({
      title: c.dataset.title,
      price: c.dataset.price,
      size: c.querySelector(".size-btn.active")?.textContent || "L",
    });
    renderCart();
    document.getElementById("cartDrawer")?.classList.add("open");
  }
  if (t.dataset.rm !== undefined) {
    cart.splice(Number(t.dataset.rm), 1);
    renderCart();
  }
  if (t.matches(".open-cart"))
    document.getElementById("cartDrawer")?.classList.add("open");
  if (t.matches("#closeCart"))
    document.getElementById("cartDrawer")?.classList.remove("open");
  if (t.matches("#checkoutBtn") && cart.length) {
    cart.length = 0;
    renderCart();
    t.textContent = "Buyurtma rasmiylashtirildi!";
  }
  if (t.matches(".tab-btn")) {
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    t.classList.add("active");
    document
      .getElementById("signupFields")
      ?.classList.toggle("hidden-card", t.dataset.mode === "login");
    document.getElementById("authForm").dataset.mode = t.dataset.mode;
  }
  if (t.matches(".demo-btn[data-email]")) {
    const u = users.find((x) => x.email === t.dataset.email);
    if (u) {
      localStorage.setItem("ax_active_user", JSON.stringify(u));
      renderProfile();
    }
  }
  if (t.matches("#logoutBtn")) {
    localStorage.removeItem("ax_active_user");
    renderProfile();
  }
});
document.addEventListener("submit", (e) => {
  e.preventDefault();
  if (e.target.id === "authForm") {
    const fd = new FormData(e.target),
      mode = e.target.dataset.mode,
      msg = document.getElementById("authMsg");
    const found = users.find(
      (u) => u.email === fd.get("email") && u.password === fd.get("password")
    );
    if (mode === "signup") {
      const nu = {
        name: fd.get("name"),
        email: fd.get("email"),
        password: fd.get("password"),
        phone: fd.get("phone"),
        tier: "AX CLUB",
      };
      users.push(nu);
      localStorage.setItem("ax_users", JSON.stringify(users));
      localStorage.setItem("ax_active_user", JSON.stringify(nu));
      msg.textContent = `JSON hisob ochildi: ${nu.name}`;
    } else if (found) {
      localStorage.setItem("ax_active_user", JSON.stringify(found));
      msg.textContent = `Xush kelibsiz, ${found.name}!`;
    } else msg.textContent = "Email yoki parol xato!";
    msg.classList.add("show");
    renderProfile();
  }
  if (e.target.id === "contactForm") {
    document.getElementById("contactMsg")?.classList.add("show");
    e.target.reset();
  }
});
