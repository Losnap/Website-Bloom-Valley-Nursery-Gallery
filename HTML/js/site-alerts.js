const SESSION_CART_KEY = "bloomValleySessionCart";
const LOCAL_REQUESTS_KEY = "bloomValleyClientRequests";
const LOCAL_LATEST_REQUEST_KEY = "bloomValleyLatestRequest";
const LOCAL_CUSTOM_ORDERS_KEY = "bloomValleyCustomOrders";
const LOCAL_LATEST_CUSTOM_ORDER_KEY = "bloomValleyLatestCustomOrder";
const LOCAL_STORAGE_RECORD_LIMIT = 50;

document.addEventListener("DOMContentLoaded", () => {
    updateCartBadges(readCartFromSessionStorage());
    setupSubscribeAlerts();
    setupGalleryCartStorage();
    setupAboutUsFormStorage();
});

function setupSubscribeAlerts() {
    const subscribeButtons = document.querySelectorAll(".js-subscribe-btn");
    subscribeButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            alert("Thank you for subscribing.");
        });
    });
}

function setupGalleryCartStorage() {
    const galleryTable = document.querySelector(".gallery-table");
    if (!galleryTable) {
        return;
    }

    const addToCartButtons = document.querySelectorAll(".js-add-cart");
    const viewCartButton = document.querySelector(".js-view-cart");
    const cartStatus = document.querySelector("#cart-status");
    const cartModal = document.querySelector("#cart-modal");
    const cartModalContent = document.querySelector("#cart-modal-content");
    const cartModalTotal = document.querySelector("#cart-modal-total");
    const closeCartButton = document.querySelector(".js-close-cart");
    const clearCartButton = document.querySelector(".js-clear-cart");
    const processOrderButton = document.querySelector(".js-process-order");

    let cartItems = readCartFromSessionStorage();
    let modalReturnFocusElement = null;

    updateCartStatus(cartStatus, cartItems);
    updateCartBadges(cartItems);

    addToCartButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const row = button.closest("tr");
            const cartItem = extractCatalogItem(row);
            if (!cartItem) {
                return;
            }

            cartItems = addItemToCart(cartItems, cartItem);
            saveCartToSessionStorage(cartItems);
            updateCartStatus(cartStatus, cartItems);
            updateCartBadges(cartItems);
            alert("Item added to the cart.");
        });
    });

    if (viewCartButton && cartModal && cartModalContent && cartModalTotal) {
        viewCartButton.setAttribute("aria-haspopup", "dialog");
        viewCartButton.setAttribute("aria-controls", "cart-modal");

        viewCartButton.addEventListener("click", () => {
            cartItems = readCartFromSessionStorage();
            renderCartModal(cartModalContent, cartModalTotal, cartItems);
            modalReturnFocusElement = document.activeElement;
            openCartModal(cartModal, closeCartButton || cartModal);
        });
    }

    if (closeCartButton && cartModal) {
        closeCartButton.addEventListener("click", () => {
            closeCartModal(cartModal, modalReturnFocusElement);
        });
    }

    if (cartModal) {
        cartModal.addEventListener("click", (event) => {
            if (event.target === cartModal) {
                closeCartModal(cartModal, modalReturnFocusElement);
            }
        });

        document.addEventListener("keydown", (event) => {
            if (cartModal.hasAttribute("hidden")) {
                return;
            }

            if (event.key === "Escape") {
                event.preventDefault();
                closeCartModal(cartModal, modalReturnFocusElement);
                return;
            }

            if (event.key === "Tab") {
                trapFocusInModal(event, cartModal);
            }
        });
    }

    if (clearCartButton) {
        clearCartButton.addEventListener("click", () => {
            cartItems = [];
            clearCartFromSessionStorage();
            updateCartStatus(cartStatus, cartItems);
            updateCartBadges(cartItems);

            if (cartModalContent && cartModalTotal) {
                renderCartModal(cartModalContent, cartModalTotal, cartItems);
            }

            alert("Cart cleared.");
        });
    }

    if (processOrderButton) {
        processOrderButton.addEventListener("click", () => {
            cartItems = [];
            clearCartFromSessionStorage();
            updateCartStatus(cartStatus, cartItems);
            updateCartBadges(cartItems);

            if (cartModalContent && cartModalTotal) {
                renderCartModal(cartModalContent, cartModalTotal, cartItems);
            }

            alert("Thank you for your order.");
            if (cartModal) {
                closeCartModal(cartModal, modalReturnFocusElement);
            }
        });
    }
}

function extractCatalogItem(row) {
    if (!row) {
        return null;
    }

    const cells = row.querySelectorAll("td");
    if (cells.length < 4) {
        return null;
    }

    const name = sanitizeText(cells[0].textContent, 80);
    const description = sanitizeText(cells[2].textContent, 200);
    const priceText = cells[3].textContent.trim();
    const numericPrice = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0;
    const image = row.querySelector("img");
    const imageSrc = image ? image.getAttribute("src") || "" : "";

    return {
        id: createItemId(name),
        name: name,
        description: description,
        price: numericPrice,
        imageSrc: imageSrc
    };
}

