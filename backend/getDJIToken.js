// backend/getDJIToken.js
import axios from "axios";

const CLIENT_ID = "7497b6385f9706477eb1c57f69b7d3d";
const CLIENT_SECRET = "PJ7sXPfudrJwE0QxA7c36zFLqXQF3uUpUN4zLOupYfFUYgFODvBTRu3jfUEhhM61RD2TtSz+f4rOdKPz4I9OOK+SBTIJ8RIMScKVyacqrB6yYqAu4AwyQTjjgJhxWkCJSwUaBb1LnMvHhkviskcec4cbYT0ZETVsu02VoZ27dZc=";

(async () => {
  try {
    const response = await axios.post(
      "https://developer-api.dji.com/api/v1/oauth/token",
      {
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      },
      { headers: { "Content-Type": "application/json" }, timeout: 10000 }
    );

    console.log("✅ Token received successfully!");
    console.log("Access Token:", response.data.access_token);
    console.log("Expires in:", response.data.expires_in, "seconds");
  } catch (error) {
    console.error("❌ Error getting token:", error.response?.data || error.message);
  }
})();
