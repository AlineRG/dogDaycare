// require('dotenv').config();

// const configurations = {
//   ConnectionStrings: {
//     MongoDB: process.env.MONGODB_URI || "mongodb+srv://alinerabago:Password01@dogdaycare.9jwdr.mongodb.net/"
//   },
//   Authentication: {
//     GitHub: {
//       ClientId: process.env.GITHUB_CLIENT_ID,
//       ClientSecret: process.env.GITHUB_CLIENT_SECRET,
//       CallbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:3000/auth/github/callback"
//     }
//   }
// };

module.exports = configurations;

require('dotenv').config();

module.exports = {
  ConnectionStrings: {
    MongoDB: process.env.MONGODB_URI || 'mongodb://localhost:27017/dogdaycare'
  },
  Authentication: {
    GitHub: {
      ClientId: process.env.GITHUB_CLIENT_ID,
      ClientSecret: process.env.GITHUB_CLIENT_SECRET,
      CallbackURL: process.env.GITHUB_CALLBACK_URL || 'https://your-app-name.onrender.com/auth/github/callback'
      // 'http://localhost:3000/auth/github/callback'
    }
  }
};
