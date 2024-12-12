import bcrypt from 'bcrypt';
import {PrismaClient} from '@prisma/client'

export const hashPassword = async (password) => {
    const saltRounds = 15
    return await bcrypt.hash(password, saltRounds)
}

const prisma = new PrismaClient()
// Variable to store customer seeds

var customers = [
  {
    name: "Ucup uwuw",
    username: "ucupslebew",
    email: "ucup@gmail.com", 
    password: await hashPassword("11111111")
  },
  {
    name: "Acong Madura",
    username: "acongmadura",
    email: "acong@gmail.com",
    password: await hashPassword("11111111")
  },
  {
    name: "Udin Petot",
    username: "udinpetot",
    email: "udinpetot@gmail.com",
    password: await hashPassword("11111111")
  },
  {
    name: "Ahmad Bejo",
    username: "ahmadbejo",
    email: "ahmadbejo@gmail.com",
    password: await hashPassword("11111111")
  }
]

// Variable to store tenants seed
const tenants = [
  {
    id: 1,
    name: "Adi Putra",
    username: "adi_putra",
    email: "adi.putra@example.com",
    password: await hashPassword("11111111"),
    profileImage: "https://example.com/images/adi_putra.jpg",
    IdCardImage: "https://example.com/images/adi_putra_id.jpg",
    resetPasswordToken: null,
    role: "tenant",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  { 
    id: 2,
    name: "Siti Aisyah",
    username: "siti_aisyah",
    email: "siti.aisyah@example.com",
    password: await hashPassword("11111111"),
    profileImage: "https://example.com/images/siti_aisyah.jpg",
    IdCardImage: "https://example.com/images/siti_aisyah_id.jpg",
    resetPasswordToken: null,
    role: "tenant",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: "Rizki Pratama",
    username: "rizki_pratama",
    email: "rizki.pratama@example.com",
    password: await hashPassword("11111111"), 
    profileImage: "https://example.com/images/rizki_pratama.jpg",
    IdCardImage: "https://example.com/images/rizki_pratama_id.jpg",
    resetPasswordToken: "reset",
    role: "tenant",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// variable to store properties seed
var properties = [
  {
    name: "Pantai Sumatera Residences",
    address: "Jl. Tepi Pantai No. 45, Padang, Sumatra Barat, Indonesia",
    roomCapacity: 20,
    mainImage: "https://example.com/images/rizki_pratama_id.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantId: 1,
  },
  {
    name: "Hutan Kalimantan Lodge",
    address: "Jl. Rimba Tropis No. 12, Pontianak, Kalimantan Barat, Indonesia",
    roomCapacity: 30,
    mainImage: "https://example.com/images/rizki_pratama_id.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantId: 2,
  },
  {
    name: "Danau Sulawesi Retreat",
    address: "Jl. Pinggir Danau No. 8, Manado, Sulawesi Utara, Indonesia",
    roomCapacity: 15,
    mainImage: "https://example.com/images/rizki_pratama_id.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantId: 3,
  },
  {
    name: "Pegunungan Papua Resort",
    address: "Jl. Puncak Jaya No. 77, Jayapura, Papua, Indonesia",
    roomCapacity: 25,
    mainImage: "https://example.com/images/rizki_pratama_id.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantId: 1,
  },
  {
    name: "Puncak Jawa Villa",
    address: "Jl. Puncak Gunung No. 90, Bandung, Jawa Barat, Indonesia",
    roomCapacity: 50,
    mainImage: "https://example.com/images/rizki_pratama_id.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantId: 2,
  },
  {
    name: "Sawah Bali Retreat",
    address: "Jl. Tegallalang No. 101, Ubud, Bali, Indonesia",
    roomCapacity: 18,
    mainImage: "https://example.com/images/rizki_pratama_id.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantId: 3,
  },
  {
    name: "Pantai Lombok Paradise",
    address: "Jl. Pantai Kuta No. 33, Lombok Tengah, Nusa Tenggara Barat, Indonesia",
    roomCapacity: 10,
    mainImage: "https://example.com/images/rizki_pratama_id.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantId: 1,
  },
];

// Variable to store PropertyRoomType seeds
const propertyRoomTypes = [
  {
    name: "Kamar Standar",
    price: 1200000, 
    propertyId: 1,
    qty: 10,
  },
  {
    name: "Kamar Deluxe",
    price: 1800000,
    propertyId: 2,
    qty: 8,
  },
  {
    name: "Suite Premium",
    price: 3000000,
    propertyId: 3,
    qty: 5,
  },
  {
    name: "Villa Private",
    price: 5000000,
    propertyId: 4,
    qty: 2,
  },
  {
    name: "Kamar Keluarga",
    price: 2500000,
    propertyId: 5,
    qty: 7,
  },
  {
    name: "Kamar Romantis",
    price: 4000000,
    propertyId: 6,
    qty: 3,
  },
  {
    name: "Kamar Pantai",
    price: 2000000,
    propertyId: 7,
    qty: 6,
  },
];

// Variable to store room seeds
const rooms = [
  {
    guestCapacity: 2,
    propertyRoomTypeId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    guestCapacity: 4,
    propertyRoomTypeId: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    guestCapacity: 3,
    propertyRoomTypeId: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    guestCapacity: 5,
    propertyRoomTypeId: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    guestCapacity: 4,
    propertyRoomTypeId: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    guestCapacity: 2,
    propertyRoomTypeId: 6,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    guestCapacity: 6,
    propertyRoomTypeId: 7,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function main(){
    // Temporarily disable foreign key constraints
     await prisma.$executeRaw`SET session_replication_role = 'replica'`;
    
    // truncate selected schemas before seeding
     await prisma.customer.deleteMany({})
     await prisma.room.deleteMany({})
     await prisma.propertyRoomType.deleteMany({})
     await prisma.tenant.deleteMany({})
     await prisma.property.deleteMany({})
  
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
  
}

main().catch((error) => {
    console.log(error)
})