function createItemId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function addItemToCart(cartItems, item) {
    const nextCart = Array.isArray(cartItems) ? [...cartItems] : [];
    const existingItem = nextCart.find((entry) => entry.id === item.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        nextCart.push({ ...item, quantity: 1 });
    }

    return nextCart;
}

function readCartFromSessionStorage() {
    try {
        const rawValue = sessionStorage.getItem(SESSION_CART_KEY);
        if (!rawValue) {
            return [];
        }

        const parsed = JSON.parse(rawValue);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Unable to read cart session storage:", error);
        return [];
    }
}

function saveCartToSessionStorage(cartItems) {
    try {
        sessionStorage.setItem(SESSION_CART_KEY, JSON.stringify(cartItems));
    } catch (error) {
        console.error("Unable to save cart session storage:", error);
    }
}

function clearCartFromSessionStorage() {
    try {
        sessionStorage.removeItem(SESSION_CART_KEY);
    } catch (error) {
        console.error("Unable to clear cart session storage:", error);
    }
}

function updateCartStatus(cartStatus, cartItems) {
    if (!cartStatus) {
        return;
    }

    const totalItems = Array.isArray(cartItems)
        ? cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
        : 0;

    cartStatus.textContent =
        totalItems > 0
            ? "Cart items in this session: " + totalItems + "."
            : "Cart is empty.";
}

function updateCartBadges(cartItems) {
    const totalItems = Array.isArray(cartItems)
        ? cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
        : 0;
    const badges = document.querySelectorAll(".js-cart-count");

    badges.forEach((badge) => {
        badge.textContent = String(totalItems);
        badge.classList.toggle("is-empty", totalItems === 0);
        badge.setAttribute("aria-label", "Items in cart: " + totalItems);
        badge.setAttribute("title", "Items in cart: " + totalItems);
    });
}

function renderCartModal(contentContainer, totalContainer, cartItems) {
    contentContainer.innerHTML = "";

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "Your cart is empty.";
        contentContainer.appendChild(emptyMessage);
        totalContainer.textContent = "Total: $0.00";
        return;
    }

    const table = document.createElement("table");
    table.className = "cart-modal-table";

    const caption = document.createElement("caption");
    caption.className = "sr-only";
    caption.textContent = "Items currently saved in your shopping cart.";
    table.appendChild(caption);

    const header = document.createElement("thead");
    header.innerHTML =
        "<tr>" +
        "<th scope=\"col\">Item</th>" +
        "<th scope=\"col\">Description</th>" +
        "<th scope=\"col\">Qty</th>" +
        "<th scope=\"col\">Unit Price</th>" +
        "<th scope=\"col\">Subtotal</th>" +
        "</tr>";

    const body = document.createElement("tbody");
    let total = 0;

    cartItems.forEach((item) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        const row = document.createElement("tr");
        row.innerHTML =
            "<td>" + escapeHtml(item.name) + "</td>" +
            "<td>" + escapeHtml(item.description) + "</td>" +
            "<td>" + item.quantity + "</td>" +
            "<td>" + formatCurrency(item.price) + "</td>" +
            "<td>" + formatCurrency(subtotal) + "</td>";

        body.appendChild(row);
    });

    table.appendChild(header);
    table.appendChild(body);
    contentContainer.appendChild(table);

    totalContainer.textContent = "Total: " + formatCurrency(total);
}

function openCartModal(cartModal, initialFocusElement) {
    cartModal.removeAttribute("hidden");
    document.body.style.overflow = "hidden";

    if (initialFocusElement && typeof initialFocusElement.focus === "function") {
        initialFocusElement.focus();
    }
}

function closeCartModal(cartModal, returnFocusElement) {
    cartModal.setAttribute("hidden", "");
    document.body.style.overflow = "";

    if (returnFocusElement && typeof returnFocusElement.focus === "function") {
        returnFocusElement.focus();
    }
}

