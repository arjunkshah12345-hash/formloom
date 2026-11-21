/*! Formloom embed · MIT */
(function () {
  if (window.__formloomEmbed) return;
  window.__formloomEmbed = true;

  var css =
    ".fl-embed-overlay{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;background:rgba(10,10,10,.55);opacity:0;transition:opacity .2s}" +
    ".fl-embed-overlay.is-open{opacity:1}" +
    ".fl-embed-modal{position:relative;width:min(960px,92vw);height:min(680px,86vh);border-radius:14px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.35);transform:translateY(12px) scale(.98);transition:transform .25s cubic-bezier(.22,1,.36,1)}" +
    ".fl-embed-overlay.is-open .fl-embed-modal{transform:none}" +
    ".fl-embed-modal iframe{border:0;width:100%;height:100%;display:block}" +
    ".fl-embed-close{position:absolute;top:-44px;right:0;width:36px;height:36px;border:0;border-radius:99px;background:rgba(255,255,255,.95);cursor:pointer;font:20px/1 system-ui;color:#111}" +
    "@media (max-width:640px){.fl-embed-modal{width:100vw;height:100dvh;border-radius:0}.fl-embed-close{top:12px;right:12px;z-index:2}}";
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  function open(src) {
    var overlay = document.createElement("div");
    overlay.className = "fl-embed-overlay";
    overlay.innerHTML =
      '<div class="fl-embed-modal" role="dialog" aria-modal="true"><button class="fl-embed-close" aria-label="Close">×</button><iframe allow="clipboard-write"></iframe></div>';
    overlay.querySelector("iframe").src = src;
    function close() {
      overlay.classList.remove("is-open");
      document.removeEventListener("keydown", onKey);
      setTimeout(function () {
        overlay.remove();
        document.documentElement.style.overflow = "";
      }, 200);
    }
    function onKey(e) {
      if (e.key === "Escape") close();
    }
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
    overlay.querySelector(".fl-embed-close").addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    document.body.appendChild(overlay);
    requestAnimationFrame(function () {
      overlay.classList.add("is-open");
    });
  }

  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("[data-formloom-popup]");
    if (!el) return;
    e.preventDefault();
    open(el.getAttribute("data-formloom-popup"));
  });

  window.Formloom = { open: open };
})();
