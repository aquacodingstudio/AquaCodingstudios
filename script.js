document.addEventListener("DOMContentLoaded", async () => {

    // =========================
    // CONSTANTS
    // =========================

    const CART_KEY =
        "aquacodingCart";

    const WISHLIST_KEY =
        "aquacodingWishlist";


    // =========================
    // MOBILE NAVIGATION
    // =========================

    const menuButton =
        document.querySelector(
            ".menu-button"
        );

    const navigation =
        document.querySelector(
            ".main-nav"
        );


    if (
        menuButton &&
        navigation
    ) {

        menuButton.addEventListener(
            "click",
            () => {

                const isOpen =
                    navigation.classList
                        .toggle("open");


                menuButton.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );

            }
        );


        navigation
            .querySelectorAll("a")
            .forEach((link) => {

                link.addEventListener(
                    "click",
                    () => {

                        navigation.classList
                            .remove("open");


                        menuButton.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }
                );

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


    if (
        "IntersectionObserver"
        in window
    ) {

        const revealObserver =
            new IntersectionObserver(
                (
                    entries,
                    observer
                ) => {

                    entries.forEach(
                        (entry) => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target
                                    .classList
                                    .add(
                                        "visible"
                                    );


                                observer
                                    .unobserve(
                                        entry.target
                                    );

                            }

                        }
                    );

                },
                {
                    threshold: 0.12
                }
            );


        revealElements.forEach(
            (element) => {

                element.classList
                    .add("reveal");


                revealObserver
                    .observe(element);

            }
        );

    }


    // =========================
    // SHOP SEARCH + FILTERS
    // =========================

    const searchInput =
        document.querySelector(
            ".shop-search-input"
        );


    const filterButtons =
        document.querySelectorAll(
            ".filter-button[data-filter]"
        );


    const products =
        document.querySelectorAll(
            ".shop-product"
        );


    let activeFilter =
        "all";


    function updateProducts() {

        const searchTerm =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        products.forEach(
            (product) => {

                const category =
                    product.dataset.category
                    || "";


                const name =
                    (
                        product.dataset.name
                        || ""
                    )
                        .toLowerCase();


                const matchesCategory =
                    activeFilter === "all" ||
                    category ===
                        activeFilter;


                const matchesSearch =
                    searchTerm === "" ||
                    name.includes(
                        searchTerm
                    );


                product.style.display =
                    matchesCategory &&
                    matchesSearch
                        ? ""
                        : "none";

            }
        );

    }


    filterButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    activeFilter =
                        button.dataset.filter
                        || "all";


                    filterButtons.forEach(
                        (item) => {

                            item.classList
                                .remove(
                                    "active"
                                );

                        }
                    );


                    button.classList
                        .add("active");


                    updateProducts();

                }
            );

        }
    );


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
                localStorage.getItem(
                    CART_KEY
                );


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

        const cart =
            getCart();


        const existingProduct =
            cart.find(
                (item) =>
                    item.id ===
                    product.id
            );


        if (existingProduct) {

            existingProduct.quantity +=
                Number(
                    product.quantity
                    || 1
                );

        } else {

            cart.push({

                ...product,

                quantity:
                    Number(
                        product.quantity
                        || 1
                    )

            });

        }


        saveCart(cart);

    }


    function removeFromCart(
        productId
    ) {

        const cart =
            getCart().filter(
                (item) =>
                    item.id !==
                    productId
            );


        saveCart(cart);

    }


    function updateCartQuantity(
        productId,
        quantity
    ) {

        const cart =
            getCart();


        const item =
            cart.find(
                (product) =>
                    product.id ===
                    productId
            );


        if (!item) {
            return;
        }


        if (quantity <= 0) {

            removeFromCart(
                productId
            );

            return;

        }


        item.quantity =
            quantity;


        saveCart(cart);

    }


    function updateCartCount() {

        const cart =
            getCart();


        const totalItems =
            cart.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.quantity
                        || 0
                    ),
                0
            );


        document
            .querySelectorAll(
                ".cart-count"
            )
            .forEach(
                (counter) => {

                    counter.textContent =
                        totalItems;


                    counter.hidden =
                        totalItems === 0;

                }
            );

    }


    // =========================
    // ADD TO CART BUTTONS
    // =========================

    document
        .querySelectorAll(
            "[data-add-to-cart]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        if (
                            button.disabled
                        ) {
                            return;
                        }


                        const productId =
                            button.dataset
                                .productId;


                        const productName =
                            button.dataset
                                .productName;


                        const productPrice =
                            Number(
                                button.dataset
                                    .productPrice
                            );


                        const productImage =
                            button.dataset
                                .productImage
                            || "";


                        const productUrl =
                            button.dataset
                                .productUrl
                            || "";


                        const quantityTarget =
                            button.dataset
                                .quantityTarget;


                        const quantityInput =
                            quantityTarget
                                ? document
                                    .querySelector(
                                        quantityTarget
                                    )
                                : null;


                        const quantity =
                            quantityInput
                                ? Math.max(
                                    1,
                                    Number(
                                        quantityInput
                                            .value
                                    ) || 1
                                )
                                : 1;


                        if (
                            !productId ||
                            !productName ||
                            Number.isNaN(
                                productPrice
                            )
                        ) {

                            console.error(
                                "Missing product information."
                            );

                            return;

                        }


                        addToCart({

                            id:
                                productId,

                            name:
                                productName,

                            price:
                                productPrice,

                            image:
                                productImage,

                            url:
                                productUrl,

                            quantity:
                                quantity

                        });


                        const originalText =
                            button.textContent;


                        button.textContent =
                            "Added to Cart ✓";


                        setTimeout(
                            () => {

                                button.textContent =
                                    originalText;

                            },
                            1400
                        );

                    }
                );

            }
        );
    // =========================
    // WISHLIST STATE
    // =========================

    let wishlistItems = [];

    let currentUser = null;

    let wishlistReady = false;


    // =========================
    // LOCAL WISHLIST HELPERS
    // =========================

    function getLocalWishlist() {

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
                "Could not load local wishlist:",
                error
            );


            return [];

        }

    }


    function saveLocalWishlist(
        items
    ) {

        localStorage.setItem(
            WISHLIST_KEY,
            JSON.stringify(items)
        );

    }


    // =========================
    // SUPABASE WISHLIST HELPERS
    // =========================

    function databaseRowToItem(
        row
    ) {

        return {

            id:
                row.product_id,

            name:
                row.product_name,

            price:
                Number(
                    row.product_price
                    || 0
                ),

            image:
                row.product_image
                || "",

            url:
                row.product_url
                || "",

            available:
                Boolean(
                    row.product_available
                )

        };

    }


    function itemToDatabaseRow(
        item,
        userId
    ) {

        return {

            user_id:
                userId,

            product_id:
                item.id,

            product_name:
                item.name,

            product_price:
                Number(
                    item.price
                    || 0
                ),

            product_image:
                item.image
                || null,

            product_url:
                item.url
                || null,

            product_available:
                Boolean(
                    item.available
                )

        };

    }


    async function loadDatabaseWishlist() {

        if (
            !window.AquaSupabase ||
            !currentUser
        ) {

            return [];

        }


        const {
            data,
            error
        } =
            await window.AquaSupabase
                .from("wishlists")
                .select(
                    "product_id, " +
                    "product_name, " +
                    "product_price, " +
                    "product_image, " +
                    "product_url, " +
                    "product_available"
                )
                .eq(
                    "user_id",
                    currentUser.id
                )
                .order(
                    "created_at",
                    {
                        ascending:
                            false
                    }
                );


        if (error) {

            console.error(
                "Could not load database wishlist:",
                error
            );


            return [];

        }


        return (
            data || []
        ).map(
            databaseRowToItem
        );

    }


    async function saveItemToDatabase(
        item
    ) {

        if (
            !window.AquaSupabase ||
            !currentUser
        ) {

            return false;

        }


        const {
            error
        } =
            await window.AquaSupabase
                .from("wishlists")
                .upsert(
                    itemToDatabaseRow(
                        item,
                        currentUser.id
                    ),
                    {
                        onConflict:
                            "user_id,product_id"
                    }
                );


        if (error) {

            console.error(
                "Could not save wishlist item:",
                error
            );


            return false;

        }


        return true;

    }


    async function removeItemFromDatabase(
        productId
    ) {

        if (
            !window.AquaSupabase ||
            !currentUser
        ) {

            return false;

        }


        const {
            error
        } =
            await window.AquaSupabase
                .from("wishlists")
                .delete()
                .eq(
                    "user_id",
                    currentUser.id
                )
                .eq(
                    "product_id",
                    productId
                );


        if (error) {

            console.error(
                "Could not remove wishlist item:",
                error
            );


            return false;

        }


        return true;

    }


    // =========================
    // WISHLIST UI HELPERS
    // =========================

    function getWishlist() {

        return [
            ...wishlistItems
        ];

    }


    function isWishlisted(
        productId
    ) {

        return wishlistItems.some(
            (item) =>
                item.id ===
                productId
        );

    }


    function updateWishlistCount() {

        const count =
            wishlistItems.length;


        document
            .querySelectorAll(
                ".wishlist-count"
            )
            .forEach(
                (counter) => {

                    counter.textContent =
                        count;


                    counter.hidden =
                        count === 0;

                }
            );

    }


    function updateWishlistButtons() {

        document
            .querySelectorAll(
                "[data-add-to-wishlist]"
            )
            .forEach(
                (button) => {

                    const productId =
                        button.dataset
                            .productId;


                    const saved =
                        isWishlisted(
                            productId
                        );


                    button.classList
                        .toggle(
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

                }
            );

    }


    function refreshWishlistUI() {

        updateWishlistCount();

        updateWishlistButtons();


        document.dispatchEvent(
            new CustomEvent(
                "aquacoding:wishlist-updated",
                {
                    detail: {
                        items:
                            getWishlist(),

                        user:
                            currentUser
                    }
                }
            )
        );

    }


    // =========================
    // GUEST → ACCOUNT MIGRATION
    // =========================

    async function migrateLocalWishlist() {

        if (
            !currentUser ||
            !window.AquaSupabase
        ) {

            return;

        }


        const localItems =
            getLocalWishlist();


        if (
            localItems.length === 0
        ) {

            return;

        }


        const rows =
            localItems.map(
                (item) =>
                    itemToDatabaseRow(
                        item,
                        currentUser.id
                    )
            );


        const {
            error
        } =
            await window.AquaSupabase
                .from("wishlists")
                .upsert(
                    rows,
                    {
                        onConflict:
                            "user_id,product_id"
                    }
                );


        if (error) {

            console.error(
                "Could not migrate guest wishlist:",
                error
            );

            return;

        }


        localStorage.removeItem(
            WISHLIST_KEY
        );

    }


    // =========================
    // WISHLIST ACTIONS
    // =========================

    async function addToWishlist(
        product
    ) {

        if (
            !product?.id ||
            !product?.name
        ) {

            return false;

        }


        if (
            isWishlisted(
                product.id
            )
        ) {

            return true;

        }


        if (currentUser) {

            const saved =
                await saveItemToDatabase(
                    product
                );


            if (!saved) {

                return false;

            }

        } else {

            const localItems =
                getLocalWishlist();


            if (
                !localItems.some(
                    (item) =>
                        item.id ===
                        product.id
                )
            ) {

                localItems.push(
                    product
                );


                saveLocalWishlist(
                    localItems
                );

            }

        }


        wishlistItems.push(
            product
        );


        refreshWishlistUI();


        return true;

    }


    async function removeFromWishlist(
        productId
    ) {

        if (
            currentUser
        ) {

            const removed =
                await removeItemFromDatabase(
                    productId
                );


            if (!removed) {

                return false;

            }

        } else {

            const localItems =
                getLocalWishlist()
                    .filter(
                        (item) =>
                            item.id !==
                            productId
                    );


            saveLocalWishlist(
                localItems
            );

        }


        wishlistItems =
            wishlistItems.filter(
                (item) =>
                    item.id !==
                    productId
            );


        refreshWishlistUI();


        return true;

    }


    async function toggleWishlist(
        product
    ) {

        if (
            isWishlisted(
                product.id
            )
        ) {

            await removeFromWishlist(
                product.id
            );


            return false;

        }


        const added =
            await addToWishlist(
                product
            );


        return added;

    }
    // =========================
    // SUPABASE CONNECTION
    // =========================

    let supabase = null;


    try {

        const module =
            await import(
                "./supabase-client.js"
            );


        supabase =
            module.supabase;


        window.AquaSupabase =
            supabase;

    } catch (error) {

        console.error(
            "Could not load Supabase:",
            error
        );

    }


    // =========================
    // INITIALISE WISHLIST
    // =========================

    async function initialiseWishlist() {

        wishlistReady =
            false;


        /*
            No Supabase connection:
            keep the guest/local wishlist working.
        */

        if (!supabase) {

            currentUser =
                null;


            wishlistItems =
                getLocalWishlist();


            wishlistReady =
                true;


            refreshWishlistUI();


            return;

        }


        const {
            data: {
                session
            },
            error
        } =
            await supabase.auth
                .getSession();


        if (error) {

            console.error(
                "Could not check account session:",
                error
            );


            currentUser =
                null;


            wishlistItems =
                getLocalWishlist();


            wishlistReady =
                true;


            refreshWishlistUI();


            return;

        }


        currentUser =
            session?.user
                || null;


        /*
            Signed-in customer:
            move any guest wishlist items
            into their account first.
        */

        if (currentUser) {

            await migrateLocalWishlist();


            wishlistItems =
                await loadDatabaseWishlist();

        } else {

            wishlistItems =
                getLocalWishlist();

        }


        wishlistReady =
            true;


        refreshWishlistUI();

    }


    // =========================
    // AUTH CHANGES
    // =========================

    if (supabase) {

        supabase.auth
            .onAuthStateChange(
                (
                    event,
                    session
                ) => {

                    /*
                        Run outside the auth callback
                        itself so database calls happen
                        after Supabase finishes processing
                        the auth event.
                    */

                    setTimeout(
                        async () => {

                            if (
                                event ===
                                "SIGNED_OUT"
                            ) {

                                currentUser =
                                    null;


                                wishlistItems =
                                    getLocalWishlist();


                                wishlistReady =
                                    true;


                                refreshWishlistUI();


                                return;

                            }


                            if (
                                session?.user
                            ) {

                                currentUser =
                                    session.user;


                                await migrateLocalWishlist();


                                wishlistItems =
                                    await loadDatabaseWishlist();


                                wishlistReady =
                                    true;


                                refreshWishlistUI();

                            }

                        },
                        0
                    );

                }
            );

    }


    // =========================
    // WISHLIST BUTTONS
    // =========================

    document
        .querySelectorAll(
            "[data-add-to-wishlist]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    async () => {

                        if (
                            !wishlistReady
                        ) {

                            return;

                        }


                        const productId =
                            button.dataset
                                .productId;


                        const productName =
                            button.dataset
                                .productName;


                        const productPrice =
                            Number(
                                button.dataset
                                    .productPrice
                                || 0
                            );


                        const productImage =
                            button.dataset
                                .productImage
                            || "";


                        const productUrl =
                            button.dataset
                                .productUrl
                            || "";


                        const available =
                            button.dataset
                                .productAvailable ===
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


                        button.disabled =
                            true;


                        const wasSaved =
                            isWishlisted(
                                productId
                            );


                        const result =
                            await toggleWishlist({

                                id:
                                    productId,

                                name:
                                    productName,

                                price:
                                    productPrice,

                                image:
                                    productImage,

                                url:
                                    productUrl,

                                available:
                                    available

                            });


                        /*
                            If database saving failed,
                            restore the visual state.
                        */

                        if (
                            !result &&
                            !wasSaved &&
                            !isWishlisted(
                                productId
                            )
                        ) {

                            console.error(
                                "Wishlist item could not be saved."
                            );

                        }


                        button.disabled =
                            false;


                        updateWishlistButtons();

                    }
                );

            }
        );
    // =========================
    // QUANTITY MINUS
    // =========================

    document
        .querySelectorAll(
            "[data-quantity-decrease]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const target =
                            button.dataset
                                .quantityDecrease;


                        const input =
                            document.querySelector(
                                target
                            );


                        if (!input) {
                            return;
                        }


                        input.value =
                            Math.max(
                                Number(
                                    input.min || 1
                                ),
                                Number(
                                    input.value || 1
                                ) - 1
                            );

                    }
                );

            }
        );


    // =========================
    // QUANTITY PLUS
    // =========================

    document
        .querySelectorAll(
            "[data-quantity-increase]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const target =
                            button.dataset
                                .quantityIncrease;


                        const input =
                            document.querySelector(
                                target
                            );


                        if (!input) {
                            return;
                        }


                        const max =
                            input.max
                                ? Number(
                                    input.max
                                )
                                : Infinity;


                        input.value =
                            Math.min(
                                max,
                                Number(
                                    input.value || 1
                                ) + 1
                            );

                    }
                );

            }
        );


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

        isWishlisted,

        addToWishlist,

        removeFromWishlist,

        toggleWishlist,

        refreshWishlistUI,

        getCurrentUser() {

            return currentUser;

        },

        isReady() {

            return wishlistReady;

        }

    };


    // =========================
    // INITIAL STATE
    // =========================

    updateCartCount();


    /*
        initialiseWishlist() decides whether
        this visitor should use:

        - localStorage as a guest
        - Supabase as a signed-in customer

        It also migrates any existing guest
        wishlist after the customer signs in.
    */

    await initialiseWishlist();


    // =========================
    // READY EVENT
    // =========================

    document.dispatchEvent(
        new CustomEvent(
            "aquacoding:wishlist-ready",
            {
                detail: {

                    items:
                        getWishlist(),

                    user:
                        currentUser

                }
            }
        )
    );

});