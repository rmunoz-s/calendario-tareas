import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Task, TaskInput } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}

let client: SupabaseClient | null = null;

export function getSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error("Faltan las variables de entorno de Supabase.");
  }

  if (!client) {
    client = createClient(url!, anonKey!);
  }

  return client;
}

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await getSupabase()
    .from("tasks")
    .select("*")
    .order("due_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Task[];
}

export async function createTask(input: TaskInput): Promise<Task> {
  const { data, error } = await getSupabase()
    .from("tasks")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

export async function updateTask(
  id: string,
  input: TaskInput,
): Promise<Task> {
  const { data, error } = await getSupabase()
    .from("tasks")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await getSupabase().from("tasks").delete().eq("id", id);
  if (error) throw error;
}
