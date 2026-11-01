(function () {
    "use strict";

    /* ---------- Settings (change these in one place) ---------- */
    var CART_KEY = "hamorena_cart";
    var DELIVERY_FEE = 99;          // placeholder courier fee in Rands
    var VAT_RATE = 0.15;            // South African VAT (prices are VAT-inclusive)

    /* ---------- Small helpers ---------- */
    function $(selector, root) { return (root || document).querySelector(selector); }
    function $all(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }

    function formatRand(amount) {
        return "R" + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function parseRand(text) {
        return parseFloat(String(text).replace(/[^0-9.]/g, "")) || 0;
    }

    function escapeHTML(str) {
        var div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    /* ---------- Cart storage ---------- */
    function loadCart() {
        try {
            var data = JSON.parse(localStorage.getItem(CART_KEY));
            return Array.isArray(data) ? data : [];
        } catch (e) {
            return [];
        }
    }

    function saveCart(cart) {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
        } catch (e) { /* storage unavailable - cart just won't persist */ }
        updateCartBadge();
    }

    function cartCount(cart) {
        return cart.reduce(function (sum, item) { return sum + item.quantity; }, 0);
    }

    function cartSubtotal(cart) {
        return cart.reduce(function (sum, item) { return sum + item.price * item.quantity; }, 0);
    }

    function updateCartBadge() {
        var count = cartCount(loadCart());
        $all('a[href="cart.html"]').forEach(function (link) {
            var badge = $(".cart-badge", link);
            if (!badge) {
                badge = document.createElement("span");
                badge.className = "cart-badge";
                link.appendChild(badge);
            }
            badge.textContent = count;
            badge.hidden = count === 0;
        });
    }

    /* ---------- Toast message ---------- */
    function showToast(message) {
        var toast = $("#toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "toast";
            toast.setAttribute("role", "status");
            toast.setAttribute("aria-live", "polite");
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(function () { toast.classList.remove("show"); }, 2600);
    }

    /* ---------- Form validation helpers ---------- */
    function showError(field, message) {
        clearError(field);
        field.classList.add("invalid");
        field.setAttribute("aria-invalid", "true");
        var msg = document.createElement("span");
        msg.className = "error-message";
        msg.textContent = message;
        msg.id = (field.id || field.name) + "-error";
        field.setAttribute("aria-describedby", msg.id);
        field.parentNode.appendChild(msg);
    }

    function clearError(field) {
        field.classList.remove("invalid");
        field.removeAttribute("aria-invalid");
        field.removeAttribute("aria-describedby");
        var existing = $(".error-message", field.parentNode);
        if (existing) { existing.parentNode.removeChild(existing); }
    }

    function isEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    }

    // South African numbers: 0XX XXX XXXX or +27 XX XXX XXXX (spaces, dashes allowed)
    function isSAPhone(value) {
        var digits = value.replace(/[\s\-()]/g, "");
        return /^(0\d{9}|\+27\d{9}|27\d{9})$/.test(digits);
    }

    /* rules: array of { field, check(value) -> error string or "" } */
    function runValidation(rules) {
        var firstBad = null;
        rules.forEach(function (rule) {
            var value = rule.field.value.trim();
            var error = rule.check(value);
            if (error) {
                showError(rule.field, error);
                if (!firstBad) { firstBad = rule.field; }
            } else {
                clearError(rule.field);
            }
        });
        if (firstBad) { firstBad.focus(); }
        return !firstBad;
    }

    function liveClear(form) {
        $all("input, select, textarea", form).forEach(function (field) {
            field.addEventListener("input", function () { clearError(field); });
            field.addEventListener("change", function () { clearError(field); });
        });
    }

    function required(message) {
        return function (v) { return v ? "" : message; };
    }

    function showFormSuccess(form, message) {
        var box = document.createElement("div");
        box.className = "form-success";
        box.setAttribute("role", "status");
        box.innerHTML = message;
        form.parentNode.insertBefore(box, form);
        form.hidden = true;
        box.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    /* ======================================================================
       PRODUCT PAGES: gallery swap + Add to Cart
       ====================================================================== */
    function initProductPage() {
        var detail = $("#product-detail");
        if (!detail) { return; }

        var nameEl = $("#product-info h2");
        var priceEl = $("#product-price");
        var gallery = $("#product-gallery");
        var form = $("#product-info form");
        if (!nameEl || !priceEl || !gallery || !form) { return; }

        /* --- Gallery: clicking a thumbnail makes it the main image --- */
        var thumbs = $all("img", gallery);
        if (thumbs.length > 1) {
            var main = document.createElement("img");
            main.id = "gallery-main";
            main.src = thumbs[0].src;
            main.alt = thumbs[0].alt;
            gallery.insertBefore(main, gallery.firstChild);

            var strip = document.createElement("div");
            strip.className = "gallery-strip";
            thumbs.forEach(function (thumb, i) {
                thumb.tabIndex = 0;
                thumb.setAttribute("role", "button");
                if (i === 0) { thumb.classList.add("active"); }
                strip.appendChild(thumb);
                var activate = function () {
                    main.src = thumb.src;
                    main.alt = thumb.alt;
                    $all("img", strip).forEach(function (t) { t.classList.remove("active"); });
                    thumb.classList.add("active");
                };
                thumb.addEventListener("click", activate);
                thumb.addEventListener("keydown", function (e) {
                    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
                });
            });
            gallery.appendChild(strip);
        }

        /* --- Add to Cart --- */
        var sizeEl = $("#size", form);
        var colourEl = $("#colour", form);
        var qtyEl = $("#quantity", form);
        var firstImageSrc = thumbs[0].getAttribute("src");
        var productId = location.pathname.split("/").pop().replace(".html", "") || "product";

        liveClear(form);

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            var ok = runValidation([
                { field: sizeEl, check: required("Please choose a size.") },
                { field: colourEl, check: required("Please choose a colour.") },
                {
                    field: qtyEl,
                    check: function (v) {
                        var n = Number(v);
                        if (!v) { return "Please enter a quantity."; }
                        if (!Number.isInteger(n) || n < 1) { return "Quantity must be a whole number of 1 or more."; }
                        if (n > 10) { return "For orders of more than 10, please send us an enquiry."; }
                        return "";
                    }
                }
            ]);
            if (!ok) { return; }

            var quantity = parseInt(qtyEl.value, 10);
            var cart = loadCart();
            var existing = cart.filter(function (item) {
                return item.id === productId && item.size === sizeEl.value && item.colour === colourEl.value;
            })[0];

            if (existing) {
                existing.quantity = Math.min(existing.quantity + quantity, 10);
            } else {
                cart.push({
                    id: productId,
                    name: nameEl.textContent.trim(),
                    price: parseRand(priceEl.textContent),
                    image: firstImageSrc,
                    size: sizeEl.value,
                    colour: colourEl.value,
                    quantity: quantity
                });
            }
            saveCart(cart);
            showToast(nameEl.textContent.trim() + " added to cart");
        });
    }

    /* ======================================================================
       CART PAGE
       ====================================================================== */
    function initCartPage() {
        var container = $("#cart-contents");
        if (!container) { return; }

        function render() {
            var cart = loadCart();

            if (cart.length === 0) {
                container.innerHTML =
                    '<p class="empty-cart">Your cart is empty.</p>' +
                    '<a href="services.html" class="cta-button">Continue Shopping</a>';
                return;
            }

            var rows = cart.map(function (item, i) {
                return '<tr>' +
                    '<td data-label="Product"><div class="cart-product">' +
                        '<img src="' + escapeHTML(item.image) + '" alt="' + escapeHTML(item.name) + '">' +
                        '<div><strong>' + escapeHTML(item.name) + '</strong><br>' +
                        '<small>' + escapeHTML(item.size) + ' &middot; ' + escapeHTML(item.colour) + '</small></div>' +
                    '</div></td>' +
                    '<td data-label="Price">' + formatRand(item.price) + '</td>' +
                    '<td data-label="Quantity">' +
                        '<input type="number" class="cart-qty" min="1" max="10" value="' + item.quantity + '" data-index="' + i + '" aria-label="Quantity for ' + escapeHTML(item.name) + '">' +
                    '</td>' +
                    '<td data-label="Total">' + formatRand(item.price * item.quantity) + '</td>' +
                    '<td><button type="button" class="remove-item" data-index="' + i + '" aria-label="Remove ' + escapeHTML(item.name) + '">Remove</button></td>' +
                '</tr>';
            }).join("");

            var subtotal = cartSubtotal(cart);
            var vat = subtotal - subtotal / (1 + VAT_RATE);

            container.innerHTML =
                '<div class="table-wrap"><table class="cart-table">' +
                    '<thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Total</th><th></th></tr></thead>' +
                    '<tbody>' + rows + '</tbody>' +
                '</table></div>' +
                '<div class="cart-summary">' +
                    '<p>Subtotal: <strong>' + formatRand(subtotal) + '</strong></p>' +
                    '<p class="vat-note">Includes VAT of ' + formatRand(vat) + '. Delivery is calculated at checkout.</p>' +
                    '<a href="checkout.html" class="cta-button">Proceed to Checkout</a>' +
                    '<button type="button" id="clear-cart" class="link-button">Clear cart</button>' +
                '</div>';
        }

        container.addEventListener("change", function (e) {
            if (!e.target.classList.contains("cart-qty")) { return; }
            var cart = loadCart();
            var index = parseInt(e.target.getAttribute("data-index"), 10);
            var qty = parseInt(e.target.value, 10);
            if (!cart[index]) { return; }
            if (!qty || qty < 1) { qty = 1; }
            if (qty > 10) { qty = 10; showToast("Maximum of 10 per item. Send an enquiry for larger orders."); }
            cart[index].quantity = qty;
            saveCart(cart);
            render();
        });

        container.addEventListener("click", function (e) {
            var cart;
            if (e.target.classList.contains("remove-item")) {
                cart = loadCart();
                cart.splice(parseInt(e.target.getAttribute("data-index"), 10), 1);
                saveCart(cart);
                render();
                showToast("Item removed");
            } else if (e.target.id === "clear-cart") {
                if (window.confirm("Remove everything from your cart?")) {
                    saveCart([]);
                    render();
                }
            }
        });

        render();
    }

    /* ======================================================================
       CHECKOUT PAGE
       ====================================================================== */
    function initCheckoutPage() {
        var form = $("#checkout-form");
        if (!form) { return; }

        var cart = loadCart();
        var summary = $("#order-summary");
        var deliveryRadios = $all('input[name="delivery"]', form);
        var addressBlock = $("#address-block");
        var collectBlock = $("#collect-block");
        var payRadios = $all('input[name="payment"]', form);
        var cardBlock = $("#card-block");

        if (cart.length === 0) {
            form.hidden = true;
            summary.innerHTML = '<p class="empty-cart">Your cart is empty, so there is nothing to check out.</p>' +
                '<a href="services.html" class="cta-button">Go to the Shop</a>';
            return;
        }

        function selectedValue(radios) {
            var picked = radios.filter(function (r) { return r.checked; })[0];
            return picked ? picked.value : "";
        }

        function renderSummary() {
            var subtotal = cartSubtotal(cart);
            var delivery = selectedValue(deliveryRadios) === "courier" ? DELIVERY_FEE : 0;
            var total = subtotal + delivery;

            var lines = cart.map(function (item) {
                return '<li><span>' + escapeHTML(item.name) + ' (' + escapeHTML(item.size) + ', ' + escapeHTML(item.colour) + ') &times; ' + item.quantity + '</span>' +
                       '<span>' + formatRand(item.price * item.quantity) + '</span></li>';
            }).join("");

            summary.innerHTML =
                '<ul class="summary-lines">' + lines + '</ul>' +
                '<p class="summary-row"><span>Subtotal</span><span>' + formatRand(subtotal) + '</span></p>' +
                '<p class="summary-row"><span>Delivery</span><span>' + (delivery ? formatRand(delivery) : "Free (collect in-store)") + '</span></p>' +
                '<p class="summary-row summary-total"><span>Total (incl. VAT)</span><span>' + formatRand(total) + '</span></p>';
        }

        function toggleBlocks() {
            var isCourier = selectedValue(deliveryRadios) === "courier";
            collectBlock.hidden = isCourier;
            $all("select", collectBlock).forEach(function (f) { f.disabled = isCourier; clearError(f); });
            addressBlock.hidden = !isCourier;
            $all("input, select", addressBlock).forEach(function (f) { f.disabled = !isCourier; clearError(f); });

            var isCard = selectedValue(payRadios) === "card";
            cardBlock.hidden = !isCard;
            $all("input", cardBlock).forEach(function (f) { f.disabled = !isCard; clearError(f); });

            renderSummary();
        }

        deliveryRadios.concat(payRadios).forEach(function (r) { r.addEventListener("change", toggleBlocks); });
        liveClear(form);
        toggleBlocks();

        // Format card number as groups of 4 while typing
        var cardNumber = $("#card-number", form);
        cardNumber.addEventListener("input", function () {
            var digits = cardNumber.value.replace(/\D/g, "").slice(0, 16);
            cardNumber.value = digits.replace(/(.{4})/g, "$1 ").trim();
        });

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var rules = [
                { field: $("#co-name", form), check: function (v) { return v.length < 2 ? "Please enter your full name." : ""; } },
                { field: $("#co-email", form), check: function (v) { return !v ? "Email is required." : (isEmail(v) ? "" : "Please enter a valid email address."); } },
                { field: $("#co-phone", form), check: function (v) { return !v ? "Phone number is required." : (isSAPhone(v) ? "" : "Enter a valid SA number, e.g. 082 555 0111."); } }
            ];

            if (selectedValue(deliveryRadios) === "courier") {
                rules.push(
                    { field: $("#co-street", form), check: required("Street address is required.") },
                    { field: $("#co-city", form), check: required("City is required.") },
                    { field: $("#co-postal", form), check: function (v) { return /^\d{4}$/.test(v) ? "" : "Postal code must be 4 digits."; } }
                );
            } else {
                rules.push({ field: $("#co-store", form), check: required("Please choose a store.") });
            }

            if (selectedValue(payRadios) === "card") {
                rules.push(
                    { field: cardNumber, check: function (v) { return v.replace(/\s/g, "").length === 16 ? "" : "Card number must be 16 digits."; } },
                    {
                        field: $("#card-expiry", form),
                        check: function (v) {
                            var m = /^(0[1-9]|1[0-2])\s*\/\s*(\d{2})$/.exec(v);
                            if (!m) { return "Use the format MM/YY."; }
                            var now = new Date();
                            var year = 2000 + parseInt(m[2], 10);
                            var month = parseInt(m[1], 10);
                            return (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) ? "This card has expired." : "";
                        }
                    },
                    { field: $("#card-cvv", form), check: function (v) { return /^\d{3,4}$/.test(v) ? "" : "CVV must be 3 or 4 digits."; } }
                );
            }

            if (!runValidation(rules)) { return; }

            var subtotal = cartSubtotal(cart);
            var delivery = selectedValue(deliveryRadios) === "courier" ? DELIVERY_FEE : 0;
            var orderNumber = "HM-" + Date.now().toString().slice(-6);
            var name = $("#co-name", form).value.trim().split(" ")[0];

            showFormSuccess(form,
                '<h3>Thank you, ' + escapeHTML(name) + '!</h3>' +
                '<p>Your order <strong>' + orderNumber + '</strong> has been received. ' +
                'Total: <strong>' + formatRand(subtotal + delivery) + '</strong>.</p>' +
                '<p>A confirmation will be sent to ' + escapeHTML($("#co-email", form).value.trim()) + '.</p>' +
                '<p class="vat-note">Demo checkout: no payment has been taken.</p>' +
                '<a href="index.html" class="cta-button">Back to Home</a>');
            summary.hidden = true;
            saveCart([]);
        });
    }

    /* ======================================================================
       ENQUIRY FORM
       ====================================================================== */
    function initEnquiryForm() {
        var form = $("#enquiry-form form");
        if (!form) { return; }

        var typeEl = $("#enquiry-type", form);

        // Extra fields shown only for "Reserve to Try In-Store"
        var extra = document.createElement("div");
        extra.id = "reserve-fields";
        extra.hidden = true;
        extra.innerHTML =
            '<div><label for="store">Preferred Store</label>' +
            '<select id="store" name="store" disabled>' +
                '<option value="">-- Choose a store --</option>' +
                '<option>Sandton City, Johannesburg</option>' +
                '<option>V&amp;A Waterfront, Cape Town</option>' +
                '<option>Gateway, Umhlanga, Durban</option>' +
            '</select></div>' +
            '<div><label for="visit-date">Preferred Visit Date</label>' +
            '<input type="date" id="visit-date" name="visit-date" disabled></div>';
        typeEl.parentNode.parentNode.insertBefore(extra, typeEl.parentNode.nextSibling);

        var storeEl = $("#store", form);
        var dateEl = $("#visit-date", form);

        // Date can't be in the past
        var today = new Date();
        dateEl.min = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");

        function toggleReserve() {
            var isReserve = typeEl.value === "reserve";
            extra.hidden = !isReserve;
            storeEl.disabled = !isReserve;
            dateEl.disabled = !isReserve;
            if (!isReserve) { clearError(storeEl); clearError(dateEl); }
        }
        typeEl.addEventListener("change", toggleReserve);

        // Arriving from a watch page: ?type=reserve&product=Gold-Tone Dress Watch
        var params = new URLSearchParams(location.search);
        if (params.get("type") === "reserve") { typeEl.value = "reserve"; }
        if (params.get("product")) {
            var msg = $("#message", form);
            if (!msg.value) { msg.value = "I would like to try on the " + params.get("product") + "."; }
        }
        toggleReserve();
        liveClear(form);

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var rules = [
                { field: $("#full-name", form), check: function (v) { return v.length < 2 ? "Please enter your full name." : ""; } },
                { field: $("#email", form), check: function (v) { return !v ? "Email is required." : (isEmail(v) ? "" : "Please enter a valid email address."); } },
                { field: $("#phone", form), check: function (v) { return !v || isSAPhone(v) ? "" : "Enter a valid SA number, e.g. 082 555 0111."; } },
                { field: $("#message", form), check: function (v) { return v.length < 10 ? "Please write at least 10 characters so we can help." : ""; } }
            ];
            if (typeEl.value === "reserve") {
                rules.splice(3, 0,
                    { field: storeEl, check: required("Please choose a store.") },
                    {
                        field: dateEl,
                        check: function (v) {
                            if (!v) { return "Please choose a visit date."; }
                            return v < dateEl.min ? "Visit date can't be in the past." : "";
                        }
                    }
                );
            }
            if (!runValidation(rules)) { return; }

            var name = $("#full-name", form).value.trim().split(" ")[0];
            showFormSuccess(form,
                '<h3>Thanks, ' + escapeHTML(name) + '!</h3>' +
                '<p>Your enquiry has been sent. Our team will get back to you shortly.</p>');
        });
    }

    /* ======================================================================
       CONTACT FORM
       ====================================================================== */
    function initContactForm() {
        var form = $("#contact-message-form");
        if (!form) { return; }
        liveClear(form);

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var ok = runValidation([
                { field: $("#contact-name", form), check: function (v) { return v.length < 2 ? "Please enter your name." : ""; } },
                { field: $("#contact-email", form), check: function (v) { return !v ? "Email is required." : (isEmail(v) ? "" : "Please enter a valid email address."); } },
                { field: $("#contact-subject", form), check: required("Please enter a subject.") },
                { field: $("#contact-text", form), check: function (v) { return v.length < 10 ? "Please write at least 10 characters." : ""; } }
            ]);
            if (!ok) { return; }
            var name = $("#contact-name", form).value.trim().split(" ")[0];
            showFormSuccess(form, '<h3>Thanks, ' + escapeHTML(name) + '!</h3><p>Your message has been sent. We\'ll reply as soon as we can.</p>');
        });
    }

    /* ---------- Start everything once the page is ready ---------- */
    document.addEventListener("DOMContentLoaded", function () {
        updateCartBadge();
        initProductPage();
        initCartPage();
        initCheckoutPage();
        initEnquiryForm();
        initContactForm();
    });
})();