const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".main-nav");

if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
        navigation.classList.toggle("open");

        const expanded =
            menuButton.getAttribute("aria-expanded") === "true";

        menuButton.setAttribute("aria-expanded", String(!expanded));
    });

    document.querySelectorAll(".main-nav a").forEach((link) => {
        link.addEventListener("click", () => {
            navigation.classList.remove("open");
            menuButton.setAttribute("aria-expanded", "false");
        });
    });
}

const revealElements = document.querySelectorAll(
    ".hero-content, .hero-card, .section-heading, .two-column, .timeline-item, .standard-card, .contact-section"
);

revealElements.forEach((element) => {
    element.classList.add("reveal");
});

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.12
    }
);

revealElements.forEach((element) => {
    revealObserver.observe(element);
});
const searchInput = document.querySelector(".shop-search-input");
const filterButtons = document.querySelectorAll(".filter-button");
const products = document.querySelectorAll(".shop-product");

let activeFilter = "all";

function updateProducts() {
    const searchTerm =
        searchInput?.value.trim().toLowerCase() ?? "";

    products.forEach((product) => {
        const category = product.dataset.category ?? "";
        const name = product.dataset.name?.toLowerCase() ?? "";

        const matchesCategory =
            activeFilter === "all" || category === activeFilter;

        const matchesSearch =
            searchTerm === "" || name.includes(searchTerm);

        product.hidden = !(matchesCategory && matchesSearch);
    });
}

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;

        filterButtons.forEach((item) => {
            item.classList.remove("active");
        });

        button.classList.add("active");
        updateProducts();
    });
});

searchInput?.addEventListener("input", updateProducts);