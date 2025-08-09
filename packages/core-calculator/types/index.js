// Core calculator types and interfaces
export const PortraitFormDataSchema = {
  portraitType: '',
  duration: '',
  location: '',
  wardrobeChanges: '',
  addOns: [],
  usageType: '',
  promoCode: '',
  naturalLanguageInput: '',
  contactInfo: {
    name: '',
    email: '',
    phone: ''
  }
};

export const PricingBreakdownSchema = {
  basePrice: 0,
  durationAdd: 0,
  locationAdd: 0,
  wardrobeAdd: 0,
  portraitTypeAdd: 0,
  addOnsTotal: 0,
  usageAdd: 0,
  subtotal: 0,
  discount: 0,
  total: 0,
  breakdown: [],
  currency: 'EUR',
  currencySymbol: '€'
};