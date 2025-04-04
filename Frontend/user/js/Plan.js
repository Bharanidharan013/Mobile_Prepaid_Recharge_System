document.addEventListener("DOMContentLoaded", function () {
    const planList = document.getElementById("planList");
    const priceFilter = document.getElementById("priceFilter");
    const planButtons = document.querySelectorAll(".plan-filter");
    const dataPlanButtons = document.querySelectorAll("#dataPlan button");

    async function fetchPlans() {
        try {
            const response = await fetch("http:/localhost:8083/api/recharge-plans", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
    
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    
            const text = await response.text();
            console.log("Raw API Response:", text);
    
            const jsonStart = text.indexOf("[") !== -1 ? text.indexOf("[") : text.indexOf("{");
            if (jsonStart === -1) throw new Error("No JSON found in response.");
    
            let validJsonString = text.slice(jsonStart).trim();
            let plans = JSON.parse(validJsonString);
    
            plans = plans.map(plan => {
                if (plan.category) {
                    delete plan.category.rechargePlans;
                }
                return plan;
            });
    
            return plans;
        } catch (error) {
            console.error("Error fetching plans:", error);
            planList.innerHTML = "<p class='text-danger'>Error loading plans. Please try again later.</p>";
            return [];
        }
    }
    
    async function renderPlans(filterPrice = null, planType = null, dataFilter = null) {
        planList.innerHTML = "";
        const plans = await fetchPlans();

        if (!plans.length) {
            planList.innerHTML = "<p class='text-muted'>No plans available.</p>";
            return;
        }

        let filteredPlans = plans;

        if (filterPrice) {
            filteredPlans = filteredPlans.filter(plan => plan.price <= parseFloat(filterPrice));
        }

        if (planType) {
            filteredPlans = filteredPlans.filter(plan => 
                plan.description?.toLowerCase().includes(planType.toLowerCase()));
        }

        if (dataFilter) {
            filteredPlans = filteredPlans.filter(plan => 
                plan.dataLimit?.toLowerCase().includes(dataFilter.toLowerCase()));
            }
            
                    filteredPlans.forEach((plan, index) => {
                        const planCard = document.createElement("div");
                        planCard.classList.add("planCard");
                        planCard.innerHTML = `
                            <div class="planDetails"><span>Price: ₹${plan.price}</span></div>
                            <div class="planDetails"><span>Validity: ${plan.validity}</span></div>
                            <div class="planDetails"><span>Data: ${plan.dataLimit}</span></div>
                            <button id="btn-${index}" class="btn" data-plan='${JSON.stringify(plan)}'>Buy</button>
                        `;
                        planList.appendChild(planCard);
                    });
                    
        filteredPlans.forEach((plan, index) => {
            document.getElementById(`btn-${index}`).addEventListener("click", function () {
                const selectedPlan = JSON.parse(this.getAttribute("data-plan"));
                localStorage.setItem("selectedPlan", JSON.stringify(selectedPlan));
                let phNo = localStorage.getItem("phoneNumber");
                if (phNo) {
                    window.location.href = "/user/html/Transaction.html";
                } else {
                    openPopup();
                }
            });
        });
    }
    
    priceFilter.addEventListener("change", function () {
        const selectedPrice = parseInt(this.value) || null;
        const activePlanType = document.querySelector(".plan-filter.active")?.dataset.plan || null;
        const activeDataFilter = document.querySelector("#dataPlan button.active")?.innerText.trim() || null;
        renderPlans(selectedPrice, activePlanType, activeDataFilter);
    });
    
    planButtons.forEach(button => {
        button.addEventListener("click", function () {
            planButtons.forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");
            const selectedPlanType = this.getAttribute("data-plan");
            const selectedPrice = parseInt(priceFilter.value) || null;
            const activeDataFilter = document.querySelector("#dataPlan button.active")?.innerText.trim() || null;
            renderPlans(selectedPrice, selectedPlanType, activeDataFilter);
        });
    });
    
    dataPlanButtons.forEach(button => {
        button.addEventListener("click", function () {
            dataPlanButtons.forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");
            const dataFilter = this.innerText.trim();
            const selectedPrice = parseInt(priceFilter.value) || null;
            const activePlanType = document.querySelector(".plan-filter.active")?.dataset.plan || null;
            renderPlans(selectedPrice, activePlanType, dataFilter);
        });
    });

    function openPopup() {
        const popup = document.getElementById("popup");
        const closePopup = document.getElementById("close-popup");
        const saveButton = document.getElementById("save-button");
        const editPhoneNumber = document.getElementById("edit-phone-number");
        const editError = document.getElementById("editError");

        popup.style.display = "block";
        
        closePopup.addEventListener("click", function () {
            popup.style.display = "none";
        });
        
        saveButton.addEventListener("click", function () {
            const newNumber = editPhoneNumber.value.trim();
            if (/^[6789]\d{9}$/.test(newNumber)) {
                localStorage.setItem("phoneNumber", `+91${newNumber}`);
                popup.style.display = "none";
                window.location.href = "/user/html/Transaction.html";
            } else {
                editError.classList.remove("d-none");
            }
        });
    }
    
    renderPlans();
});