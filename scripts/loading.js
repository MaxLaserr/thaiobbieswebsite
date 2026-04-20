setTimeout(() => {
    const loading = document.querySelector("#loading");
    if (loading) {
        loading.style.opacity = "0";
        loading.style.transition = "opacity 0.5s ease";
        setTimeout(() => {
            loading.style.display = "none";
        }, 0);
    }
}, 1000);