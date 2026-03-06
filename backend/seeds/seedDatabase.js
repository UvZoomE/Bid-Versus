const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");

// Import Models
const User = require("../models/User");
const Job = require("../models/Job");
const Bid = require("../models/Bid");

// Import your MongoDB connection logic
const connectDB = require("../config/db");

const importData = async () => {
  try {
    // 1. Connect to the database
    await connectDB();

    // 2. Wipe the existing database clean so we don't get duplicates
    console.log("Clearing old data...");
    await Job.deleteMany();
    await Bid.deleteMany();
    await User.deleteMany();

    // 3. Create a couple of dummy users
    console.log("Creating users...");
    const createdUsers = await User.insertMany([
      { name: "Alex J.", email: "alex@example.com", password: "password123" },
      {
        name: "Mike's Garage",
        email: "mike@mikesgarage.com",
        password: "password123",
        businessName: "Mike's Auto",
        phone: "(555) 987-6543",
      },
      {
        name: "Express Auto",
        email: "express@example.com",
        password: "password123",
      },
    ]);

    const customerAlex = createdUsers[0];
    const providerMike = createdUsers[1];
    const providerExpress = createdUsers[2];

    // 4. Create the Jobs (Without bids initially)
    console.log("Creating jobs...");
    const job1 = await Job.create({
      title: "Brake Pad & Rotor Replacement",
      category: "Auto",
      location: "Chicago, IL",
      description:
        "Dealership quoted me for front and rear brake pads and rotors on a 2019 Honda Civic.",
      originalQuote: 850,
      author: customerAlex.name, // String version for quick display
      status: "Active",
      jobComments: [
        {
          author: "CarNerd88",
          text: "Make sure they flush the brake fluid too if it's been over 3 years.",
        },
      ],
    });

    const job2 = await Job.create({
      title: "Water Heater Replacement",
      category: "Home",
      location: "Austin, TX",
      description:
        "Need a 50-gallon gas water heater replaced. Current one is leaking from the bottom.",
      originalQuote: 2200,
      author: "Samantha W.",
      status: "Active",
    });

    const job3 = await Job.create({
      title: "Check Engine Light - O2 Sensor",
      category: "Auto",
      location: "Miami, FL",
      description:
        "Code reader said it's the upstream oxygen sensor. Dealership wants to charge for another diagnostic plus parts/labor.",
      originalQuote: 380,
      author: "Maria C.",
      status: "Active",
    });

    // 5. Create the Bids and link them to Job 1 and Job 3
    console.log("Creating bids...");

    // Bids for Job 1
    const bid1 = await Bid.create({
      job: job1._id, // Link to Job 1
      provider: providerMike._id, // Link to Provider User
      providerName: providerMike.name,
      amount: 550,
      notes: "Using OEM equivalent ceramic pads. Can do it tomorrow morning.",
      location: "Evanston, IL",
      zipCode: "60201",
      rating: 4.8,
      providerContact: {
        phone: providerMike.phone,
        email: providerMike.email,
        location: "123 Main St, Next to the old diner",
      },
      comments: [
        {
          author: "Sarah M.",
          text: "Mike did my brakes last month. Super honest and fast.",
        },
      ],
    });

    const bid2 = await Bid.create({
      job: job1._id, // Link to Job 1
      providerName: "Speedy Auto Repair",
      amount: 600,
      notes: "Includes a 12-month warranty on parts and labor.",
      location: "Chicago, IL",
      rating: 4.6,
    });

    // Bid for Job 3
    const bid3 = await Bid.create({
      job: job3._id, // Link to Job 3
      provider: providerExpress._id,
      providerName: providerExpress.name,
      amount: 200,
      notes:
        "If you already have the code, we'll just swap the sensor. Quick 30 min job.",
      location: "Miami, FL",
      rating: 4.9,
    });

    // 6. Update the Jobs to include the ObjectIds of the Bids we just created
    job1.bids.push(bid1._id, bid2._id);
    await job1.save();

    job3.bids.push(bid3._id);
    await job3.save();

    console.log("✅ Database Seeded Successfully!");
    process.exit(); // Closes the database connection successfully
  } catch (error) {
    console.error(`❌ Error seeding database: ${error.message}`);
    process.exit(1); // Closes with an error
  }
};

// Execute the function
importData();
