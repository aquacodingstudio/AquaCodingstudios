document.addEventListener(
    "DOMContentLoaded",
    async () => {

        // =========================
        // CONSTANTS
        // =========================

        const CART_KEY =
            "aquacodingCart";

        const WISHLIST_KEY =
            "aquacodingWishlist";

        const MAX_CART_QUANTITY =
            99;


        // =========================
        // SHARED ACCOUNT STATE
        // =========================

        let supabase = null;

        let currentUser = null;


        // =========================
        // CART STATE
        // =========================

        let cartItems = [];

        let cartReady = false;

        let activeCartId = null;


        // =========================
        // WISHLIST STATE
        // =========================

        let wishlistItems = [];

        let wishlistReady = false;


        // =========================
        // LOAD SUPABASE
        // =========================

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
        // CURRENT SESSION
        // =========================

        if (supabase) {

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
                    "Could not load account session:",
                    error
                );

            } else {

                currentUser =
                    session?.user || null;

            }

        }


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
                .forEach(
                    (link) => {

                        link.addEventListener(
                            "click",
                            () => {

                                navigation
                                    .classList
                                    .remove(
                                        "open"
                                    );


                                menuButton
                                    .setAttribute(
                                        "aria-expanded",
                                        "false"
                                    );

                            }
                        );

                    }
                );

        }


        // =========================
        // SCROLL ANIMATIONS
        // =========================

        const revealElements =
            document.querySelectorAll(
                ".hero-content, " +
                ".hero-card, " +
                ".section-heading, " +
                ".two-column, " +
                ".timeline-item, " +
                ".standard-card, " +
                ".contact-section, " +
                ".featured-card, " +
                ".guide-card, " +
                ".trust-card, " +
                ".info-card"
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
                                    entry
                                        .isIntersecting
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
                        threshold:
                            0.12
                    }
                );


            revealElements
                .forEach(
                    (element) => {

                        element
                            .classList
                            .add(
                                "reveal"
                            );


                        revealObserver
                            .observe(
                                element
                            );

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
                    ? searchInput
                        .value
                        .trim()
                        .toLowerCase()
                    : "";


            products.forEach(
                (product) => {

                    const category =
                        product.dataset
                            .category || "";


                    const name =
                        (
                            product.dataset
                                .name || ""
                        )
                            .toLowerCase();


                    const matchesCategory =
                        activeFilter ===
                            "all" ||
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


        filterButtons
            .forEach(
                (button) => {

                    button.addEventListener(
                        "click",
                        () => {

                            activeFilter =
                                button.dataset
                                    .filter
                                || "all";


                            filterButtons
                                .forEach(
                                    (item) => {

                                        item
                                            .classList
                                            .remove(
                                                "active"
                                            );

                                    }
                                );


                            button
                                .classList
                                .add(
                                    "active"
                                );


                            updateProducts();

                        }
                    );

                }
            );


        if (searchInput) {

            searchInput
                .addEventListener(
                    "input",
                    updateProducts
                );

        }


        updateProducts();


        // =========================
        // CART DATA SANITISING
        // =========================

        function normaliseCartItem(
            item
        ) {

            if (
                !item ||
                typeof item !== "object"
            ) {

                return null;

            }


            const id =
                String(
                    item.id || ""
                ).trim();


            const name =
                String(
                    item.name || ""
                ).trim();


            const rawPrice =
                Number(
                    item.price
                );


            const rawQuantity =
                Number(
                    item.quantity
                );


            if (
                !id ||
                !name ||
                !Number.isFinite(
                    rawPrice
                ) ||
                rawPrice < 0
            ) {

                return null;

            }


            const quantity =
                Math.min(
                    MAX_CART_QUANTITY,
                    Math.max(
                        1,
                        Math.floor(
                            Number.isFinite(
                                rawQuantity
                            )
                                ? rawQuantity
                                : 1
                        )
                    )
                );


            return {

                id,

                name,

                price:
                    rawPrice,

                image:
                    typeof item.image ===
                        "string"
                        ? item.image
                        : "",

                url:
                    typeof item.url ===
                        "string"
                        ? item.url
                        : "",

                quantity

            };

        }


        function normaliseCart(
            items
        ) {

            if (
                !Array.isArray(items)
            ) {

                return [];

            }


            const merged =
                new Map();


            items.forEach(
                (item) => {

                    const cleanItem =
                        normaliseCartItem(
                            item
                        );


                    if (!cleanItem) {
                        return;
                    }


                    const existing =
                        merged.get(
                            cleanItem.id
                        );


                    if (existing) {

                        existing.quantity =
                            Math.min(
                                MAX_CART_QUANTITY,
                                existing.quantity +
                                cleanItem.quantity
                            );

                    } else {

                        merged.set(
                            cleanItem.id,
                            cleanItem
                        );

                    }

                }
            );


            return Array.from(
                merged.values()
            );

        }
        // =========================
        // LOCAL CART STORAGE
        // =========================

        function getLocalCart() {

            try {

                const saved =
                    localStorage.getItem(
                        CART_KEY
                    );


                const parsed =
                    saved
                        ? JSON.parse(saved)
                        : [];


                return normaliseCart(
                    parsed
                );

            } catch (error) {

                console.error(
                    "Could not load local cart:",
                    error
                );


                return [];

            }

        }


        function saveLocalCart(
            items
        ) {

            const cleanCart =
                normaliseCart(
                    items
                );


            localStorage.setItem(
                CART_KEY,
                JSON.stringify(
                    cleanCart
                )
            );

        }


        // =========================
        // DATABASE CART CONVERSION
        // =========================

        function databaseRowToCartItem(
            row
        ) {

            return normaliseCartItem({

                id:
                    row.product_id,

                name:
                    row.product_name,

                price:
                    Number(
                        row.unit_price_snapshot
                        || 0
                    ),

                image:
                    row.product_image
                    || "",

                url:
                    row.product_url
                    || "",

                quantity:
                    Number(
                        row.quantity
                        || 1
                    )

            });

        }


        function cartItemToDatabaseRow(
            item,
            cartId
        ) {

            const cleanItem =
                normaliseCartItem(
                    item
                );


            if (!cleanItem) {

                return null;

            }


            return {

                cart_id:
                    cartId,

                product_id:
                    cleanItem.id,

                product_name:
                    cleanItem.name,

                unit_price_snapshot:
                    cleanItem.price,

                currency:
                    "EUR",

                product_image:
                    cleanItem.image
                        || null,

                product_url:
                    cleanItem.url
                        || null,

                quantity:
                    cleanItem.quantity

            };

        }


        // =========================
        // GET / CREATE CUSTOMER CART
        // =========================

        async function ensureDatabaseCart() {

            if (
                !supabase ||
                !currentUser
            ) {

                return null;

            }


            if (activeCartId) {

                return activeCartId;

            }


            const {
                data: existingCart,
                error: selectError
            } =
                await supabase
                    .from("carts")
                    .select("id")
                    .eq(
                        "user_id",
                        currentUser.id
                    )
                    .maybeSingle();


            if (selectError) {

                console.error(
                    "Could not find customer cart:",
                    selectError
                );


                return null;

            }


            if (existingCart?.id) {

                activeCartId =
                    existingCart.id;


                return activeCartId;

            }


            const {
                data: createdCart,
                error: insertError
            } =
                await supabase
                    .from("carts")
                    .insert({

                        user_id:
                            currentUser.id

                    })
                    .select("id")
                    .single();


            if (insertError) {

                /*
                    In the unlikely event that
                    another tab created the cart
                    between our SELECT and INSERT,
                    try loading it once more.
                */

                const {
                    data: retryCart,
                    error: retryError
                } =
                    await supabase
                        .from("carts")
                        .select("id")
                        .eq(
                            "user_id",
                            currentUser.id
                        )
                        .maybeSingle();


                if (
                    retryError ||
                    !retryCart?.id
                ) {

                    console.error(
                        "Could not create customer cart:",
                        insertError
                    );


                    return null;

                }


                activeCartId =
                    retryCart.id;


                return activeCartId;

            }


            activeCartId =
                createdCart.id;


            return activeCartId;

        }


        // =========================
        // LOAD DATABASE CART
        // =========================

        async function loadDatabaseCart() {

            const cartId =
                await ensureDatabaseCart();


            if (!cartId) {

                return [];

            }


            const {
                data,
                error
            } =
                await supabase
                    .from("cart_items")
                    .select(
                        "product_id, " +
                        "product_name, " +
                        "unit_price_snapshot, " +
                        "product_image, " +
                        "product_url, " +
                        "quantity, " +
                        "created_at"
                    )
                    .eq(
                        "cart_id",
                        cartId
                    )
                    .order(
                        "created_at",
                        {
                            ascending:
                                true
                        }
                    );


            if (error) {

                console.error(
                    "Could not load customer cart:",
                    error
                );


                return [];

            }


            return normaliseCart(
                (data || [])
                    .map(
                        databaseRowToCartItem
                    )
                    .filter(Boolean)
            );

        }


        // =========================
        // SAVE DATABASE CART ITEM
        // =========================

        async function saveCartItemToDatabase(
            item
        ) {

            const cartId =
                await ensureDatabaseCart();


            if (!cartId) {

                return false;

            }


            const row =
                cartItemToDatabaseRow(
                    item,
                    cartId
                );


            if (!row) {

                return false;

            }


            const {
                error
            } =
                await supabase
                    .from("cart_items")
                    .upsert(
                        row,
                        {
                            onConflict:
                                "cart_id,product_id"
                        }
                    );


            if (error) {

                console.error(
                    "Could not save cart item:",
                    error
                );


                return false;

            }


            return true;

        }


        // =========================
        // REMOVE DATABASE CART ITEM
        // =========================

        async function removeCartItemFromDatabase(
            productId
        ) {

            const cartId =
                await ensureDatabaseCart();


            if (!cartId) {

                return false;

            }


            const {
                error
            } =
                await supabase
                    .from("cart_items")
                    .delete()
                    .eq(
                        "cart_id",
                        cartId
                    )
                    .eq(
                        "product_id",
                        productId
                    );


            if (error) {

                console.error(
                    "Could not remove cart item:",
                    error
                );


                return false;

            }


            return true;

        }


        // =========================
        // CLEAR DATABASE CART
        // =========================

        async function clearDatabaseCart() {

            const cartId =
                await ensureDatabaseCart();


            if (!cartId) {

                return false;

            }


            const {
                error
            } =
                await supabase
                    .from("cart_items")
                    .delete()
                    .eq(
                        "cart_id",
                        cartId
                    );


            if (error) {

                console.error(
                    "Could not clear customer cart:",
                    error
                );


                return false;

            }


            return true;

        }


        // =========================
        // MERGE TWO CARTS
        // =========================

        function mergeCarts(
            firstCart,
            secondCart
        ) {

            return normaliseCart([
                ...firstCart,
                ...secondCart
            ]);

        }


        // =========================
        // GUEST → ACCOUNT CART
        // =========================

        async function migrateLocalCart() {

            if (
                !supabase ||
                !currentUser
            ) {

                return true;

            }


            const localCart =
                getLocalCart();


            if (
                localCart.length === 0
            ) {

                return true;

            }


            const databaseCart =
                await loadDatabaseCart();


            /*
                Quantities are combined if the
                same product exists in both carts.
            */

            const mergedCart =
                mergeCarts(
                    databaseCart,
                    localCart
                );


            const cartId =
                await ensureDatabaseCart();


            if (!cartId) {

                return false;

            }


            const rows =
                mergedCart
                    .map(
                        (item) =>
                            cartItemToDatabaseRow(
                                item,
                                cartId
                            )
                    )
                    .filter(Boolean);


            if (
                rows.length === 0
            ) {

                return true;

            }


            const {
                error
            } =
                await supabase
                    .from("cart_items")
                    .upsert(
                        rows,
                        {
                            onConflict:
                                "cart_id,product_id"
                        }
                    );


            if (error) {

                console.error(
                    "Could not migrate guest cart:",
                    error
                );


                return false;

            }


            /*
                Only erase the guest copy after
                Supabase confirms the save.
            */

            localStorage.removeItem(
                CART_KEY
            );


            return true;

        }
        // =========================
        // CART UI HELPERS
        // =========================

        function getCart() {

            return cartItems.map(
                (item) => ({
                    ...item
                })
            );

        }


        function updateCartCount() {

            const totalItems =
                cartItems.reduce(
                    (
                        total,
                        item
                    ) => {

                        return (
                            total +
                            Number(
                                item.quantity || 0
                            )
                        );

                    },
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


        function refreshCartUI() {

            updateCartCount();


            document.dispatchEvent(
                new CustomEvent(
                    "aquacoding:cart-updated",
                    {
                        detail: {

                            items:
                                getCart(),

                            user:
                                currentUser

                        }
                    }
                )
            );

        }


        // =========================
        // ADD TO CART
        // =========================

        async function addToCart(
            product
        ) {

            const cleanProduct =
                normaliseCartItem(
                    product
                );


            if (!cleanProduct) {

                console.error(
                    "Invalid cart product."
                );


                return false;

            }


            const existingItem =
                cartItems.find(
                    (item) =>
                        item.id ===
                        cleanProduct.id
                );


            let nextItem;


            if (existingItem) {

                nextItem = {

                    ...existingItem,

                    /*
                        Keep the newest display
                        information from the product
                        page while combining quantity.
                    */

                    name:
                        cleanProduct.name,

                    price:
                        cleanProduct.price,

                    image:
                        cleanProduct.image,

                    url:
                        cleanProduct.url,

                    quantity:
                        Math.min(
                            MAX_CART_QUANTITY,
                            existingItem.quantity +
                            cleanProduct.quantity
                        )

                };

            } else {

                nextItem =
                    cleanProduct;

            }


            if (currentUser) {

                const saved =
                    await saveCartItemToDatabase(
                        nextItem
                    );


                if (!saved) {

                    return false;

                }

            } else {

                const localCart =
                    cartItems.filter(
                        (item) =>
                            item.id !==
                            nextItem.id
                    );


                localCart.push(
                    nextItem
                );


                saveLocalCart(
                    localCart
                );

            }


            if (existingItem) {

                cartItems =
                    cartItems.map(
                        (item) => {

                            return item.id ===
                                nextItem.id
                                ? nextItem
                                : item;

                        }
                    );

            } else {

                cartItems.push(
                    nextItem
                );

            }


            refreshCartUI();


            return true;

        }


        // =========================
        // REMOVE FROM CART
        // =========================

        async function removeFromCart(
            productId
        ) {

            const cleanId =
                String(
                    productId || ""
                ).trim();


            if (!cleanId) {

                return false;

            }


            if (currentUser) {

                const removed =
                    await removeCartItemFromDatabase(
                        cleanId
                    );


                if (!removed) {

                    return false;

                }

            } else {

                const localCart =
                    cartItems.filter(
                        (item) =>
                            item.id !==
                            cleanId
                    );


                saveLocalCart(
                    localCart
                );

            }


            cartItems =
                cartItems.filter(
                    (item) =>
                        item.id !==
                        cleanId
                );


            refreshCartUI();


            return true;

        }


        // =========================
        // UPDATE CART QUANTITY
        // =========================

        async function updateCartQuantity(
            productId,
            quantity
        ) {

            const cleanId =
                String(
                    productId || ""
                ).trim();


            const requestedQuantity =
                Number(
                    quantity
                );


            if (
                !cleanId ||
                !Number.isFinite(
                    requestedQuantity
                )
            ) {

                return false;

            }


            const item =
                cartItems.find(
                    (product) =>
                        product.id ===
                        cleanId
                );


            if (!item) {

                return false;

            }


            /*
                Zero or below means remove.
            */

            if (
                requestedQuantity <= 0
            ) {

                return await removeFromCart(
                    cleanId
                );

            }


            const safeQuantity =
                Math.min(
                    MAX_CART_QUANTITY,
                    Math.max(
                        1,
                        Math.floor(
                            requestedQuantity
                        )
                    )
                );


            const updatedItem = {

                ...item,

                quantity:
                    safeQuantity

            };


            if (currentUser) {

                const saved =
                    await saveCartItemToDatabase(
                        updatedItem
                    );


                if (!saved) {

                    return false;

                }

            } else {

                const localCart =
                    cartItems.map(
                        (product) => {

                            return product.id ===
                                cleanId
                                ? updatedItem
                                : product;

                        }
                    );


                saveLocalCart(
                    localCart
                );

            }


            cartItems =
                cartItems.map(
                    (product) => {

                        return product.id ===
                            cleanId
                            ? updatedItem
                            : product;

                    }
                );


            refreshCartUI();


            return true;

        }


        // =========================
        // CLEAR CART
        // =========================

        async function clearCart() {

            if (
                cartItems.length === 0
            ) {

                return true;

            }


            if (currentUser) {

                const cleared =
                    await clearDatabaseCart();


                if (!cleared) {

                    return false;

                }

            } else {

                localStorage.removeItem(
                    CART_KEY
                );

            }


            cartItems = [];


            refreshCartUI();


            return true;

        }


        // =========================
        // REPLACE CART
        // =========================

        async function replaceCart(
            items
        ) {

            const cleanCart =
                normaliseCart(
                    items
                );


            /*
                Mainly useful later after
                successful checkout.

                Emptying the cart should use
                clearCart() rather than trusting
                arbitrary browser data.
            */

            if (
                cleanCart.length === 0
            ) {

                return await clearCart();

            }


            if (!currentUser) {

                saveLocalCart(
                    cleanCart
                );


                cartItems =
                    cleanCart;


                refreshCartUI();


                return true;

            }


            const cartId =
                await ensureDatabaseCart();


            if (!cartId) {

                return false;

            }


            const currentProductIds =
                cartItems.map(
                    (item) =>
                        item.id
                );


            const nextProductIds =
                new Set(
                    cleanCart.map(
                        (item) =>
                            item.id
                    )
                );


            /*
                Remove products that no longer
                exist in the replacement cart.
            */

            const removedProductIds =
                currentProductIds.filter(
                    (productId) =>
                        !nextProductIds.has(
                            productId
                        )
                );


            for (
                const productId
                of removedProductIds
            ) {

                const removed =
                    await removeCartItemFromDatabase(
                        productId
                    );


                if (!removed) {

                    return false;

                }

            }


            const rows =
                cleanCart
                    .map(
                        (item) =>
                            cartItemToDatabaseRow(
                                item,
                                cartId
                            )
                    )
                    .filter(Boolean);


            const {
                error
            } =
                await supabase
                    .from("cart_items")
                    .upsert(
                        rows,
                        {
                            onConflict:
                                "cart_id,product_id"
                        }
                    );


            if (error) {

                console.error(
                    "Could not replace customer cart:",
                    error
                );


                /*
                    Reload the database version
                    so our browser state does not
                    pretend the failed operation
                    succeeded.
                */

                cartItems =
                    await loadDatabaseCart();


                refreshCartUI();


                return false;

            }


            cartItems =
                cleanCart;


            refreshCartUI();


            return true;

        }


        // =========================
        // INITIALISE CART
        // =========================

        async function initialiseCart() {

            cartReady =
                false;


            /*
                Signed-in customer.
            */

            if (
                supabase &&
                currentUser
            ) {

                const migrated =
                    await migrateLocalCart();


                if (!migrated) {

                    console.warn(
                        "Guest cart could not be migrated."
                    );

                }


                cartItems =
                    await loadDatabaseCart();

            } else {

                /*
                    Guest visitor or Supabase
                    temporarily unavailable.
                */

                cartItems =
                    getLocalCart();

            }


            cartItems =
                normaliseCart(
                    cartItems
                );


            cartReady =
                true;


            refreshCartUI();

        }


        // =========================
        // GLOBAL CART API
        // =========================

        window.AquaCart = {

            getCart,

            addToCart,

            removeFromCart,

            updateCartQuantity,

            clearCart,

            replaceCart,

            getCurrentUser() {

                return currentUser;

            },

            isReady() {

                return cartReady;

            }

        };
        // =========================
        // LOCAL WISHLIST STORAGE
        // =========================

        function getLocalWishlist() {

            try {

                const saved =
                    localStorage.getItem(
                        WISHLIST_KEY
                    );


                const parsed =
                    saved
                        ? JSON.parse(saved)
                        : [];


                return Array.isArray(
                    parsed
                )
                    ? parsed
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
                JSON.stringify(
                    items
                )
            );

        }


        // =========================
        // WISHLIST DATABASE
        // CONVERSION
        // =========================

        function databaseRowToWishlistItem(
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


        function wishlistItemToDatabaseRow(
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


        // =========================
        // LOAD DATABASE WISHLIST
        // =========================

        async function loadDatabaseWishlist() {

            if (
                !supabase ||
                !currentUser
            ) {

                return [];

            }


            const {
                data,
                error
            } =
                await supabase
                    .from("wishlists")
                    .select(
                        "product_id, " +
                        "product_name, " +
                        "product_price, " +
                        "product_image, " +
                        "product_url, " +
                        "product_available, " +
                        "created_at"
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
                    "Could not load customer wishlist:",
                    error
                );


                return [];

            }


            return (
                data || []
            ).map(
                databaseRowToWishlistItem
            );

        }


        // =========================
        // SAVE DATABASE
        // WISHLIST ITEM
        // =========================

        async function saveWishlistItemToDatabase(
            item
        ) {

            if (
                !supabase ||
                !currentUser
            ) {

                return false;

            }


            const {
                error
            } =
                await supabase
                    .from("wishlists")
                    .upsert(
                        wishlistItemToDatabaseRow(
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


        // =========================
        // REMOVE DATABASE
        // WISHLIST ITEM
        // =========================

        async function removeWishlistItemFromDatabase(
            productId
        ) {

            if (
                !supabase ||
                !currentUser
            ) {

                return false;

            }


            const {
                error
            } =
                await supabase
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
        // GUEST → ACCOUNT
        // WISHLIST
        // =========================

        async function migrateLocalWishlist() {

            if (
                !supabase ||
                !currentUser
            ) {

                return true;

            }


            const localItems =
                getLocalWishlist();


            if (
                localItems.length === 0
            ) {

                return true;

            }


            const validItems =
                localItems.filter(
                    (item) =>
                        item &&
                        item.id &&
                        item.name
                );


            if (
                validItems.length === 0
            ) {

                localStorage.removeItem(
                    WISHLIST_KEY
                );


                return true;

            }


            const rows =
                validItems.map(
                    (item) =>
                        wishlistItemToDatabaseRow(
                            item,
                            currentUser.id
                        )
                );


            const {
                error
            } =
                await supabase
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


                return false;

            }


            /*
                Only erase the guest copy
                after Supabase confirms
                the database save.
            */

            localStorage.removeItem(
                WISHLIST_KEY
            );


            return true;

        }


        // =========================
        // WISHLIST UI
        // =========================

        function getWishlist() {

            return wishlistItems.map(
                (item) => ({
                    ...item
                })
            );

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
        // ADD TO WISHLIST
        // =========================

        async function addToWishlist(
            product
        ) {

            if (
                !product ||
                !product.id ||
                !product.name
            ) {

                console.error(
                    "Invalid wishlist product."
                );


                return false;

            }


            if (
                isWishlisted(
                    product.id
                )
            ) {

                return true;

            }


            const cleanProduct = {

                id:
                    String(
                        product.id
                    ).trim(),

                name:
                    String(
                        product.name
                    ).trim(),

                price:
                    Number(
                        product.price
                        || 0
                    ),

                image:
                    typeof product.image ===
                        "string"
                        ? product.image
                        : "",

                url:
                    typeof product.url ===
                        "string"
                        ? product.url
                        : "",

                available:
                    Boolean(
                        product.available
                    )

            };


            if (
                !cleanProduct.id ||
                !cleanProduct.name
            ) {

                return false;

            }


            if (currentUser) {

                const saved =
                    await saveWishlistItemToDatabase(
                        cleanProduct
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
                            cleanProduct.id
                    )
                ) {

                    localItems.push(
                        cleanProduct
                    );


                    saveLocalWishlist(
                        localItems
                    );

                }

            }


            wishlistItems.push(
                cleanProduct
            );


            refreshWishlistUI();


            return true;

        }


        // =========================
        // REMOVE FROM WISHLIST
        // =========================

        async function removeFromWishlist(
            productId
        ) {

            const cleanId =
                String(
                    productId || ""
                ).trim();


            if (!cleanId) {

                return false;

            }


            if (currentUser) {

                const removed =
                    await removeWishlistItemFromDatabase(
                        cleanId
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
                                cleanId
                        );


                saveLocalWishlist(
                    localItems
                );

            }


            wishlistItems =
                wishlistItems.filter(
                    (item) =>
                        item.id !==
                        cleanId
                );


            refreshWishlistUI();


            return true;

        }


        // =========================
        // TOGGLE WISHLIST
        // =========================

        async function toggleWishlist(
            product
        ) {

            if (
                isWishlisted(
                    product.id
                )
            ) {

                const removed =
                    await removeFromWishlist(
                        product.id
                    );


                return removed
                    ? false
                    : true;

            }


            return await addToWishlist(
                product
            );

        }


        // =========================
        // INITIALISE WISHLIST
        // =========================

        async function initialiseWishlist() {

            wishlistReady =
                false;


            if (
                supabase &&
                currentUser
            ) {

                const migrated =
                    await migrateLocalWishlist();


                if (!migrated) {

                    console.warn(
                        "Guest wishlist could not be migrated."
                    );

                }


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
        // GLOBAL WISHLIST API
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