import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    console.log("Fetching weather data...");

    const apiKey = "d8ac486b68964c18928165310243011";
    const location = "Dublin";
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}&aqi=no`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }

    const data = await response.json();
    const currentTemp = data.current.temp_c;

    return NextResponse.json({ temp: currentTemp });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
