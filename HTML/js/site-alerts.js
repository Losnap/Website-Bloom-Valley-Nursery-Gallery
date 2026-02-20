document.addEventListener("DOMContentLoaded", () => {
    setupSubscribeAlerts();
    setupGalleryAlerts();
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

function setupGalleryAlerts() {
    const addToCartButtons = document.querySelectorAll(".js-add-cart");
    addToCartButtons.forEach((button) => {
        button.addEventListener("click", () => {
            alert("Item added to the cart.");
        });
    });

    const clearCartButton = document.querySelector(".js-clear-cart");
    if (clearCartButton) {
        clearCartButton.addEventListener("click", () => {
            alert("Cart cleared.");
        });
    }

    const processOrderButton = document.querySelector(".js-process-order");
    if (processOrderButton) {
        processOrderButton.addEventListener("click", () => {
            alert("Thank you for your order.");
        });
    }
}

function setupAboutUsFormStorage() {
    const form = document.querySelector("#feedback-order-form");
    if (!form) {
        return;
    }

    const storageStatus = document.querySelector("#storage-status");
    const requestStorageKey = "bloomValleyClientRequests";
    const latestRequestStorageKey = "bloomValleyLatestRequest";

    renderStoredRequestStatus(storageStatus, latestRequestStorageKey);

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const request = buildFormRequest(form);
        const saved = saveRequestToLocalStorage(
            requestStorageKey,
            latestRequestStorageKey,
            request
        );

        if (storageStatus) {
            if (saved) {
                storageStatus.textContent =
                    "Saved request for " +
                    request.fullName +
                    " on " +
                    request.submittedAt +
                    ".";
            } else {
                storageStatus.textContent =
                    "Message received, but this browser blocked web storage.";
            }
        }

        alert("Thank you for your message.");
        form.reset();
    });
}

function buildFormRequest(form) {
    const fullName = (form.querySelector("#full-name")?.value || "").trim();
    const email = (form.querySelector("#email")?.value || "").trim();
    const phone = (form.querySelector("#phone")?.value || "").trim();
    const requestTypeField = form.querySelector("#request-type");
    const requestTypeValue = requestTypeField?.value || "";
    const requestTypeText =
        requestTypeField?.options[requestTypeField.selectedIndex]?.text ||
        "Request";
    const itemInterest = (form.querySelector("#item-interest")?.value || "").trim();
    const message = (form.querySelector("#message")?.value || "").trim();

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

function saveRequestToLocalStorage(listKey, latestKey, request) {
    try {
        const existingValue = localStorage.getItem(listKey);
        const existingRequests = existingValue ? JSON.parse(existingValue) : [];
        const requestList = Array.isArray(existingRequests) ? existingRequests : [];

        requestList.push(request);

        localStorage.setItem(listKey, JSON.stringify(requestList));
        localStorage.setItem(latestKey, JSON.stringify(request));
        return true;
    } catch (error) {
        console.error("Unable to save form request to web storage:", error);
        return false;
    }
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
        console.error("Unable to read saved form request from web storage:", error);
    }
}
