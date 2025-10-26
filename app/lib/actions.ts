'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { unstable_noStore as noStore } from 'next/cache';
import { createUser } from './data';

// Base form state type for all form actions
type FormState<T> = {
  errors?: {
    [K in keyof T]?: string[];
  } & {
    _form?: string[];
  };
  message?: string | null;
  success?: boolean;
};

// Invoice schemas
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    required_error: "Customer is required",
  }).min(1, "Please select a customer"),
  amount: z.coerce
    .number()
    .positive("Amount must be greater than 0")
    .min(1, "Amount must be at least 1"),
  status: z.enum(['pending', 'paid'], {
    required_error: "Status is required",
    invalid_type_error: "Status must be 'pending' or 'paid'",
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// Type definitions for form submissions
export type InvoiceFormState = FormState<z.infer<typeof CreateInvoice>>;
export type UpdateInvoiceFormState = FormState<z.infer<typeof UpdateInvoice>>;

// Authentication schema
const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormState = FormState<z.infer<typeof LoginSchema>>;

/**
 * Creates a new invoice
 */
export async function createInvoice(
  prevState: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  noStore();
  
  // Validate form fields
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing or invalid fields. Failed to create invoice.',
      success: false,
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
  
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
    
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  } catch (error) {
    console.error('Database error:', error);
    return {
      message: 'Database Error: Failed to Create Invoice.',
      success: false,
    };
  }
}

/**
 * Updates an existing invoice
 */
export async function updateInvoice(
  id: string,
  prevState: UpdateInvoiceFormState,
  formData: FormData,
): Promise<UpdateInvoiceFormState> {
  noStore();
  
  // Validate form fields
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing or invalid fields. Failed to update invoice.',
      success: false,
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
 
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
    
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  } catch (error) {
    console.error('Database error:', error);
    return { 
      message: 'Database Error: Failed to Update Invoice.',
      success: false,
    };
  }
}

/**
 * Deletes an invoice
 */
export async function deleteInvoice(id: string): Promise<{ message: string; success: boolean }> {
  noStore();
  
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { 
      message: 'Invoice deleted successfully.',
      success: true,
    };
  } catch (error) {
    console.error('Database error:', error);
    return { 
      message: 'Database Error: Failed to Delete Invoice.',
      success: false,
    };
  }
}

/**
 * Authenticates a user
 */
export async function authenticate(
  prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  noStore();
  
  // Validate form fields
  const validatedFields = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  // If form validation fails, return errors
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing or invalid fields. Failed to log in.',
      success: false,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    // Attempt to sign in user with credentials
    await signIn('credentials', {
      email,
      password,
      // We handle redirects manually to provide better feedback
      redirect: false,
    });

    return { 
      message: 'Login successful!',
      success: true,
    };
  } catch (error) {
    // Handle authentication errors
    if (error instanceof AuthError) {
      switch (error.cause) {
        case 'CredentialsSignin':
          return { 
            errors: { _form: ['Invalid credentials'] },
            message: 'Invalid email or password',
            success: false,
          };
        default:
          return { 
            errors: { _form: ['Authentication failed'] },
            message: 'Something went wrong. Please try again.',
            success: false,
          };
      }
    }
    
    // For any other errors
    console.error('Authentication error:', error);
    return { 
      errors: { _form: ['An unexpected error occurred'] },
      message: 'Something went wrong. Please try again.',
      success: false,
    };
  }
}

/**
 * Signs out the current user
 */
export async function logout(): Promise<void> {
  await signOut({ redirectTo: '/login' });
}

/**
 * Creates a new user
 */


// Define validation schema for form data
const RegisterSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
  terms: z.literal('on', {
    invalid_type_error: 'You must accept the terms and conditions',
  }).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export async function register(prevState: any, formData: FormData) {
  // Validate form data
  const validatedFields = RegisterSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    terms: formData.get('terms'),
  });

  // Return early if form validation fails
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to register.',
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    // Create the user in the database
    const result = await createUser(name, email, password);
    
    if (!result.success) {
      return {
        message: 'Database error: Failed to create user.',
      };
    }

    return {
      success: true,
      errors: {},
      message: 'Registration successful',
    };  
  } catch (error) {
    console.error("This error occured", error);
    return {
      message: 'An unexpected error occurred.',
    };
  }
}