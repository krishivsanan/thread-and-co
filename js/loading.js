/* =========================
   THREAD & CO. LOADING SCREEN
   ========================= */

(() => {
    const loader = document.getElementById("site-loader");

    if (!loader) return;

    const startTime = performance.now();
    const minimumDisplayTime = 2000;

    function hideLoader() {
        const elapsed = performance.now() - startTime;

        const delay = Math.max(
            0,
            minimumDisplayTime - elapsed
        );

        setTimeout(() => {

            loader.classList.add("is-hidden");

            setTimeout(() => {
                loader.remove();
            }, 450);

        }, delay);
    }

    if (document.readyState === "complete") {
        hideLoader();
    } else {
        window.addEventListener("load", hideLoader, {
            once: true
        });
    }
})();