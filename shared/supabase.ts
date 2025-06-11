import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

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
  created_at: string;
  updated_at: string;
}

// Clone a calculator template for a user
export async function cloneCalculator(userId: string, templateId: string): Promise<UserCalculator | null> {
  try {
    // Get the template
    const { data: template, error: templateError } = await supabase
      .from('calculator_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      console.error('Error fetching template:', templateError);
      return null;
    }

    // Generate unique slug for user calculator
    const uniqueSlug = `${template.slug}-${userId.slice(0, 8)}-${Date.now()}`;
    const embedUrl = `${process.env.REPL_URL || 'https://localhost:5000'}/embed/${uniqueSlug}`;

    // Create user calculator clone
    const { data: userCalculator, error: cloneError } = await supabase
      .from('user_calculators')
      .insert({
        user_id: userId,
        template_id: template.id,
        slug: uniqueSlug,
        name: template.name,
        layout_json: template.layout_json,
        logic_json: template.logic_json,
        style_json: template.style_json,
        prompt_md: template.prompt_md,
        is_active: true,
        embed_url: embedUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (cloneError) {
      console.error('Error cloning calculator:', cloneError);
      return null;
    }

    return userCalculator;
  } catch (error) {
    console.error('Error in cloneCalculator:', error);
    return null;
  }
}

// Get user's calculators
export async function getUserCalculators(userId: string): Promise<UserCalculator[]> {
  try {
    const { data, error } = await supabase
      .from('user_calculators')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user calculators:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserCalculators:', error);
    return [];
  }
}

// Get specific user calculator
export async function getUserCalculator(userId: string, slug: string): Promise<UserCalculator | null> {
  try {
    const { data, error } = await supabase
      .from('user_calculators')
      .select('*')
      .eq('user_id', userId)
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching user calculator:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserCalculator:', error);
    return null;
  }
}

// Update user calculator
export async function updateUserCalculator(id: string, updates: Partial<UserCalculator>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_calculators')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating user calculator:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateUserCalculator:', error);
    return false;
  }
}

// Get all calculator templates
export async function getCalculatorTemplates(): Promise<CalculatorTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('calculator_templates')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching templates:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCalculatorTemplates:', error);
    return [];
  }
}

// Get specific calculator template
export async function getCalculatorTemplate(slug: string): Promise<CalculatorTemplate | null> {
  try {
    const { data, error } = await supabase
      .from('calculator_templates')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching template:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getCalculatorTemplate:', error);
    return null;
  }
}

// Delete user calculator
export async function deleteUserCalculator(id: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_calculators')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting user calculator:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteUserCalculator:', error);
    return false;
  }
}