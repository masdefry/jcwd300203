import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

export const hashPassword = async (password) => {
  const saltRounds = 15;
  return await bcrypt.hash(password, saltRounds);
};

const prisma = new PrismaClient();

// Variable to store customer seeds
var customers = [
  {
    id: 1,
    name: 'Ucup uwuw',
    username: 'ucupslebew',
    email: 'ucup@gmail.com',
    password: await hashPassword('11111111'),
  },
  {
    id: 2,
    name: 'Acong Madura',
    username: 'acongmadura',
    email: 'acong@gmail.com',
    password: await hashPassword('11111111'),
  },
  {
    id: 3,
    name: 'Udin Petot',
    username: 'udinpetot',
    email: 'udinpetot@gmail.com',
    password: await hashPassword('11111111'),
  },
  {
    id: 4,
    name: 'Ahmad Bejo',
    username: 'ahmadbejo',
    email: 'ahmadbejo@gmail.com',
    password: await hashPassword('11111111'),
  },
];

// Variable to store tenants seed
const tenants = [
  {
    id: 1,
    name: 'Adi Putra',
    username: 'adi_putra',
    email: 'adi.putra@example.com',
    password: await hashPassword('11111111'),
    profileImage: 'https://example.com/images/adi_putra.jpg',
    IdCardImage: 'https://example.com/images/adi_putra_id.jpg',
    role: 'tenant',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: 'Siti Aisyah',
    username: 'siti_aisyah',
    email: 'siti.aisyah@example.com',
    password: await hashPassword('11111111'),
    profileImage: 'https://example.com/images/siti_aisyah.jpg',
    IdCardImage: 'https://example.com/images/siti_aisyah_id.jpg',
    role: 'tenant',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: 'Rizki Pratama',
    username: 'rizki_pratama',
    email: 'rizki.pratama@example.com',
    password: await hashPassword('11111111'),
    profileImage: 'https://example.com/images/rizki_pratama.jpg',
    IdCardImage: 'https://example.com/images/rizki_pratama_id.jpg',
    role: 'tenant',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// variable to store properties seed
var properties = [
  {
    id: 1,
    name: 'Pantai Sumatera Residences',
    address: 'Jl. Tepi Pantai No. 45, Padang, Sumatra Barat, Indonesia',
    city: 'Padang',
    category: 'Apartement',
    roomCapacity: 20,
    mainImage: 'https://example.com/images/rizki_pratama_id.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantId: 1,
  },
  {
    id: 2,
    name: 'Hutan Kalimantan Lodge',
    address: 'Jl. Rimba Tropis No. 12, Pontianak, Kalimantan Barat, Indonesia',
    city: 'Pontianak',
    category: 'Villa',
    roomCapacity: 30,
    mainImage: 'https://example.com/images/rizki_pratama_id.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantId: 2,
  },
  {
    id: 3,
    name: 'Danau Sulawesi Retreat',
    address: 'Jl. Pinggir Danau No. 8, Manado, Sulawesi Utara, Indonesia',
    city: 'Manado',
    category: 'Villa',
    roomCapacity: 15,
    mainImage: 'https://example.com/images/rizki_pratama_id.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantId: 3,
  },
  {
    id: 4,
    name: 'Pegunungan Papua Resort',
    address: 'Jl. Puncak Jaya No. 77, Jayapura, Papua, Indonesia',
    city: 'Jayapura',
    category: 'Hotel',
    roomCapacity: 25,
    mainImage: 'https://example.com/images/rizki_pratama_id.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantId: 1,
  },
  {
    id: 5,
    name: 'Puncak Jawa Villa',
    address: 'Jl. Puncak Gunung No. 90, Bandung, Jawa Barat, Indonesia',
    city: 'Bandung',
    category: 'Villa',
    roomCapacity: 50,
    mainImage: 'https://example.com/images/rizki_pratama_id.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantId: 2,
  },
  {
    id: 6,
    name: 'Sawah Bali Retreat',
    address: 'Jl. Tegallalang No. 101, Ubud, Bali, Indonesia',
    city: 'Bali',
    category: 'Hotel',
    roomCapacity: 18,
    mainImage: 'https://example.com/images/rizki_pratama_id.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantId: 3,
  },
  {
    id: 7,
    name: 'Pantai Lombok Paradise',
    address:'Jl. Pantai Kuta No. 33, Lombok Tengah, Nusa Tenggara Barat, Indonesia',
    city: 'Lombok',
    category: 'Villa',
    roomCapacity: 10,
    mainImage: 'https://example.com/images/rizki_pratama_id.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantId: 1,
  },
];

// bookings seed
const now = new Date();
const pastHourOffset = 60 * 60 * 1000; // 1 hour in milliseconds

const bookings = [
  {
    id: 1,
    checkInDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    checkOutDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    expiryDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + pastHourOffset), // 1 hour after checkInDate
    roomId: 1,
    propertyId: 1,
    customerId: 1, // Ucup uwuw
    room_qty: 1,
    status: {
      create: {
        Status: 'CONFIRMED',
      },
    },
  },
  {
    id: 2,
    checkInDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    checkOutDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    expiryDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 + pastHourOffset), // 1 hour after checkInDate
    roomId: 2,
    propertyId: 2,
    customerId: 2, // Acong Madura
    room_qty: 2,
    status: {
      create: {
        Status: 'WAITING_FOR_PAYMENT',
      },
    },
  },
  {
    id: 3,
    checkInDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    checkOutDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    expiryDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + pastHourOffset), // 1 hour after checkInDate
    roomId: 3,
    propertyId: 3,
    customerId: 3, // Udin Petot
    room_qty: 1,
    status: {
      create: {
        Status: 'WAITING_FOR_CONFIRMATION',
      },
    },
  },
  {
    id: 4,
    checkInDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    checkOutDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    expiryDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000 + pastHourOffset), // 1 hour after checkInDate
    roomId: 1,
    propertyId: 1,
    customerId: 4, // Ahmad Bejo
    room_qty: 1,
    status: {
      create: {
        Status: 'CONFIRMED',
      },
    },
  },
];

