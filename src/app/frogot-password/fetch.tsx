export async function fetchDataJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const newUrl = "https://apivtwo.iymart.jp/api/" + url;
    const token = localStorage.getItem("user-token");
    console.log("Sending Token:", token);

    const response = await fetch(newUrl, {
      ...options,
      headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
      },
    });

    if (response.headers.get("content-type")?.includes("application/json")) {
      const result = await response.json();
      console.log("Response:", result);

      if (!response.ok) {
        throw new Error(result.errors || "Network response was not ok");
      }

      return result;
    } else {
      // Log the raw response text for debugging
      const rawText = await response.text();
      console.error("Unexpected response format (not JSON):", rawText);
      throw new Error("Unexpected response format (not JSON)");
    }
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}
