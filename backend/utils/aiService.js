const fs = require("fs");

/**
 * Reads a locally saved file and asks Gemini if it contains a signature.
 * @param {string} filePath - The local path to the file saved by Multer
 * @param {string} mimeType - The file type (e.g., 'application/pdf', 'image/jpeg')
 * @returns {boolean} - True if a signature is found, False otherwise
 */
const analyzeSignature = async (filePath, mimeType) => {
  try {
    // 1. Grab the API key from our secure .env file
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY in environment variables.");
      return false;
    }

    // 2. Read the file that Multer just saved to the disk and convert it to Base64
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString("base64");

    // 3. Send the image/pdf directly to Gemini using native fetch
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: "Look closely at this document. Does it contain a visible handwritten or digital signature anywhere? Reply strictly with 'YES' or 'NO'.",
                },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // 4. Parse the exact text response from the AI
    const textResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase() ||
      "NO";

    // 5. Return a clean boolean we can use in our database logic
    return textResponse.includes("YES");
  } catch (error) {
    console.error("AI Analysis failed in backend:", error.message);
    // If the API fails or times out, we default to false (unverified) for safety
    return false;
  }
};

module.exports = { analyzeSignature };