// Variable to store PropertyRoomType seeds
// Integrated Room Data for Each Property
const propertyRoomTypes = [
  // Property 1
  {
    id: 1,
    name: 'Kamar Standar',
    price: 1200000,
    qty: 10,
    guestCapacity: 2,
    propertyId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: 'Kamar Deluxe',
    price: 1800000,
    qty: 8,
    guestCapacity: 4,
    propertyId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: 'Suite Premium',
    price: 3000000,
    qty: 5,
    guestCapacity: 3,
    propertyId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Property 2
  {
    id: 4,
    name: 'Villa Private',
    price: 5000000,
    qty: 2,
    guestCapacity: 5,
    propertyId: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    name: 'Kamar Keluarga',
    price: 2500000,
    qty: 7,
    guestCapacity: 4,
    propertyId: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6,
    name: 'Kamar Romantis',
    price: 4000000,
    qty: 3,
    guestCapacity: 2,
    propertyId: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Property 3
  {
    id: 7,
    name: 'Kamar Pantai',
    price: 2000000,
    qty: 6,
    guestCapacity: 6,
    propertyId: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 8,
    name: 'Kamar Deluxe',
    price: 1800000,
    qty: 8,
    guestCapacity: 4,
    propertyId: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 9,
    name: 'Suite Premium',
    price: 3000000,
    qty: 5,
    guestCapacity: 3,
    propertyId: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Property 4
  {
    id: 10,
    name: 'Kamar Standar',
    price: 1200000,
    qty: 10,
    guestCapacity: 2,
    propertyId: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 11,
    name: 'Villa Private',
    price: 5000000,
    qty: 2,
    guestCapacity: 5,
    propertyId: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 12,
    name: 'Kamar Keluarga',
    price: 2500000,
    qty: 7,
    guestCapacity: 4,
    propertyId: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Property 5
  {
    id: 13,
    name: 'Kamar Deluxe',
    price: 1800000,
    qty: 8,
    guestCapacity: 4,
    propertyId: 6,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 14,
    name: 'Suite Premium',
    price: 3000000,
    qty: 5,
    guestCapacity: 3,
    propertyId: 6,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 15,
    name: 'Kamar Pantai',
    price: 2000000,
    qty: 6,
    guestCapacity: 6,
    propertyId: 6,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
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

// Flexible Prices for each PropertyRoomType
const flexiblePrices = [];

// Generate flexible prices for each date and PropertyRoomType
for (const roomType of propertyRoomTypes) {
  const basePrice = roomType.price;
  const roomTypeId = roomType.id;
  // Add flexible prices for the next 3 days
  next3Days.forEach((date) => {
    flexiblePrices.push({
      customPrice: Math.round(basePrice * 0.9),
      customDate: date,
      roomTypeId: roomTypeId,
    });
  });

  // Add flexible prices for the Christmas range
  christmasRange.forEach((date) => {
    flexiblePrices.push({
      customPrice: Math.round(basePrice * 1.2),
      customDate: date,
      roomTypeId: roomTypeId,
    });
  });

  // Add flexible price for New Year's Eve
  newYearRange.forEach((date) => {
    flexiblePrices.push({
      customPrice: Math.round(basePrice * 1.5),
      customDate: date,
      roomTypeId: roomTypeId,
    });
  });
}

async function main() {

  // Temporarily disable foreign key constraints
  await prisma.$executeRaw`SET session_replication_role = 'replica'`;

  // truncate selected schemas before seeding
  await prisma.status.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.flexiblePrice.deleteMany({});
  await prisma.roomType.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.tenant.deleteMany({});
  await prisma.customer.deleteMany({});

  // Re-enable foreign key constraints
  await prisma.$executeRaw`SET session_replication_role = 'origin'`;

  // Seed customers
  for (const customer of customers) {
    await prisma.customer.create({ data: customer });
  }

  // Seed tenants
  for (const tenant of tenants) {
    await prisma.tenant.create({ data: tenant });
  }

  // Seed properties
  for (const property of properties) {
    await prisma.property.create({ data: property });
  }

  // Seed propertyRoomTypes
  for (const propertyRoomType of propertyRoomTypes) {
    await prisma.roomType.create({ data: propertyRoomType });
  }

  // Seed rooms
  // for (const room of rooms) {
  //   await prisma.room.create({ data: room });
  // }
  
  // Seed flexible prices
  for (const flexiblePrice of flexiblePrices) {
    await prisma.flexiblePrice.create({ data: flexiblePrice });
  }  

  // Seed Booking
  for (const booking of bookings) {
    // Step 1: Find flexible pricing for the check-in date and room type
    const flexiblePrice = await prisma.flexiblePrice.findFirst({
      where: {
        customDate: booking.checkInDate,
        roomTypeId: booking.roomId, // Assuming roomId matches roomType.id
      },
    });

    // Step 2: Fetch default room price if no flexible price exists
    const roomType = await prisma.roomType.findUnique({
      where: { id: booking.roomId },
    });

    // Step 3: Set the price dynamically
    const price = flexiblePrice ? flexiblePrice.customPrice : roomType.price;

    // Step 4: Add the price to the booking
    await prisma.booking.create({
      data: {
        ...booking,
        price: price, // Populate the price dynamically
      },
    });
  }
}

main().catch((error) => {
  console.log(error);
});
