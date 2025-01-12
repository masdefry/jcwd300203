import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const hashPassword = async (password) => {
  const saltRounds = 15;
  return await bcrypt.hash(password, saltRounds);
};

async function resetSequences() {
  const sequences = [
    'Tenant_id_seq',
    'Customer_id_seq',
    'PropertyImage_id_seq', 
    'RoomImage_id_seq',
    'Booking_id_seq',
    'Status_id_seq',
    'PropFacility_id_seq',
    'RoomFacility_id_seq',
    'Review_id_seq',
    'FlexiblePrice_id_seq',
    'Property_id_seq',
    'RoomType_id_seq',
    'Category_id_seq',
    'RoomUnavailability_id_seq'
  ];

  for (const seq of sequences) {
    await prisma.$executeRawUnsafe(`SELECT setval('"${seq}"', 1, false)`);
  }
}

const customers = [
  {
    name: 'Ucup uwuw',
    username: 'ucupslebew',
    email: 'ucup@gmail.com',
    password: await hashPassword('11111111'),
  },
  {
    name: 'Acong Madura',
    username: 'acongmadura',
    email: 'acong@gmail.com',
    password: await hashPassword('11111111'),
  },
  {
    name: 'Udin Petot',
    username: 'udinpetot',
    email: 'udinpetot@gmail.com',
    password: await hashPassword('11111111'),
  },
  {
    name: 'Ahmad Bejo',
    username: 'ahmadbejo',
    email: 'ahmadbejo@gmail.com',
    password: await hashPassword('11111111'),
  },
];

const tenants = [
  {
    name: 'Adi Putra',
    username: 'adi_putra',
    email: 'adi.putra@example.com',
    password: await hashPassword('11111111'),
    profileImage: 'https://example.com/images/adi_putra.jpg',
    IdCardImage: 'https://example.com/images/adi_putra_id.jpg',
    role: 'tenant'
  },
  {
    name: 'Siti Aisyah',
    username: 'siti_aisyah',
    email: 'siti.aisyah@example.com',
    password: await hashPassword('11111111'),
    profileImage: 'https://example.com/images/siti_aisyah.jpg',
    IdCardImage: 'https://example.com/images/siti_aisyah_id.jpg',
    role: 'tenant'
  },
  {
    name: 'Rizki Pratama',
    username: 'rizki_pratama',
    email: 'rizki.pratama@example.com',
    password: await hashPassword('11111111'),
    profileImage: 'https://example.com/images/rizki_pratama.jpg',
    IdCardImage: 'https://example.com/images/rizki_pratama_id.jpg',
    role: 'tenant'
  },
];

var propertiesFacilities = [
  {
    name: "Swimming Pool",
    icon: "icon-icon-1734855480585-348288392.svg"
  },
  {
      name: "Wifi",
      icon: "icon-icon-1734855549584-964817949.svg"
  },
  {
      name: "Parking Space",
      icon: "icon-icon-1734860360407-506582010.svg"
  },
  {
      name: "Designated Smoking Area",
      icon: "icon-icon-1734860855598-72590897.svg"
  }
]

var roomsFacilities = [
  {
    name: "Breakfast included",
    icon: "icon-icon-1734855464106-133411444.svg"
  },
  {
      name: "Wifi",
      icon: "icon-icon-1734855534254-247233899.svg"
  },
  {
      name: "Shower",
      icon: "icon-icon-1734855732488-861217986.svg"
  },
  {
      name: "Bathtub",
      icon: "icon-icon-1734860484486-21297400.svg"
  },
  {
      name: "Balcony",
      icon: "icon-icon-1734860575336-747103123.svg"
  },
  {
      name: "Smoking Room",
      icon: "icon-icon-1734860663085-851979897.svg"
  },
  {
      name: "Non-Smoking Room",
      icon: "icon-icon-1734860676269-365756061.svg"
  },
  {
      name: "Flat Screen TV",
      icon: "icon-icon-1734860928546-674279915.svg"
  },
  {
      name: "Centralized Air Conditioner",
      icon: "icon-icon-1734860997133-26023116.svg"
  }
]


