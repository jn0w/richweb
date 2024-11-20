import { MongoClient } from "mongodb";

const mongoURI =
  "mongodb+srv://jakub:safePass@cluster0.p0vbg.mongodb.net/sampleDatabase?retryWrites=true&w=majority";

// Handle POST requests to place an order
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, address, phone, items } = body;

    if (!name || !email || !address || !phone || !items || items.length === 0) {
      console.log("Invalid request data:", body);
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400 }
      );
    }

    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db("sampleDatabase");
    const ordersCollection = db.collection("orders");

    const order = {
      name,
      email,
      address,
      phone,
      items,
      createdAt: new Date(),
    };

    await ordersCollection.insertOne(order);
    await client.close();

    console.log("Order successfully inserted:", order);
    return new Response(
      JSON.stringify({ message: "Order placed successfully!" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error placing order:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}

// Handle GET requests to fetch all orders
export async function GET(req) {
  try {
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db("sampleDatabase");
    const ordersCollection = db.collection("orders");

    const orders = await ordersCollection.find({}).toArray();
    await client.close();

    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
