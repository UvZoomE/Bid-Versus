const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Job = require("../models/Job");
const Bid = require("../models/Bid");

const seedJobs = [
  {
    title: "Transmission Pad & Rotor Replacement (Front/Rear)",
    category: "Auto",
    description:
      "Got a quote from a local dealership for my 2019 Honda Civic. Seems a bit high for just pads and rotors. Looking for a better deal from a local mechanic.",
    originalQuote: 850,
    location: "Pasadena, MD",
    zipCode: "21122",
    author: "Mike T.",
    contactInfo: {
      name: "Mike T.",
      email: "mike.test@example.com",
      phone: "(555) 123-9999",
    },
    documentUrl:
      "https://images.unsplash.com/photo-1565453006580-4353f40d3422?auto=format&fit=crop&q=80&w=800",
    bids: [
      {
        providerName: "Precision Auto Care",
        amount: 600,
        notes:
          "We can do OEM equivalent ceramic pads and resurface the rotors for 600 out the door. Can fit you in Tuesday.",
        location: "Glen Burnie, MD",
        rating: 4.8,
        signedDocumentAttached: true,
        verifiedByTopDogg: true,
        documentUrl:
          "https://images.unsplash.com/photo-1505086811802-e22114757ed4?auto=format&fit=crop&q=80&w=800",
      },
    ],
  },
  {
    title: "Roof Leak Repair - Flashing & Shingles",
    category: "Home",
    description:
      "Noticed a water stain on the ceiling after the last storm. Had a big company come out and they want to replace a massive section. Need a second opinion.",
    originalQuote: 1400,
    location: "Annapolis, MD",
    zipCode: "21401",
    author: "Sarah J.",
    contactInfo: {
      name: "Sarah J.",
      email: "sarah.test@example.com",
      phone: "(555) 234-8888",
    },
    documentUrl:
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800",
    bids: [],
  },
  {
    title: "2018 F-150 Alternator Replacement",
    category: "Auto",
    description:
      "Truck died on the highway. Tow yard mechanic quoted me this. Looking for someone who can get the part cheaper and do it this weekend.",
    originalQuote: 1100,
    location: "Severna Park, MD",
    zipCode: "21146",
    author: "David W.",
    contactInfo: {
      name: "David W.",
      email: "dave.test@example.com",
      phone: "(555) 345-7777",
    },
    documentUrl:
      "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&q=80&w=800",
    bids: [],
  },
  {
    title: "Kitchen Plumbing Rough-in for Island",
    category: "Home",
    description:
      "Remodeling the kitchen and need lines run for a new island sink and dishwasher. Quote includes tearing up the slab. Want to see if this is market rate.",
    originalQuote: 3200,
    location: "Bowie, MD",
    zipCode: "20715",
    author: "Elena R.",
    contactInfo: {
      name: "Elena R.",
      email: "elena.test@example.com",
      phone: "(555) 456-6666",
    },
    documentUrl:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
    bids: [
      {
        providerName: "Apex Plumbing",
        amount: 2800,
        notes:
          "Licensed and insured. We do these slab cuts weekly. Can knock it out in 2 days.",
        location: "Crofton, MD",
        rating: 5.0,
        customerOffer: 2500,
        signedDocumentAttached: false,
      },
    ],
  },
  {
    title: "Dent Removal and Bumper Paint Match",
    category: "Auto",
    description:
      "Someone backed into me in a parking lot. Minor dent on the rear right quarter panel and needs a paint blend. Auto body shop quote is attached.",
    originalQuote: 1150,
    location: "Odenton, MD",
    zipCode: "21113",
    author: "Chris M.",
    contactInfo: {
      name: "Chris M.",
      email: "chris.test@example.com",
      phone: "(555) 567-5555",
    },
    documentUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800",
    bids: [],
  },
  {
    title: "Deck Power Washing and Staining",
    category: "Home",
    description:
      "20x15 wood deck. Needs a solid power wash and two coats of semi-transparent stain. Paint company gave me this estimate.",
    originalQuote: 950,
    location: "Severn, MD",
    zipCode: "21144",
    author: "Jessica L.",
    contactInfo: {
      name: "Jessica L.",
      email: "jess.test@example.com",
      phone: "(555) 678-4444",
    },
    documentUrl:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800",
    bids: [],
  },
  {
    title: "Check Engine Light - Catalytic Converter",
    category: "Auto",
    description:
      "2014 Prius. Dealership says the cat is bad and quoted me crazy money. Looking for an aftermarket install or someone to weld a universal one.",
    originalQuote: 2400,
    location: "Baltimore, MD",
    zipCode: "21201",
    author: "Marcus B.",
    contactInfo: {
      name: "Marcus B.",
      email: "marcus.test@example.com",
      phone: "(555) 789-3333",
    },
    documentUrl:
      "https://images.unsplash.com/photo-1503694978374-8a2fa686963a?auto=format&fit=crop&q=80&w=800",
    bids: [],
  },
  {
    title: "Install 2 Ceiling Fans and 4 Recessed Lights",
    category: "Home",
    description:
      "I already bought the fans and the LED light pucks. Just need an electrician to pull the wire from the switch and install them in the living room.",
    originalQuote: 800,
    location: "Pasadena, MD",
    zipCode: "21122",
    author: "Amanda K.",
    contactInfo: {
      name: "Amanda K.",
      email: "amanda.test@example.com",
      phone: "(555) 890-2222",
    },
    documentUrl:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=800",
    bids: [
      {
        providerName: "Volt Brothers Electric",
        amount: 550,
        notes:
          "Master electrician here. If there is attic access above the living room, I can do this for 550 total.",
        location: "Pasadena, MD",
        rating: 4.9,
        signedDocumentAttached: true,
        verifiedByTopDogg: false,
        documentUrl:
          "https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&q=80&w=800",
      },
    ],
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Create Jobs and Bids separately to satisfy MongoDB relations
    for (let jobData of seedJobs) {
      const bidsData = jobData.bids;
      delete jobData.bids; // Remove bids from job data before creating the job

      // Create the Job first so we get an official Job ID
      const newJob = await Job.create(jobData);

      // If there are bids, create them and link them back to the Job
      if (bidsData && bidsData.length > 0) {
        for (let bidData of bidsData) {
          bidData.job = newJob._id;
          const newBid = await Bid.create(bidData);
          newJob.bids.push(newBid._id);
        }
        await newJob.save();
      }
    }

    console.log(
      `✅ Successfully seeded ${seedJobs.length} realistic jobs and bids into the database!`,
    );

    mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
