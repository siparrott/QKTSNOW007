import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';

// For server-side operations, use direct PostgreSQL connection
const sql = postgres(process.env.DATABASE_URL!);

// Initialize Supabase client for browser operations
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Authentication functions
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`
    }
  });
  return { user: data.user, error };
}

export async function loginWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { user: data.user, session: data.session, error };
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}

// Database types for calculator templates
export interface CalculatorTemplate {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  layout_json: any;
  logic_json: any;
  style_json: any;
  prompt_md: string;
  created_at: string;
}

// Database types for user calculators (cloned instances)
export interface UserCalculator {
  id: string;
  user_id: string;
  template_id: string;
  slug: string;
  name: string;
  layout_json: any;
  logic_json: any;
  style_json: any;
  prompt_md: string;
  logo_url?: string;
  is_active: boolean;
  embed_url: string;
  config?: any;
  created_at: string;
  updated_at: string;
}

// Get all calculator templates
export async function getCalculatorTemplates(): Promise<CalculatorTemplate[]> {
  try {
    const data = await sql`
      SELECT * FROM calculator_templates 
      ORDER BY created_at DESC
    `;
    return data as any[];
  } catch (error) {
    console.error('Error fetching calculator templates:', error);
    return [];
  }
}

// Get specific calculator template by slug
export async function getCalculatorTemplate(slug: string): Promise<CalculatorTemplate | null> {
  try {
    const data = await sql`
      SELECT * FROM calculator_templates 
      WHERE slug = ${slug}
      LIMIT 1
    `;
    return data.length ? data[0] as any : null;
  } catch (error) {
    console.error('Error fetching calculator template:', error);
    return null;
  }
}

// Helper function to generate UUID for temporary users
function generateUuidForTempUser(tempUserId: string): string {
  // Create a consistent UUID based on the temp user ID using simple hash
  let hash = 0;
  for (let i = 0; i < tempUserId.length; i++) {
    const char = tempUserId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to positive number and pad with zeros
  const hashStr = Math.abs(hash).toString(16).padStart(8, '0');
  // Use deterministic suffix based on the hash instead of random
  const deterministicSuffix = Math.abs(hash * 31).toString(16).padStart(8, '0');
  
  // Format as UUID v4
  return [
    hashStr.substring(0, 8),
    hashStr.substring(0, 4),
    '4' + hashStr.substring(1, 4),
    '8' + deterministicSuffix.substring(0, 3),
    deterministicSuffix + hashStr.substring(4, 8)
  ].join('-');
}

// Clone a calculator template for a user
export async function cloneCalculator(userId: string, templateId: string): Promise<UserCalculator | null> {
  try {
    // Map numeric IDs to template slugs for backward compatibility
    const templateSlugMap: { [key: string]: string } = {
      '1': 'wedding-photography',
      '2': 'boudoir-photography', 
      '3': 'real-estate-photography',
      '4': 'drone-photography',
      '5': 'event-videography',
      '6': 'electrician-services',
      '7': 'home-renovation',
      '8': 'plumbing-services'
    };

    const templateSlug = templateSlugMap[templateId] || templateId;

    // Get the template by slug instead of ID to handle numeric templateIds
    const templates = await sql`
      SELECT * FROM calculator_templates 
      WHERE slug = ${templateSlug}
      LIMIT 1
    `;

    if (!templates.length) {
      console.error('Template not found:', templateSlug);
      return null;
    }

    const template = templates[0];

    // Handle UUID conversion for temporary users
    let actualUserId = userId;
    if (userId.startsWith('temp_')) {
      actualUserId = generateUuidForTempUser(userId);
    }

    // Generate unique slug for user calculator
    const uniqueSlug = `${template.slug}-${userId.slice(0, 8)}-${Date.now()}`;
    // Point to the actual calculator pages that exist on the homepage
    const baseUrl = process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://7c3afad0-e42a-4035-89da-60d967bcf12e-00-cahqkruxgnqx.spock.replit.dev';
    const embedUrl = `${baseUrl}/${template.slug}-calculator`;
    const adminUrl = `${baseUrl}/${template.slug}-calculator`;
    const embedId = `embed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate calculator_id based on template mapping (only using valid IDs 1-3)
    const calculatorIdMap: { [key: string]: number } = {
      'wedding-photography': 1,
      'boudoir-photography': 2,
      'real-estate-photography': 3,
      'drone-photography': 1,
      'event-videography': 2,
      'electrician-services': 3,
      'home-renovation': 2,
      'plumbing-services': 3
    };
    const calculatorId = calculatorIdMap[template.slug] || 1;

    // Create user calculator clone
    const userCalculators = await sql`
      INSERT INTO user_calculators (
        user_id, template_id, calculator_id, embed_id, slug, name, 
        layout_json, logic_json, style_json, prompt_md, is_active, 
        embed_url, admin_url
      ) VALUES (
        ${actualUserId}, ${template.id}, ${calculatorId}, ${embedId}, 
        ${uniqueSlug}, ${template.name}, ${template.layout_json}, 
        ${template.logic_json}, ${template.style_json}, ${template.prompt_md}, 
        true, ${embedUrl}, ${adminUrl}
      ) RETURNING *
    `;

    if (!userCalculators.length) {
      console.error('Error cloning calculator');
      return null;
    }

    return userCalculators[0] as any;
  } catch (error) {
    console.error('Error in cloneCalculator:', error);
    return null;
  }
}

// Get user's calculators
export async function getUserCalculators(userId: string): Promise<UserCalculator[]> {
  try {
    // Handle UUID conversion for temporary users
    let actualUserId = userId;
    if (userId.startsWith('temp_')) {
      actualUserId = generateUuidForTempUser(userId);
    }

    const data = await sql`
      SELECT * FROM user_calculators 
      WHERE user_id = ${actualUserId}
      ORDER BY created_at DESC
    `;
    return data as any[];
  } catch (error) {
    console.error('Error fetching user calculators:', error);
    return [];
  }
}

// Get specific user calculator
export async function getUserCalculator(userId: string, slug: string): Promise<UserCalculator | null> {
  try {
    // Handle UUID conversion for temporary users
    let actualUserId = userId;
    if (userId.startsWith('temp_')) {
      actualUserId = generateUuidForTempUser(userId);
    }

    const data = await sql`
      SELECT * FROM user_calculators 
      WHERE user_id = ${actualUserId} AND slug = ${slug}
      LIMIT 1
    `;
    return data.length ? data[0] as any : null;
  } catch (error) {
    console.error('Error fetching user calculator:', error);
    return null;
  }
}

// Update user calculator
export async function updateUserCalculator(id: string, updates: Partial<UserCalculator>): Promise<boolean> {
  try {
    if (Object.keys(updates).length === 0) return true;

    // Simple approach: update only config field for now
    if (updates.config) {
      await sql`
        UPDATE user_calculators 
        SET config = ${JSON.stringify(updates.config)}, updated_at = NOW()
        WHERE id = ${id}
      `;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user calculator:', error);
    return false;
  }
}

// Delete user calculator
export async function deleteUserCalculator(id: string, userId: string): Promise<boolean> {
  try {
    await sql`
      DELETE FROM user_calculators 
      WHERE id = ${id} AND user_id = ${userId}
    `;
    return true;
  } catch (error) {
    console.error('Error deleting user calculator:', error);
    return false;
  }
}