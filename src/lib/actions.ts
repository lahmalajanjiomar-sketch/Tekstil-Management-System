"use server";

// This is a placeholder for server actions. In a real application,
// these functions would interact with a database to create, update,
// and delete records. For now, they serve as a blueprint for the
// backend logic required by the UI.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createOrder(formData: FormData) {
  // 1. Parse formData to get customer info and product quantities.
  // 2. Find the selected customer or create a new one.
  // 3. For each product with a quantity > 0:
  //    a. Find the product in the database.
  //    b. Check if there is enough 'unsoldStock'.
  //    c. Decrease the 'unsoldStock' by the ordered quantity.
  // 4. Create the new order record with status 'Sipariş Alındı'.
  // 5. Revalidate paths to update the UI across the app.
  console.log("Creating order with data:", formData);
  
  // This is where you would save to your database.

  revalidatePath("/orders");
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/orders");
}

export async function updateOrderStatus(orderId: string, status: "Sipariş Alındı" | "Kargoya Verildi") {
  // 1. Find the order by its ID.
  // 2. Update the order's status.
  // 3. If the new status is 'Kargoya Verildi':
  //    a. For each item in the order:
  //       i. Find the corresponding product.
  //       ii. Decrease the 'depotStock' by the item's quantity.
  // 4. Revalidate paths.
  console.log(`Updating order ${orderId} to status: ${status}`);

  // This is where you would save to your database.

  revalidatePath("/orders");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function updateProductNotes(productId: string, notes: string) {
    // 1. Find product by ID
    // 2. Update the notes field
    // 3. Save to database
    console.log(`Updating notes for product ${productId}: ${notes}`);
    revalidatePath("/products");
}
