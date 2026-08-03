document.addEventListener("DOMContentLoaded", () => {
    // Mobile navigation
    const menuButton = document.querySelector(".menu-button");
    const navigation = document.querySelector(".main-nav");

    if (menuButton && navigation) {
        menuButton.addEventListener("click", () => {
            const isOpen = navigation.classList.toggle("open");

            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        });

        navigation.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                navigation.classList.remove("open");
                menuButton.setAttribute("aria-expanded", "false");
            });
        });
    }

    // Scroll animations
    const revealElements = document.querySelectorAll(
        ".hero-content, .hero-card, .section-heading, " +
        ".two-column, .timeline-item, .standard-card, .contact-section"
    );

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );

        revealElements.forEach((element) => {
            element.classList.add("reveal");
            revealObserver.observe(element);
        });
    }

    // Shop search and category filters
    const searchInput = document.querySelector(".shop-search-input");
    const filterButtons = document.querySelectorAll(
        ".filter-button[data-filter]"
    );
    const products = document.querySelectorAll(".shop-product");

    let activeFilter = "all";

    function updateProducts() {
        const searchTerm = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        products.forEach((product) => {
            const category = product.dataset.category || "";
            const name = (product.dataset.name || "").toLowerCase();

            const matchesCategory =
                activeFilter === "all" ||
                category === activeFilter;

            const matchesSearch =
                searchTerm === "" ||
                name.includes(searchTerm);

            product.style.display =
                matchesCategory && matchesSearch ? "" : "none";
        });
    }

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            activeFilter = button.dataset.filter || "all";

            filterButtons.forEach((item) => {
                item.classList.remove("active");
            });

            button.classList.add("active");
            updateProducts();
        });
    });

    if (searchInput) {
        searchInput.addEventListener("input", updateProducts);
    }

    updateProducts();
});