import { MongoClient } from "mongodb";
import { getCustomSession } from "../sessionCode/route.js";

const mongoURI =
  "mongodb+srv://jakub:safePass@cluster0.p0vbg.mongodb.net/sampleDatabase?retryWrites=true&w=majority";

export async function POST(req) {
  try {
    const session = await getCustomSession(); // Fetch session
    const email = session.email;

    if (!email) {
      return new Response(
        JSON.stringify({ message: "User not authenticated" }),
        {
          status: 401,
        }
      );
    }

    const body = await req.json();
    const { product, action } = body;

    if (!product) {
      return new Response(JSON.stringify({ message: "Invalid request" }), {
        status: 400,
      });
    }

    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db("shoppingApp");
    const cartCollection = db.collection("cart");

    if (action === "increment") {
      await cartCollection.updateOne(
        { email, "items.pname": product.pname },
        { $inc: { "items.$.quantity": 1 } }
      );
    } else if (action === "decrement") {
      const result = await cartCollection.updateOne(
        { email, "items.pname": product.pname, "items.quantity": { $gt: 1 } },
        { $inc: { "items.$.quantity": -1 } }
      );

      // Remove item if quantity reaches 0
      if (result.modifiedCount === 0) {
        await cartCollection.updateOne(
          { email },
          { $pull: { items: { pname: product.pname } } }
        );
      }
    } else {
      const existingCart = await cartCollection.findOne({ email });
      const existingItem = existingCart?.items?.find(
        (item) => item.pname === product.pname
      );

      if (existingItem) {
        await cartCollection.updateOne(
          { email, "items.pname": product.pname },
          { $inc: { "items.$.quantity": 1 } }
        );
      } else {
        await cartCollection.updateOne(
          { email },
          { $push: { items: { ...product, quantity: 1 } } },
          { upsert: true }
        );
      }
    }

    await client.close();
    return new Response(JSON.stringify({ message: "Cart updated" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}

export async function GET(req) {
  try {
    const session = await getCustomSession(); // Fetch session
    const email = session.email;

    if (!email) {
      return new Response(
        JSON.stringify({ message: "User not authenticated" }),
        {
          status: 401,
        }
      );
    }

    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db("shoppingApp");
    const cartCollection = db.collection("cart");

    const cart = await cartCollection.findOne({ email });
    await client.close();

    return new Response(JSON.stringify(cart?.items || []), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}