// variable to store properties seed
var properties = [
  {
    name: 'Pantai Sumatera Residences',
    address: 'Jl. Tepi Pantai No. 45, Padang, Sumatra Barat, Indonesia',
    city: 'Padang',
    category: 'Apartment',
    roomCapacity: 20,
    mainImage: 'https://example.com/images/rizki_pratama_id.jpg',
    description: 'A modern beachfront apartment offering stunning ocean views and comfortable amenities.',
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantIndex: 0,
  },
  {
    name: 'Hutan Kalimantan Lodge',
    address: 'Jl. Rimba Tropis No. 12, Pontianak, Kalimantan Barat, Indonesia',
    city: 'Pontianak',
    category: 'Villa',
    roomCapacity: 30,
    mainImage: 'https://example.com/images/rizki_pratama_id.jpg',
    description: 'A tropical lodge nestled in the heart of Kalimantan lush forests, perfect for nature lovers.',
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantIndex: 1,
  },
  {
    name: 'Danau Sulawesi Retreat',
    address: 'Jl. Pinggir Danau No. 8, Manado, Sulawesi Utara, Indonesia',
    city: 'Manado',
    category: 'Villa',
    roomCapacity: 15,
    mainImage: 'https://example.com/images/rizki_pratama_id.jpg',
    description: 'A tranquil retreat by the lake, offering a peaceful getaway surrounded by nature.',
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantIndex: 2,
  },
  {
    name: 'Pegunungan Papua Resort',
    address: 'Jl. Puncak Jaya No. 77, Jayapura, Papua, Indonesia',
    city: 'Jayapura',
    category: 'Hotel',
    roomCapacity: 25,
    mainImage: 'https://example.com/images/rizki_pratama_id.jpg',
    description: 'A luxurious resort set in the breathtaking mountains of Papua, ideal for adventurers.',
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantIndex: 0,
  },
  {
    name: 'Puncak Jawa Villa',
    address: 'Jl. Puncak Gunung No. 90, Bandung, Jawa Barat, Indonesia',
    city: 'Bandung',
    category: 'Villa',
    roomCapacity: 50,
    mainImage: 'https://example.com/images/rizki_pratama_id.jpg',
    description: 'A spacious villa located in the highlands of Bandung, perfect for group stays.',
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantIndex: 1,
  },
  {
    name: 'Sawah Bali Retreat',
    address: 'Jl. Tegallalang No. 101, Ubud, Bali, Indonesia',
    city: 'Bali',
    category: 'Hotel',
    roomCapacity: 18,
    mainImage: 'https://example.com/images/rizki_pratama_id.jpg',
    description: 'A serene retreat surrounded by lush rice fields in the heart of Bali.',
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantIndex: 2,
  },
  {
    name: 'Pantai Lombok Paradise',
    address: 'Jl. Pantai Kuta No. 33, Lombok Tengah, Nusa Tenggara Barat, Indonesia',
    city: 'Lombok',
    category: 'Villa',
    roomCapacity: 10,
    mainImage: 'https://example.com/images/rizki_pratama_id.jpg',
    description: 'A charming villa located on Lombok pristine beaches, ideal for a relaxing escape.',
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantIndex: 0,
  },
];

const categories = [
  {
    name: 'Villa',
    icon: 'villa.svg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Hotel',
    icon: 'hotel.svg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Resort',
    icon: 'resort.svg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Apartment',
    icon: 'apartment.svg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    "name": "Beach House",
    "icon": "icon-1736181348027-281616744.svg",
  }
];

// bookings seed
const now = new Date();
const pastHourOffset = 60 * 60 * 1000; // 1 hour in milliseconds

