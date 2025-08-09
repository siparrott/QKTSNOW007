// Core calculator utility functions

export function calculatePortraitPricing(formData, customConfig = {}) {
  const pricing = {
    portraitTypes: {
      "individual": 120,
      "couple": 180,
      "family": 250,
      "maternity": 200,
      "business": 150,
      "senior": 180,
      "children": 170,
      "engagement": 200,
      ...customConfig.portraitTypes
    },
    sessionDurations: {
      "30-min": 0,
      "60-min": 80,
      "90-min": 150,
      "2-hour": 200,
      "3-hour": 280,
      "4-hour": 350,
      ...customConfig.sessionDurations
    },
    locations: {
      "studio": 0,
      "outdoor-local": 50,
      "outdoor-travel": 150,
      "client-home": 80,
      "venue": 100,
      ...customConfig.locations
    },
    wardrobeChanges: {
      "1": 0,
      "2": 30,
      "3": 60,
      "4": 90,
      "5+": 120,
      ...customConfig.wardrobeChanges
    },
    addOns: {
      "basic-retouching": 50,
      "advanced-retouching": 120,
      "extra-prints": 80,
      "digital-gallery": 60,
      "rush-delivery": 100,
      "makeup-artist": 150,
      "wardrobe-styling": 100,
      "additional-photographer": 200,
      ...customConfig.addOns
    },
    usageTypes: {
      "personal": 0,
      "commercial": 200,
      "editorial": 150,
      "social-media": 80,
      "website": 100,
      ...customConfig.usageTypes
    },
    discounts: {
      promo: 0.10,
      ...customConfig.discounts
    },
    promoCodes: {
      "PORTRAIT10": 0.10,
      "WELCOME15": 0.15,
      "NEWCLIENT20": 0.20,
      ...customConfig.promoCodes
    }
  };

  // Calculate base prices
  const basePrice = pricing.portraitTypes[formData.portraitType] || 0;
  const durationAdd = pricing.sessionDurations[formData.duration] || 0;
  const locationAdd = pricing.locations[formData.location] || 0;
  const wardrobeAdd = pricing.wardrobeChanges[formData.wardrobeChanges] || 0;
  const usageAdd = pricing.usageTypes[formData.usageType] || 0;

  // Calculate add-ons total
  const addOnsTotal = formData.addOns.reduce((total, addon) => {
    return total + (pricing.addOns[addon] || 0);
  }, 0);

  // Calculate subtotal
  const subtotal = basePrice + durationAdd + locationAdd + wardrobeAdd + usageAdd + addOnsTotal;

  // Apply promo code discount
  let discount = 0;
  if (formData.promoCode && pricing.promoCodes[formData.promoCode]) {
    discount = subtotal * pricing.promoCodes[formData.promoCode];
  }

  const total = Math.max(0, subtotal - discount);

  // Build breakdown array
  const breakdown = [];
  if (basePrice > 0) breakdown.push(`Portrait Type (${formData.portraitType}): ${customConfig.currencySymbol || '€'}${basePrice}`);
  if (durationAdd > 0) breakdown.push(`Duration (${formData.duration}): ${customConfig.currencySymbol || '€'}${durationAdd}`);
  if (locationAdd > 0) breakdown.push(`Location (${formData.location}): ${customConfig.currencySymbol || '€'}${locationAdd}`);
  if (wardrobeAdd > 0) breakdown.push(`Wardrobe Changes (${formData.wardrobeChanges}): ${customConfig.currencySymbol || '€'}${wardrobeAdd}`);
  if (usageAdd > 0) breakdown.push(`Usage Rights (${formData.usageType}): ${customConfig.currencySymbol || '€'}${usageAdd}`);
  
  formData.addOns.forEach(addon => {
    const price = pricing.addOns[addon] || 0;
    if (price > 0) breakdown.push(`${addon}: ${customConfig.currencySymbol || '€'}${price}`);
  });

  if (discount > 0) breakdown.push(`Discount (${formData.promoCode}): -${customConfig.currencySymbol || '€'}${discount.toFixed(2)}`);

  return {
    basePrice,
    durationAdd,
    locationAdd,
    wardrobeAdd,
    portraitTypeAdd: 0,
    addOnsTotal,
    usageAdd,
    subtotal,
    discount,
    total,
    breakdown,
    currency: customConfig.currency || 'EUR',
    currencySymbol: customConfig.currencySymbol || '€'
  };
}

export function validateCalculatorField(field, value, customConfig = {}) {
  if (customConfig?.validation === false) return '';
  
  switch (field) {
    case 'portraitType':
      return !value ? 'Please select a portrait type' : '';
    case 'duration':
      return !value ? 'Please select a session duration' : '';
    case 'location':
      return !value ? 'Please choose a location' : '';
    case 'wardrobeChanges':
      return !value ? 'Please select wardrobe changes' : '';
    case 'usageType':
      return !value ? 'Please select usage type' : '';
    case 'name':
      return !value ? 'Name is required' : '';
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !value ? 'Email is required' : !emailRegex.test(value) ? 'Please enter a valid email' : '';
    case 'phone':
      return !value ? 'Phone number is required' : '';
    default:
      return '';
  }
}

export function formatCurrency(amount, currencySymbol = '€') {
  return `${currencySymbol}${amount}`;
}

export function generateEmbedCode(embedId, domain = 'localhost:5000') {
  return `<iframe src="http://${domain}/embed/${embedId}" width="100%" height="800" frameborder="0"></iframe>`;
}