document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    const calculatorForm = document.getElementById('calculatorForm');
    const methodCards = document.querySelectorAll('.method-card');
    const costDisplay = document.querySelector('.cost-amount');
    const addToCartButton = document.getElementById('addToCart');
    let selectedMethod = null;

    // Base rates for different transport methods (€ per km)
    const baseRates = {
        handTruck: {
            base: 2.5,
            minPrice: 15,
            description: 'Hand Truck - Best for small packages'
        },
        rollCage: {
            base: 3.5,
            minPrice: 25,
            description: 'Roll Cage - Ideal for multiple items'
        },
        pallet: {
            base: 5.0,
            minPrice: 40,
            description: 'Pallet - Perfect for heavy cargo'
        }
    };

    // Time slot multipliers
    const timeSlotMultipliers = {
        '09:00-17:00': {
            rate: 1.0,
            name: 'Standard Delivery'
        },
        '17:00-21:00': {
            rate: 1.2,
            name: 'Express Delivery'
        }
    };

    // Distance zones and their multipliers
    const distanceZones = [
        { maxKm: 10, multiplier: 1.0 },
        { maxKm: 25, multiplier: 0.9 },
        { maxKm: 50, multiplier: 0.8 },
        { maxKm: 100, multiplier: 0.7 }
    ];

    // Handle transport method selection
    methodCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove selected class from all cards
            methodCards.forEach(c => c.classList.remove('selected'));
            // Add selected class to clicked card
            card.classList.add('selected');
            selectedMethod = card.dataset.method;
            
            // Enable calculate button if a method is selected
            if (selectedMethod) {
                addToCartButton.disabled = false;
            }

            // Recalculate cost if all fields are filled
            if (isFormValid()) {
                calculateCost();
            }
        });
    });

    // Calculate distance between two points (mock function)
    function calculateDistance(origin, destination) {
        // Create a deterministic but seemingly random distance based on input strings
        const combinedString = origin.toLowerCase() + destination.toLowerCase();
        const hash = Array.from(combinedString).reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);
        
        // Generate a distance between 5 and 80 km
        return Math.abs(hash % 76) + 5;
    }

    // Get zone multiplier based on distance
    function getZoneMultiplier(distance) {
        const zone = distanceZones.find(zone => distance <= zone.maxKm) || 
                    distanceZones[distanceZones.length - 1];
        return zone.multiplier;
    }

    // Format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('nl-NL', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(amount);
    }

    // Validate form fields
    function isFormValid() {
        const origin = document.getElementById('origin').value;
        const destination = document.getElementById('destination').value;
        const date = document.getElementById('date').value;
        const timeSlot = document.getElementById('timeSlot').value;
        const quantity = document.getElementById('quantity').value;

        return origin && destination && date && timeSlot && quantity && selectedMethod;
    }

    // Calculate cost based on inputs
    function calculateCost() {
        const origin = document.getElementById('origin').value;
        const destination = document.getElementById('destination').value;
        const timeSlot = document.getElementById('timeSlot').value;
        const quantity = parseInt(document.getElementById('quantity').value);

        // Calculate distance
        const distance = calculateDistance(origin, destination);

        // Get base rate and minimum price for selected method
        const { base: baseRate, minPrice } = baseRates[selectedMethod];

        // Calculate zone multiplier
        const zoneMultiplier = getZoneMultiplier(distance);

        // Calculate basic cost
        let cost = distance * baseRate * zoneMultiplier;

        // Apply time slot multiplier
        cost *= timeSlotMultipliers[timeSlot].rate;

        // Apply quantity multiplier (discount for multiple items)
        const quantityMultiplier = quantity > 1 ? Math.pow(0.95, quantity - 1) : 1;
        cost *= quantity * quantityMultiplier;

        // Ensure cost is not below minimum price
        cost = Math.max(cost, minPrice);

        // Update cost display
        costDisplay.textContent = formatCurrency(cost);

        // Enable add to cart button
        addToCartButton.disabled = false;

        // Show calculation breakdown
        showCalculationBreakdown(distance, baseRate, zoneMultiplier, timeSlot, quantity, quantityMultiplier, cost);

        return cost;
    }

    // Show calculation breakdown
    function showCalculationBreakdown(distance, baseRate, zoneMultiplier, timeSlot, quantity, quantityMultiplier, finalCost) {
        const breakdown = `
            Distance: ${distance.toFixed(1)} km
            Base Rate: ${formatCurrency(baseRate)}/km
            Zone Multiplier: ${(zoneMultiplier * 100).toFixed(0)}%
            Time Slot: ${timeSlotMultipliers[timeSlot].name} (${(timeSlotMultipliers[timeSlot].rate * 100).toFixed(0)}%)
            Quantity: ${quantity} (${(quantityMultiplier * 100).toFixed(0)}% per item)
            Final Cost: ${formatCurrency(finalCost)}
        `;
        console.log(breakdown); // For debugging purposes
    }

    // Handle form submission
    calculatorForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!selectedMethod) {
            alert('Please select a transport method');
            return;
        }

        if (!isFormValid()) {
            alert('Please fill in all required fields');
            return;
        }

        calculateCost();
    });

    // Handle add to cart
    addToCartButton.addEventListener('click', function() {
        const cost = calculateCost();
        const origin = document.getElementById('origin').value;
        const destination = document.getElementById('destination').value;
        const date = document.getElementById('date').value;
        const timeSlot = document.getElementById('timeSlot').value;
        
        // Create order summary
        const orderSummary = `
            Order Summary:
            From: ${origin}
            To: ${destination}
            Date: ${date}
            Time: ${timeSlotMultipliers[timeSlot].name}
            Method: ${baseRates[selectedMethod].description}
            Total: ${formatCurrency(cost)}
        `;
        
        // Show order confirmation
        alert('Delivery Booked Successfully!\n\n' + orderSummary);
        
        // Reset form
        calculatorForm.reset();
        methodCards.forEach(card => card.classList.remove('selected'));
        selectedMethod = null;
        addToCartButton.disabled = true;
        costDisplay.textContent = '€0,00';
    });

    // Set minimum date to today
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    // Add input event listeners for real-time calculation
    const inputs = calculatorForm.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (isFormValid()) {
                calculateCost();
            }
        });
    });
});
