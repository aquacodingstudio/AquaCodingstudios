document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // CONSTANTS
    // =========================

    const CART_KEY = "aquacodingCart";
    const WISHLIST_KEY = "aquacodingWishlist";


    // =========================
    // MOBILE NAVIGATION
    // =========================

    const menuButton = document.querySelector(".menu-button");
    const navigation = document.querySelector(".main-nav");

    if (menuButton && navigation) {

        menuButton.addEventListener("click", () => {

            const isOpen =
                navigation.classList.toggle("open");

            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

        });

        navigation
            .querySelectorAll("a")
            .forEach((link) => {

                link.addEventListener("click", () => {

                    navigation.classList.remove("open");

                    menuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                });

            });

    }


    // =========================
    // SCROLL ANIMATIONS
    // =========================

    const revealElements =
        document.querySelectorAll(
            ".hero-content, .hero-card, .section-heading, " +
            ".two-column, .timeline-item, .standard-card, " +
            ".contact-section, .featured-card, .guide-card, " +
            ".trust-card, .info-card"
        );

    if ("IntersectionObserver" in window) {

        const revealObserver =
            new IntersectionObserver(
                (entries, observer) => {

                    entries.forEach((entry) => {

                        if (entry.isIntersecting) {

                            entry.target.classList.add("visible");

                            observer.unobserve(entry.target);

                        }

                    });

                },
                {
                    threshold: 0.12
                }
            );

        revealElements.forEach((element) => {

            element.classList.add("reveal");

            revealObserver.observe(element);

        });

    }


    // =========================
    // SHOP SEARCH + FILTERS
    // =========================

    const searchInput =
        document.querySelector(".shop-search-input");

    const filterButtons =
        document.querySelectorAll(
            ".filter-button[data-filter]"
        );

    const products =
        document.querySelectorAll(".shop-product");

    let activeFilter = "all";


    function updateProducts() {

        const searchTerm =
            searchInput
                ? searchInput.value.trim().toLowerCase()
                : "";

        products.forEach((product) => {

            const category =
                product.dataset.category || "";

            const name =
                (product.dataset.name || "")
                    .toLowerCase();

            const matchesCategory =
                activeFilter === "all" ||
                category === activeFilter;

            const matchesSearch =
                searchTerm === "" ||
                name.includes(searchTerm);

            product.style.display =
                matchesCategory && matchesSearch
                    ? ""
                    : "none";

        });

    }


    filterButtons.forEach((button) => {

        button.addEventListener("click", () => {

            activeFilter =
                button.dataset.filter || "all";

            filterButtons.forEach((item) => {

                item.classList.remove("active");

            });

            button.classList.add("active");

            updateProducts();

        });

    });


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            updateProducts
        );

    }

    updateProducts();


    // =========================
    // CART
    // =========================

    function getCart() {

        try {

            const saved =
                localStorage.getItem(CART_KEY);

            return saved
                ? JSON.parse(saved)
                : [];

        } catch (error) {

            console.error(
                "Could not load cart:",
                error
            );

            return [];

        }

    }


    function saveCart(cart) {

        localStorage.setItem(
            CART_KEY,
            JSON.stringify(cart)
        );

        updateCartCount();

    }


    function addToCart(product) {

        const cart = getCart();

        const existingProduct =
            cart.find(
                (item) =>
                    item.id === product.id
            );

        if (existingProduct) {

            existingProduct.quantity +=
                Number(product.quantity || 1);

        } else {

            cart.push({
                ...product,
                quantity:
                    Number(product.quantity || 1)
            });

        }

        saveCart(cart);

    }


    function removeFromCart(productId) {

        const cart =
            getCart().filter(
                (item) =>
                    item.id !== productId
            );

        saveCart(cart);

    }


    function updateCartQuantity(
        productId,
        quantity
    ) {

        const cart = getCart();

        const item =
            cart.find(
                (product) =>
                    product.id === productId
            );

        if (!item) {
            return;
        }

        if (quantity <= 0) {

            removeFromCart(productId);

            return;

        }

        item.quantity = quantity;

        saveCart(cart);

    }


    function updateCartCount() {

        const cart = getCart();

        const totalItems =
            cart.reduce(
                (total, item) =>
                    total +
                    Number(item.quantity || 0),
                0
            );

        document
            .querySelectorAll(".cart-count")
            .forEach((counter) => {

                counter.textContent =
                    totalItems;

                counter.hidden =
                    totalItems === 0;

            });

    }


    // =========================
    // ADD TO CART BUTTONS
    // =========================

    document
        .querySelectorAll("[data-add-to-cart]")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    if (button.disabled) {
                        return;
                    }

                    const productId =
                        button.dataset.productId;

                    const productName =
                        button.dataset.productName;

                    const productPrice =
                        Number(
                            button.dataset.productPrice
                        );

                    const productImage =
                        button.dataset.productImage || "";

                    const productUrl =
                        button.dataset.productUrl || "";

                    const quantityTarget =
                        button.dataset.quantityTarget;

                    const quantityInput =
                        quantityTarget
                            ? document.querySelector(
                                quantityTarget
                            )
                            : null;

                    const quantity =
                        quantityInput
                            ? Math.max(
                                1,
                                Number(
                                    quantityInput.value
                                ) || 1
                            )
                            : 1;

                    if (
                        !productId ||
                        !productName ||
                        Number.isNaN(productPrice)
                    ) {

                        console.error(
                            "Missing product information."
                        );

                        return;

                    }

                    addToCart({

                        id: productId,

                        name: productName,

                        price: productPrice,

                        image: productImage,

                        url: productUrl,

                        quantity: quantity

                    });

                    const originalText =
                        button.textContent;

                    button.textContent =
                        "Added to Cart ✓";

                    setTimeout(() => {

                        button.textContent =
                            originalText;

                    }, 1400);

                }
            );

        });


    // =========================
    // WISHLIST
    // =========================

    function getWishlist() {

        try {

            const saved =
                localStorage.getItem(
                    WISHLIST_KEY
                );

            return saved
                ? JSON.parse(saved)
                : [];

        } catch (error) {

            console.error(
                "Could not load wishlist:",
                error
            );

            return [];

        }

    }


    function saveWishlist(items) {

        localStorage.setItem(
            WISHLIST_KEY,
            JSON.stringify(items)
        );

        updateWishlistCount();

        updateWishlistButtons();

    }


    function isWishlisted(productId) {

        return getWishlist().some(
            (item) =>
                item.id === productId
        );

    }


    function addToWishlist(product) {

        const items = getWishlist();

        if (
            !items.some(
                (item) =>
                    item.id === product.id
            )
        ) {

            items.push(product);

        }

        saveWishlist(items);

    }


    function removeFromWishlist(productId) {

        const items =
            getWishlist().filter(
                (item) =>
                    item.id !== productId
            );

        saveWishlist(items);

    }


    function toggleWishlist(product) {

        if (isWishlisted(product.id)) {

            removeFromWishlist(product.id);

            return false;

        }

        addToWishlist(product);

        return true;

    }


    function updateWishlistCount() {

        const count =
            getWishlist().length;

        document
            .querySelectorAll(
                ".wishlist-count"
            )
            .forEach((counter) => {

                counter.textContent =
                    count;

                counter.hidden =
                    count === 0;

            });

    }


    function updateWishlistButtons() {

        document
            .querySelectorAll(
                "[data-add-to-wishlist]"
            )
            .forEach((button) => {

                const productId =
                    button.dataset.productId;

                const saved =
                    isWishlisted(productId);

                button.classList.toggle(
                    "saved",
                    saved
                );

                button.setAttribute(
                    "aria-pressed",
                    String(saved)
                );

                button.textContent =
                    saved
                        ? "Saved to Wishlist ✓"
                        : "Add to Wishlist";

            });

    }


    // =========================
    // WISHLIST BUTTONS
    // =========================

    document
        .querySelectorAll(
            "[data-add-to-wishlist]"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    const productId =
                        button.dataset.productId;

                    const productName =
                        button.dataset.productName;

                    const productPrice =
                        Number(
                            button.dataset.productPrice || 0
                        );

                    const productImage =
                        button.dataset.productImage || "";

                    const productUrl =
                        button.dataset.productUrl || "";

                    const available =
                        button.dataset.productAvailable ===
                        "true";

                    if (
                        !productId ||
                        !productName
                    ) {

                        console.error(
                            "Missing wishlist product information."
                        );

                        return;

                    }

                    toggleWishlist({

                        id: productId,

                        name: productName,

                        price: productPrice,

                        image: productImage,

                        url: productUrl,

                        available: available

                    });

                }
            );

        });


    // =========================
    // QUANTITY MINUS
    // =========================

    document
        .querySelectorAll(
            "[data-quantity-decrease]"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    const target =
                        button.dataset.quantityDecrease;

                    const input =
                        document.querySelector(target);

                    if (!input) {
                        return;
                    }

                    input.value =
                        Math.max(
                            Number(input.min || 1),
                            Number(input.value || 1) - 1
                        );

                }
            );

        });


    // =========================
    // QUANTITY PLUS
    // =========================

    document
        .querySelectorAll(
            "[data-quantity-increase]"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    const target =
                        button.dataset.quantityIncrease;

                    const input =
                        document.querySelector(target);

                    if (!input) {
                        return;
                    }

                    const max =
                        input.max
                            ? Number(input.max)
                            : Infinity;

                    input.value =
                        Math.min(
                            max,
                            Number(input.value || 1) + 1
                        );

                }
            );

        });


    // =========================
    // GLOBAL CART FUNCTIONS
    // =========================

    window.AquaCart = {

        getCart,

        addToCart,

        removeFromCart,

        updateCartQuantity,

        saveCart

    };


    // =========================
    // GLOBAL WISHLIST FUNCTIONS
    // =========================

    window.AquaWishlist = {

        getWishlist,

        addToWishlist,

        removeFromWishlist,

        toggleWishlist,

        saveWishlist,

        isWishlisted

    };


    // =========================
    // INITIAL STATE
    // =========================

    updateCartCount();

    updateWishlistCount();

    updateWishlistButtons();

});