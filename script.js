document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // MOBILE NAVIGATION
    // =========================

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

    const revealElements = document.querySelectorAll(
        ".hero-content, .hero-card, .section-heading, " +
        ".two-column, .timeline-item, .standard-card, " +
        ".contact-section"
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

        const searchTerm = searchInput
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
    // SHOPPING CART
    // =========================

    const CART_KEY = "aquacodingCart";


    function getCart() {

        try {

            const savedCart =
                localStorage.getItem(CART_KEY);

            return savedCart
                ? JSON.parse(savedCart)
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
                (item) => item.id === product.id
            );


        if (existingProduct) {

            existingProduct.quantity +=
                product.quantity;

        } else {

            cart.push(product);
        }


        saveCart(cart);
    }


    function removeFromCart(productId) {

        const cart =
            getCart().filter(
                (item) => item.id !== productId
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
                    total + item.quantity,
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

                    const quantityInput =
                        document.querySelector(
                            button.dataset.quantityTarget
                        );

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


    // Make cart functions available
    // for the future cart page.

    window.AquaCart = {
        getCart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        saveCart
    };


    updateCartCount();

});