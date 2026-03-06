export const MOCK_DATA = [
  {
    id: 1,
    author: "Alex J.",
    title: "Brake Pad & Rotor Replacement",
    category: "Auto",
    location: "Chicago, IL",
    description: "Dealership quoted me for front and rear brake pads and rotors on a 2019 Honda Civic.",
    originalQuote: 850,
    status: "Active",
    date: "Oct 24, 2024",
    jobComments: [
      { id: 1, author: "CarNerd88", text: "Make sure they flush the brake fluid too if it's been over 3 years.", date: "Oct 24, 2024" }
    ],
    bids: [
      { 
        id: 101, 
        providerName: "Mike's Garage", 
        amount: 550, 
        notes: "Using OEM equivalent ceramic pads. Can do it tomorrow morning.", 
        rating: 4.8,
        location: "Evanston, IL",
        zipCode: "60201",
        signedDocumentAttached: true,
        verifiedByTopDogg: true,
        documentUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800",
        providerContact: { phone: "(555) 987-6543", email: "mike@mikesgarage.com", location: "123 Main St, Next to the old diner" },
        comments: [
          { id: 1, author: "Sarah M.", text: "Mike did my brakes last month. Super honest and fast.", date: "Oct 25, 2024" },
          { id: 2, author: "Dave T.", text: "$550 is a steal for front and rear. Dealerships usually charge double.", date: "Oct 25, 2024" }
        ]
      },
      { 
        id: 102, 
        providerName: "Speedy Auto Repair", 
        amount: 600, 
        notes: "Includes a 12-month warranty on parts and labor.", 
        rating: 4.6,
        location: "Chicago, IL",
        zipCode: "60614",
        signedDocumentAttached: true,
        verifiedByTopDogg: true,
        documentUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800",
        comments: []
      }
    ]
  },
  {
    id: 2,
    author: "Samantha W.",
    title: "Water Heater Replacement",
    category: "Home",
    location: "Austin, TX",
    description: "Need a 50-gallon gas water heater replaced. Current one is leaking from the bottom.",
    originalQuote: 2200,
    status: "Active",
    date: "Oct 25, 2024",
    jobComments: [],
    bids: []
  },
  {
    id: 3,
    author: "David L.",
    title: "Replace 2 Ceiling Fans",
    category: "Home",
    location: "Denver, CO",
    description: "Need an electrician or handyman to swap out two standard ceiling fans in bedrooms with vaulted ceilings. I already have the new fans.",
    originalQuote: 450,
    status: "Active",
    date: "Oct 26, 2024",
    jobComments: [
      { id: 1, author: "SparkyJoe", text: "Are the current boxes fan-rated? If not, that quote is actually decent.", date: "Oct 26, 2024" }
    ],
    bids: []
  },
  {
    id: 4,
    author: "Maria C.",
    title: "Check Engine Light - O2 Sensor",
    category: "Auto",
    location: "Miami, FL",
    description: "Code reader said it's the upstream oxygen sensor. Dealership wants to charge for another diagnostic plus parts/labor.",
    originalQuote: 380,
    status: "Active",
    date: "Oct 26, 2024",
    jobComments: [],
    bids: [
      { id: 103, providerName: "Express Auto", amount: 200, notes: "If you already have the code, we'll just swap the sensor. Quick 30 min job.", rating: 4.9, location: "Miami, FL", zipCode: "33132", signedDocumentAttached: true, verifiedByTopDogg: true, documentUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800", comments: [] }
    ]
  }
];