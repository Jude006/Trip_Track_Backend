// const mongoose = require("mongoose"); 
// require('./User');

// const tripSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true },
//     destination: { type: String, required: true },
//     startDate: { type: Date, required: true },
//     endDate: { type: Date, required: true },
//     totalBudget: { type: Number, required: true },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "user",
//       required: true,
//     },
//     members: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
//     coverImage: { 
//       public_id: { type: String },
//       url: { type: String }
//     },
//     categories: {
//       type: [String],
//       default: ["Transport", "Food", "Lodging", "Activities"],
//     },
    
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Trip", tripSchema);










const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    destination: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalBudget: { type: Number, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", 
      required: true,
    },
    members: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "user" 
    }],
    budgets: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Budget" 
    }],
    coverImage: { 
      public_id: { type: String },
      url: { type: String }
    },
    categories: {
      type: [String],
      default: ["Transport", "Food", "Lodging", "Activities"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);