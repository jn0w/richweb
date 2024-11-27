import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";

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

    // Send confirmation email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "app2568666@gmail.com",
        pass: "uhmp ohex vxuq picd",
      },
    });

    const emailContent = `
      Hello ${name},

      Thank you for your order!

      Here are your order details:
      ${items
        .map((item) => `${item.quantity} x ${item.pname} - $${item.price}`)
        .join("\n")}

      Your order will be delivered to:
      ${address}

      Thank you for shopping with us!

      Regards,
      BestDoughnuts Team
    `;

    await transporter.sendMail({
      from: "app2568666@gmail.com",
      to: email,
      subject: "Order Confirmation",
      text: emailContent,
    });

    console.log("Order successfully inserted and email sent:", order);
    return new Response(
      JSON.stringify({ message: "Order placed successfully!" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error placing order or sending email:", error);
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