const bookings = [
  {
    checkInDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    checkOutDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    roomTypeIndex: 0, // Instead of roomId: 1
    propertyIndex: 0, // Instead of propertyId: 1
    customerIndex: 0, // Instead of customerId: 1, references Ucup uwuw
    room_qty: 1,
    status: 'CONFIRMED'
  },
  {
    checkInDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    checkOutDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    roomTypeIndex: 1,
    propertyIndex: 1,
    customerIndex: 1, // Acong Madura
    room_qty: 2,
    status: 'WAITING_FOR_PAYMENT'
  },
  {
    checkInDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    roomTypeIndex: 2,
    propertyIndex: 2,
    customerIndex: 2, // Udin Petot
    checkOutDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    room_qty: 1,
    status: 'WAITING_FOR_CONFIRMATION'
  },
  {
    checkInDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    checkOutDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    roomTypeIndex: 0,
    propertyIndex: 0,
    customerIndex: 3, // Ahmad Bejo
    room_qty: 1,
    status: 'CONFIRMED'
  }
];

// Variable to store PropertyRoomType seeds
// Integrated Room Data for Each Property
const propertyRoomTypes = [
  // Property 1
  {
    name: 'Kamar Standar',
    price: 1200000,
    qty: 10,
    guestCapacity: 2,
    propertyIndex: 0,
    description: 'A cozy standard room with essential amenities, perfect for two guests.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Kamar Deluxe',
    price: 1800000,
    qty: 8,
    guestCapacity: 4,
    propertyIndex: 0,
    description: 'A spacious deluxe room with added comfort and luxury, suitable for families.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Suite Premium',
    price: 3000000,
    qty: 5,
    guestCapacity: 3,
    propertyIndex: 0,
    description: 'An elegant premium suite with top-notch amenities for a luxurious stay.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Property 2
  {
    name: 'Villa Private',
    price: 5000000,
    qty: 2,
    guestCapacity: 5,
    propertyIndex: 1,
    description: 'A private villa with exclusive facilities, perfect for families or groups.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Kamar Keluarga',
    price: 2500000,
    qty: 7,
    guestCapacity: 4,
    propertyIndex: 1,
    description: 'A family room designed for comfort and convenience with ample space.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Kamar Romantis',
    price: 4000000,
    qty: 3,
    guestCapacity: 2,
    propertyIndex: 1,
    description: 'A romantic room for couples, featuring a cozy and intimate ambiance.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Property 3
  {
    name: 'Kamar Pantai',
    price: 2000000,
    qty: 6,
    guestCapacity: 6,
    propertyIndex: 2,
    description: 'A beachfront room with direct access to the serene lake view.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Kamar Deluxe',
    price: 1800000,
    qty: 8,
    guestCapacity: 4,
    propertyIndex: 2,
    description: 'A deluxe room providing comfort and functionality for families or groups.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Suite Premium',
    price: 3000000,
    qty: 5,
    guestCapacity: 3,
    propertyIndex: 2,
    description: 'A premium suite with luxurious furnishings and modern amenities.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Property 4
  {
    name: 'Kamar Standar',
    price: 1200000,
    qty: 10,
    guestCapacity: 2,
    propertyIndex: 3,
    description: 'A standard room with a warm and inviting atmosphere.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Villa Private',
    price: 5000000,
    qty: 2,
    guestCapacity: 5,
    propertyIndex: 3,
    description: 'A private villa offering unmatched privacy and comfort for guests.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Kamar Keluarga',
    price: 2500000,
    qty: 7,
    guestCapacity: 4,
    propertyIndex: 3,
    description: 'A spacious family room perfect for a relaxing vacation.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Property 5
  {
    name: 'Kamar Deluxe',
    price: 1800000,
    qty: 8,
    guestCapacity: 4,
    propertyIndex: 4,
    description: 'A deluxe room with stylish interiors and modern amenities.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Suite Premium',
    price: 3000000,
    qty: 5,
    guestCapacity: 3,
    propertyIndex: 4,
    description: 'A luxurious premium suite designed for comfort and elegance.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Kamar Pantai',
    price: 2000000,
    qty: 6,
    guestCapacity: 6,
    propertyIndex: 4,
    description: 'A beachfront room offering breathtaking views and cozy interiors.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Helper function to generate a range of dates
function generateDateRange(startDate, days) {
  const range = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    range.push(date);
  }
  return range;
}

// Generate specific date ranges
const today = new Date();
const next3Days = generateDateRange(today, 3); // 3 days from today
const christmasRange = generateDateRange(new Date('2024-12-25'), 4); // Dec 25-28
const newYearRange = [new Date('2024-12-31')]; // New Year's Eve


// Helper function to create date ranges
function createDateRange(start, end) {
  return {
    startDate: start,
    endDate: end
  };
}

// Generate specific date ranges
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);

// Define date ranges for different periods
const dateRanges = [
  // Next 3 days range
  {
    startDate: today,
    endDate: new Date(today.getTime() + (2 * 24 * 60 * 60 * 1000)), // today + 2 days
    priceMultiplier: 0.9 // 10% discount
  },
  // Christmas period
  {
    startDate: new Date('2024-12-25'),
    endDate: new Date('2024-12-28'),
    priceMultiplier: 1.2 // 20% markup
  },
  // New Year period
  {
    startDate: new Date('2024-12-31'),
    endDate: new Date('2025-01-01'),
    priceMultiplier: 1.5 // 50% markup
  }
];

async function main() {
  try {
    // Wrap everything in a transaction
    await prisma.$transaction(async (tx) => {
      // Disable foreign key constraints
      await tx.$executeRaw`SET session_replication_role = 'replica'`;

      // Clean existing data
      await tx.status.deleteMany({});
      await tx.booking.deleteMany({});
      await tx.flexiblePrice.deleteMany({});
      await tx.roomImage.deleteMany({});
      await tx.roomType.deleteMany({});
      await tx.propertyImage.deleteMany({});
      await tx.property.deleteMany({});
      await tx.tenant.deleteMany({});
      await tx.customer.deleteMany({});
      await tx.propFacility.deleteMany({});
      await tx.roomFacility.deleteMany({});
      await tx.category.deleteMany({});
      await tx.roomUnavailability.deleteMany({});

      await resetSequences();

      const createdCategories = await Promise.all(
        categories.map(async (category) => {
          const existing = await tx.category.findFirst({
            where: { name: category.name }
          });
          
          if (!existing) {
            return await tx.category.create({
              data: category
            });
          }
          return existing;
        })
      );
      
      // Create a map for easy category lookup
      const categoryMap = new Map(
        createdCategories.map(cat => [cat.name, cat.id])
      );
      
      console.log('Created Categories:', createdCategories);
      console.log('Category Map:', Array.from(categoryMap.entries()));

      // Create customers
      const createdCustomers = await Promise.all(
        customers.map(customer =>
          tx.customer.create({
            data: {
              ...customer,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })
        )
      );

      // Create tenants
      const createdTenants = await Promise.all(
        tenants.map(tenant =>
          tx.tenant.create({
            data: {
              ...tenant,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })
        )
      );

      // Create properties
      const createdProperties = await Promise.all(
        properties.map(async (property) => {
          const { tenantIndex, category: categoryName, ...rest } = property;
          const categoryId = categoryMap.get(categoryName);
      
          if (!categoryId) {
            throw new Error(`Category not found for property: ${property.name}, category: ${categoryName}`);
          }
      
          const propertyData = {
            ...rest,
            categoryId,
            tenantId: createdTenants[tenantIndex].id,
            createdAt: new Date(),
            updatedAt: new Date()
          };
      
          console.log('Creating property with data:', propertyData);
      
          return await tx.property.create({
            data: propertyData
          });
        })
      );

      // Create room types
      const createdRoomTypes = await Promise.all(
        propertyRoomTypes.map(roomType => {
          const { propertyIndex, ...rest } = roomType;
          return tx.roomType.create({
            data: {
              ...rest,
              propertyId: createdProperties[propertyIndex].id,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
        })
      );

      const flexiblePrices = [];
      createdRoomTypes.forEach(roomType => {
        const basePrice = roomType.price;
        dateRanges.forEach(range => {
          flexiblePrices.push({
            startDate: range.startDate,
            endDate: range.endDate,
            customPrice: Math.round(Number(basePrice) * range.priceMultiplier),
            roomTypeId: roomType.id
          });
        });
      });

      // Create some room unavailability periods
      const roomUnavailability = [];
      createdRoomTypes.forEach(roomType => {
        // Example: Make some rooms unavailable for maintenance
        roomUnavailability.push({
          roomTypeId: roomType.id,
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-01-20'),
          reason: 'Scheduled maintenance'
        });
        
        // Example: Block some rooms during a special event
        roomUnavailability.push({
          roomTypeId: roomType.id,
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-02-05'),
          reason: 'Reserved for event'
        });
      });


      // Create property facilities
      await Promise.all(
        propertiesFacilities.map(facility =>
          tx.propFacility.create({
            data: facility
          })
        )
      );

      // Create room facilities
      await Promise.all(
        roomsFacilities.map(facility =>
          tx.roomFacility.create({
            data: facility
          })
        )
      );

      // Generate and create flexible prices
      // const flexiblePrices = [];
      // createdRoomTypes.forEach(roomType => {
      //   const basePrice = roomType.price;
        
      //   next3Days.forEach(date => {
      //     flexiblePrices.push({
      //       customPrice: Math.round(basePrice * 0.9),
      //       customDate: date,
      //       roomTypeId: roomType.id
      //     });
      //   });

      //   christmasRange.forEach(date => {
      //     flexiblePrices.push({
      //       customPrice: Math.round(basePrice * 1.2),
      //       customDate: date,
      //       roomTypeId: roomType.id
      //     });
      //   });

      //   newYearRange.forEach(date => {
      //     flexiblePrices.push({
      //       customPrice: Math.round(basePrice * 1.5),
      //       customDate: date,
      //       roomTypeId: roomType.id
      //     });
      //   });
      // });

      await Promise.all(
        flexiblePrices.map(price =>
          tx.flexiblePrice.create({
            data: price
          })
        )
      );

      // Create bookings
      await Promise.all(
        bookings.map(async (booking) => {
          const checkInDate = booking.checkInDate;
          const expiryDate = new Date(checkInDate.getTime() + pastHourOffset);
      
          // Find a flexible price for the booking date range
          const flexiblePrice = await tx.flexiblePrice.findFirst({
            where: {
              roomTypeId: createdRoomTypes[booking.roomTypeIndex].id,
              AND: [
                { startDate: { lte: checkInDate } },
                { endDate: { gte: checkInDate } }
              ]
            }
          });
      
          // Use flexible price if found; otherwise, use base price
          const price = flexiblePrice
            ? flexiblePrice.customPrice
            : createdRoomTypes[booking.roomTypeIndex].price;
      
          // Check for room unavailability (optional, based on business logic)
          const isUnavailable = await tx.roomUnavailability.findFirst({
            where: {
              roomTypeId: createdRoomTypes[booking.roomTypeIndex].id,
              AND: [
                { startDate: { lte: booking.checkOutDate } },
                { endDate: { gte: booking.checkInDate } }
              ]
            }
          });
      
          if (isUnavailable) {
            throw new Error(
              `Room type ${createdRoomTypes[booking.roomTypeIndex].id} is unavailable for the selected date range.`
            );
          }
      
          // Create the booking
          return tx.booking.create({
            data: {
              checkInDate: booking.checkInDate,
              checkOutDate: booking.checkOutDate,
              expiryDate,
              roomId: createdRoomTypes[booking.roomTypeIndex].id,
              propertyId: createdProperties[booking.propertyIndex].id,
              customerId: createdCustomers[booking.customerIndex].id,
              room_qty: booking.room_qty,
              price,
              status: {
                create: {
                  Status: booking.status
                }
              }
            }
          });
        })
      );

      // Re-enable foreign key constraints
      await tx.$executeRaw`SET session_replication_role = 'origin'`;
    }, {
      maxWait: 10000, // 10s maximum wait to start transaction
      timeout: 60000  // 60s maximum transaction duration
    });

    console.log('Database seeded successfully');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.log(error);
});
