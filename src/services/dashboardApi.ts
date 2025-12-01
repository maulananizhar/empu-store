import { DashboardData } from "@/types/dashboard";
import axios from "axios";

// Function to fetch products from the API
async function fetchDashboard() {
  try {
    const response = await axios.get("/api/dashboard");
    return response.data.data as DashboardData;
  } catch (error) {
    throw error;
  }
}

export { fetchDashboard };
