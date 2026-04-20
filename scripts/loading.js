<<<<<<< HEAD
setTimeout(() => {
    const loading = document.querySelector("#loading");
    if (loading) {
        loading.style.opacity = "0";
        loading.style.transition = "opacity 0.5s ease";
        setTimeout(() => {
            loading.style.display = "none";
        }, 0);
    }
=======
setTimeout(() => {
    const loading = document.querySelector("#loading");
    if (loading) {
        loading.style.opacity = "0";
        loading.style.transition = "opacity 0.5s ease";
        setTimeout(() => {
            loading.style.display = "none";
        }, 0);
    }
>>>>>>> d40c5947f92a2de6b084f79787927b289c2ba7b9
}, 1000);