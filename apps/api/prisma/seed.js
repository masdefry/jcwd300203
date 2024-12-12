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
    resetPasswordToken: null,
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
    resetPasswordToken: null,
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
    resetPasswordToken: 'reset',
    role: 'tenant',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// variable to store properties seed
var properties = [
  {
    name: 'Pantai Sumatera Residences',
    address: 'Jl. Tepi Pantai No. 45, Padang, Sumatra Barat, Indonesia',
    roomCapacity: 20,
    mainImage: 'https://example.com/images/rizki_pratama_id.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantId: 1,
  },
  {
    name: 'Hutan Kalimantan Lodge',
    address: 'Jl. Rimba Tropis No. 12, Pontianak, Kalimantan Barat, Indonesia',
    roomCapacity: 30,
    mainImage: 'https://example.com/images/rizki_pratama_id.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantId: 2,
  },
  {
    name: 'Danau Sulawesi Retreat',
    address: 'Jl. Pinggir Danau No. 8, Manado, Sulawesi Utara, Indonesia',
    roomCapacity: 15,
    mainImage: 'https://example.com/images/rizki_pratama_id.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantId: 3,
  },
  {
    name: 'Pegunungan Papua Resort',
    address: 'Jl. Puncak Jaya No. 77, Jayapura, Papua, Indonesia',
    roomCapacity: 25,
    mainImage: 'https://example.com/images/rizki_pratama_id.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantId: 1,
  },
  {
    name: 'Puncak Jawa Villa',
    address: 'Jl. Puncak Gunung No. 90, Bandung, Jawa Barat, Indonesia',
    roomCapacity: 50,
    mainImage: 'https://example.com/images/rizki_pratama_id.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantId: 2,
  },
  {
    name: 'Sawah Bali Retreat',
    address: 'Jl. Tegallalang No. 101, Ubud, Bali, Indonesia',
    roomCapacity: 18,
    mainImage: 'https://example.com/images/rizki_pratama_id.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantId: 3,
  },
  {
    name: 'Pantai Lombok Paradise',
    address:
      'Jl. Pantai Kuta No. 33, Lombok Tengah, Nusa Tenggara Barat, Indonesia',
    roomCapacity: 10,
    mainImage: 'https://example.com/images/rizki_pratama_id.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantId: 1,
  },
];

const bookings = [
  {
    id: 1,
    checkInDate: new Date('2024-12-20T14:00:00Z'),
    checkOutDate: new Date('2024-12-25T12:00:00Z'),
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
    checkInDate: new Date('2024-12-22T14:00:00Z'),
    checkOutDate: new Date('2024-12-24T12:00:00Z'),
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
    checkInDate: new Date('2024-12-25T14:00:00Z'),
    checkOutDate: new Date('2024-12-30T12:00:00Z'),
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
    checkInDate: new Date('2024-12-28T14:00:00Z'),
    checkOutDate: new Date('2025-01-02T12:00:00Z'),
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
const propertyRoomTypes = [
  {
    id: 1,
    name: 'Kamar Standar',
    price: 1200000,
    propertyId: 1,
    qty: 10,
  },
  {
    id: 2,
    name: 'Kamar Deluxe',
    price: 1800000,
    propertyId: 2,
    qty: 8,
  },
  {
    id: 3,
    name: 'Suite Premium',
    price: 3000000,
    propertyId: 3,
    qty: 5,
  },
  {
    id: 4,
    name: 'Villa Private',
    price: 5000000,
    propertyId: 4,
    qty: 2,
  },
  {
    id: 5,
    name: 'Kamar Keluarga',
    price: 2500000,
    propertyId: 5,
    qty: 7,
  },
  {
    id: 6,
    name: 'Kamar Romantis',
    price: 4000000,
    propertyId: 6,
    qty: 3,
  },
  {
    id: 7,
    name: 'Kamar Pantai',
    price: 2000000,
    propertyId: 7,
    qty: 6,
  },
];

// Variable to store room seeds
const rooms = [
  {
    id: 1,
    guestCapacity: 2,
    propertyRoomTypeId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    guestCapacity: 4,
    propertyRoomTypeId: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    guestCapacity: 3,
    propertyRoomTypeId: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    guestCapacity: 5,
    propertyRoomTypeId: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    guestCapacity: 4,
    propertyRoomTypeId: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6,
    guestCapacity: 2,
    propertyRoomTypeId: 6,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 7,
    guestCapacity: 6,
    propertyRoomTypeId: 7,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function main() {
  // Temporarily disable foreign key constraints
  await prisma.$executeRaw`SET session_replication_role = 'replica'`;

  // truncate selected schemas before seeding
  await prisma.customer.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.propertyRoomType.deleteMany({});
  await prisma.tenant.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.booking.deleteMany({});

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
    await prisma.propertyRoomType.create({ data: propertyRoomType });
  }

  // Seed rooms
  for (const room of rooms) {
    await prisma.room.create({ data: room });
  }

  for (const booking of bookings) {
    await prisma.booking.create({ data: booking });
  }
}

main().catch((error) => {
  console.log(error);
});
