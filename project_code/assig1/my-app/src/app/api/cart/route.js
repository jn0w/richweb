import { MongoClient } from "mongodb";
import { getCustomSession } from "../sessionCode/route.js";

// MongoDB connection string
const mongoURI =
  "mongodb+srv://jakub:safePass@cluster0.p0vbg.mongodb.net/sampleDatabase?retryWrites=true&w=majority";

// Handle POST requests to update the cart
export async function POST(req) {
  try {
    // Get the user's session
    const session = await getCustomSession();
    const email = session.email;

    // If no email is found, return an authentication error
    if (!email) {
      return new Response(
        JSON.stringify({ message: "User not authenticated" }),
        {
          status: 401,
        }
      );
    }

    // Parse the request body
    const body = await req.json();
    const { product, action } = body;

    // Validate the request body
    if (!product) {
      return new Response(JSON.stringify({ message: "Invalid request" }), {
        status: 400,
      });
    }

    // Connect to the database
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db("shoppingApp");
    const cartCollection = db.collection("cart");

    // Handle "increment" action
    if (action === "increment") {
      await cartCollection.updateOne(
        { email, "items.pname": product.pname },
        { $inc: { "items.$.quantity": 1 } }
      );
    }
    // Handle "decrement" action
    else if (action === "decrement") {
      const result = await cartCollection.updateOne(
        { email, "items.pname": product.pname, "items.quantity": { $gt: 1 } },
        { $inc: { "items.$.quantity": -1 } }
      );

      // If quantity reaches 0, remove the item from the cart
      if (result.modifiedCount === 0) {
        await cartCollection.updateOne(
          { email },
          { $pull: { items: { pname: product.pname } } }
        );
      }
    }
    // Add a new item or update its quantity
    else {
      const existingCart = await cartCollection.findOne({ email });
      const existingItem = existingCart?.items?.find(
        (item) => item.pname === product.pname
      );

      if (existingItem) {
        // If item already exists, increment its quantity
        await cartCollection.updateOne(
          { email, "items.pname": product.pname },
          { $inc: { "items.$.quantity": 1 } }
        );
      } else {
        // If item does not exist, add it to the cart
        await cartCollection.updateOne(
          { email },
          { $push: { items: { ...product, quantity: 1 } } },
          { upsert: true }
        );
      }
    }

    // Close the database connection
    await client.close();

    // Return success response
    return new Response(JSON.stringify({ message: "Cart updated" }), {
      status: 200,
    });
  } catch (error) {
    // Handle server errors
    console.error("Error updating cart:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}

// Handle GET requests to retrieve the cart
export async function GET(req) {
  try {
    // Get the user's session
    const session = await getCustomSession();
    const email = session.email;

    // If no email is found, return an authentication error
    if (!email) {
      return new Response(
        JSON.stringify({ message: "User not authenticated" }),
        {
          status: 401,
        }
      );
    }

    // Connect to the database
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db("shoppingApp");
    const cartCollection = db.collection("cart");

    // Fetch the cart items for the user
    const cart = await cartCollection.findOne({ email });

    // Calculate total price
    let totalPrice = 0;
    if (cart && cart.items) {
      totalPrice = cart.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
      );
    }

    // Close the database connection
    await client.close();

    // Return the cart items and total price
    return new Response(
      JSON.stringify({ items: cart?.items || [], totalPrice }),
      {
        status: 200,
      }
    );
  } catch (error) {
    // Handle server errors
    console.error("Error fetching cart:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}
