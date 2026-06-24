import { supabase } from "./client";

export async function testConnection() {
  const { data, error } = await supabase
    .from("pgs")
    .select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);
}