function trapFocusInModal(event, cartModal) {
    const focusableSelectors =
        "a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])";
    const focusableElements = Array.from(cartModal.querySelectorAll(focusableSelectors));

    if (focusableElements.length === 0) {
        return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(value || 0);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function setupAboutUsFormStorage() {
    const form = document.querySelector("#feedback-order-form");
    if (!form) {
        return;
    }

    const storageStatus = document.querySelector("#storage-status");
    const clearLocalDataButton = document.querySelector(".js-clear-local-data");

    renderStoredRequestStatus(storageStatus, LOCAL_LATEST_REQUEST_KEY);

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const request = buildFormRequest(form);
        const requestSaved = appendRecordToLocalStorage(LOCAL_REQUESTS_KEY, request);
        const latestRequestSaved = writeRecordToLocalStorage(
            LOCAL_LATEST_REQUEST_KEY,
            request
        );

        let customOrderSaved = true;
        if (request.requestTypeValue === "custom-order") {
            const customOrderListSaved = appendRecordToLocalStorage(
                LOCAL_CUSTOM_ORDERS_KEY,
                request
            );
            const latestCustomOrderSaved = writeRecordToLocalStorage(
                LOCAL_LATEST_CUSTOM_ORDER_KEY,
                request
            );
            customOrderSaved = customOrderListSaved && latestCustomOrderSaved;
        }

        if (storageStatus) {
            if (requestSaved && latestRequestSaved && customOrderSaved) {
                storageStatus.textContent =
                    "Saved " +
                    request.requestTypeText.toLowerCase() +
                    " for " +
                    request.fullName +
                    " on " +
                    request.submittedAt +
                    ".";
            } else {
                storageStatus.textContent =
                    "Message received, but this browser blocked local storage.";
            }
        }

        alert("Thank you for your message.");
        form.reset();
    });

    if (clearLocalDataButton) {
        clearLocalDataButton.addEventListener("click", () => {
            clearLocalFormStorage();
            if (storageStatus) {
                storageStatus.textContent =
                    "Saved form data cleared for this browser.";
            }
        });
    }
}

function buildFormRequest(form) {
    const fullName = sanitizeText(form.querySelector("#full-name")?.value, 80);
    const email = sanitizeText(form.querySelector("#email")?.value, 120).toLowerCase();
    const phone = sanitizeText(form.querySelector("#phone")?.value, 20);

    const requestTypeField = form.querySelector("#request-type");
    const requestTypeValue = sanitizeRequestType(requestTypeField?.value || "feedback");
    const requestTypeText =
        requestTypeValue === "custom-order"
            ? "Custom Order Request"
            : "Client Feedback";

    const itemInterest = sanitizeText(
        form.querySelector("#item-interest")?.value,
        120
    );
    const message = sanitizeText(form.querySelector("#message")?.value, 1000);

    return {
        id: Date.now(),
        fullName: fullName,
        email: email,
        phone: phone,
        requestTypeValue: requestTypeValue,
        requestTypeText: requestTypeText,
        itemInterest: itemInterest,
        message: message,
        submittedAt: new Date().toLocaleString()
    };
}

function sanitizeRequestType(value) {
    const allowedValues = ["feedback", "custom-order"];
    return allowedValues.includes(value) ? value : "feedback";
}

function sanitizeText(value, maxLength) {
    const normalizedValue = String(value || "")
        .replace(/[<>]/g, "")
        .replace(/[\u0000-\u001F\u007F]/g, " ")
        .trim();

    if (!maxLength || maxLength < 1) {
        return normalizedValue;
    }

    return normalizedValue.slice(0, maxLength);
}

function appendRecordToLocalStorage(storageKey, record) {
    try {
        const existingValue = localStorage.getItem(storageKey);
        const existingRecords = existingValue ? JSON.parse(existingValue) : [];
        const recordList = Array.isArray(existingRecords) ? existingRecords : [];

        recordList.push(record);

        if (recordList.length > LOCAL_STORAGE_RECORD_LIMIT) {
            recordList.splice(0, recordList.length - LOCAL_STORAGE_RECORD_LIMIT);
        }

        localStorage.setItem(storageKey, JSON.stringify(recordList));
        return true;
    } catch (error) {
        console.error("Unable to append local storage record:", error);
        return false;
    }
}

function writeRecordToLocalStorage(storageKey, record) {
    try {
        localStorage.setItem(storageKey, JSON.stringify(record));
        return true;
    } catch (error) {
        console.error("Unable to write local storage record:", error);
        return false;
    }
}

function clearLocalFormStorage() {
    const localKeys = [
        LOCAL_REQUESTS_KEY,
        LOCAL_LATEST_REQUEST_KEY,
        LOCAL_CUSTOM_ORDERS_KEY,
        LOCAL_LATEST_CUSTOM_ORDER_KEY
    ];

    localKeys.forEach((key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error("Unable to remove local storage key:", key, error);
        }
    });
}

function renderStoredRequestStatus(storageStatus, latestKey) {
    if (!storageStatus) {
        return;
    }

    try {
        const latestValue = localStorage.getItem(latestKey);
        if (!latestValue) {
            return;
        }

        const latestRequest = JSON.parse(latestValue);
        if (!latestRequest || !latestRequest.fullName || !latestRequest.submittedAt) {
            return;
        }

        storageStatus.textContent =
            "Last saved request: " +
            latestRequest.requestTypeText +
            " for " +
            latestRequest.fullName +
            " on " +
            latestRequest.submittedAt +
            ".";
    } catch (error) {
        console.error("Unable to read saved form request from local storage:", error);
    }
}
