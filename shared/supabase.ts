// Legacy Supabase module removed.
// This file now only exists so existing imports don't crash the build. All exported
// symbols are minimal no-op placeholders. Remove remaining imports and then delete this file.

export const supabase = null as any;
export const sql = { disabled: true } as any;

export function legacyNotice() {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[legacy] shared/supabase.ts accessed – migrate to new storage layer.');
  }
}

// Placeholder async fns returning safe defaults
export async function getCalculatorTemplates() { legacyNotice(); return []; }
export async function getCalculatorTemplate(_slug: string) { legacyNotice(); return null; }
export async function cloneCalculator() { legacyNotice(); return null; }
export async function getUserCalculators() { legacyNotice(); return []; }
export async function getUserCalculator() { legacyNotice(); return null; }
export async function updateUserCalculator() { legacyNotice(); return true; }
export async function deleteUserCalculator() { legacyNotice(); return true; }
export async function getUserAnalytics() { legacyNotice(); return { totalVisits:0,totalConversions:0,conversionRate:0,totalQuotes:0,chartData:[],calculatorPerformance:[] }; }
export async function getUserQuotes() { legacyNotice(); return []; }