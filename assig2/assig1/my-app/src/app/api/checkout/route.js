import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";

// MongoDB connection string
const mongoURI =
  "mongodb+srv://jakub:safePass@cluster0.p0vbg.mongodb.net/sampleDatabase?retryWrites=true&w=majority";

// Handle POST requests to place an order
export async function POST(req) {
  try {
    // Parse the request body
    const body = await req.json();
    const { name, email, address, phone, items } = body;

    // Validate required fields
    if (!name || !email || !address || !phone || !items || items.length === 0) {
      console.log("Invalid request data:", body);
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Validate input lengths
    if (
      name.length > 50 ||
      email.length > 100 ||
      address.length > 100 ||
      phone.length > 15
    ) {
      return new Response(
        JSON.stringify({
          message: "Input values exceed allowed length.",
        }),
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ message: "Invalid email format." }),
        { status: 400 }
      );
    }

    // Validate phone number
    if (!/^\d{8,15}$/.test(phone)) {
      return new Response(
        JSON.stringify({
          message: "Phone number must contain 8-15 digits.",
        }),
        { status: 400 }
      );
    }

    // Escape input values (basic sanitization for text fields)
    const sanitizeInput = (input) =>
      input.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const sanitizedData = {
      name: sanitizeInput(name),
      email: sanitizeInput(email),
      address: sanitizeInput(address),
      phone: sanitizeInput(phone),
      items, // Items do not need escaping as they are structured data
    };

    // Connect to the database
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db("sampleDatabase");
    const ordersCollection = db.collection("orders");

    // Create an order object
    const order = {
      ...sanitizedData,
      createdAt: new Date(),
    };

    // Insert the order into the database
    await ordersCollection.insertOne(order);
    await client.close();

    // Send confirmation email to the user
    const transporter = nodemailer.createTransport({
      service: "gmail", // Use Gmail service
      auth: {
        user: "app2568666@gmail.com", // Sender's email
        pass: "uhmp ohex vxuq picd", // App password for Gmail
      },
    });

    // Prepare the email content
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

    // Send the email
    await transporter.sendMail({
      from: "app2568666@gmail.com", // Sender's email
      to: email, // Recipient's email
      subject: "Order Confirmation", // Email subject
      text: emailContent, // Email body
    });

    console.log("Order successfully inserted and email sent:", order);

    // Respond with success message
    return new Response(
      JSON.stringify({ message: "Order placed successfully!" }),
      { status: 200 }
    );
  } catch (error) {
    // Log and handle errors
    console.error("Error placing order or sending email:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}

// Handle GET requests to fetch all orders
export async function GET(req) {
  try {
    // Connect to the database
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db("sampleDatabase");
    const ordersCollection = db.collection("orders");

    // Fetch all orders from the database
    const orders = await ordersCollection.find({}).toArray();
    await client.close();

    // Respond with the orders as JSON
    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Log and handle errors
    console.error("Error fetching orders:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}