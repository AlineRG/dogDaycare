require("dotenv").config();
// Global configurations object contains Application Level variables such as:
// client secrets, passwords, connection strings, and misc flags
const configurations = {
  ConnectionStrings: {
    // MongoDB: process.env.CONNECTION_STRING_MONGODB,
      MongoDB: "mongodb+srv://alinerabago:Password01@dogdaycare.9jwdr.mongodb.net/"
  },
  Authentication: {
    Google: {
      // ClientId: process.env.GITHUB_CLIENT_ID,
      ClientId: "502568905575-ep5p89c7nvb1lilldtfo5dvm9o3js6hn.apps.googleusercontent.com",
      // ClientSecret: process.env.GITHUB_CLIENT_SECRET,
      ClientSecret: "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",
      // CallbackUrl: process.env.GITHUB_CALLBACK_URL
      callbackURL: "http://localhost:3000/google/callback"

    },
  },
};
module.exports = configurations;