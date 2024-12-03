const {PrismaClient} = require("@prisma/client")
const prisma = new PrismaClient()

// Variable to store tenants seed
const tenants = [
    {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "securepassword123", // Ensure you hash passwords in production
      profileImage: "https://example.com/images/john_doe.jpg",
      IdCardImage: "https://example.com/images/john_doe_id.jpg",
      resetPasswordToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      password: "anothersecurepassword", // Ensure you hash passwords in production
      profileImage: "https://example.com/images/jane_smith.jpg",
      IdCardImage: "https://example.com/images/jane_smith_id.jpg",
      resetPasswordToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      password: "yetanotherpassword", // Ensure you hash passwords in production
      profileImage: "https://example.com/images/bob_johnson.jpg",
      IdCardImage: "https://example.com/images/bob_johnson_id.jpg",
      resetPasswordToken: "resetTokenExample123", // Example of a reset token
      createdAt: new Date(),
      updatedAt: new Date(),
    },
];

// variable to store properties seed
var properties = [
    {
        name: "Ocean View Apartments",
        address: "123 Seaside Lane, Sydney, Australia",
        roomCapacity: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
        tenantId: 1,
    },
    {
        name: "Urban Oasis Hotel",
        address: "45 City Center Road, Melbourne, Australia",
        roomCapacity: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        tenantId: 2,
    },
    {
        name: "Mountain Retreat Lodge",
        address: "78 Hillside Drive, Brisbane, Australia",
        roomCapacity: 15,
        createdAt: new Date(),
        updatedAt: new Date(),
        tenantId: 3,
    }, 
]

// Variable to store PropertyRoomType seeds
const propertyRoomTypes = [
    {
      name: "Standard Room",
      price: 100.00, 
      propertyId: 1, 
      qty: 10, 
    },
    {
      name: "Deluxe Room",
      price: 150.00, 
      propertyId: 1, 
      qty: 5, 
    },
    {
      name: "Suite",
      price: 250.00, 
      propertyId: 2, 
      qty: 3, 
    },
    {
      name: "Family Room",
      price: 200.00, 
      propertyId: 3, 
      qty: 7, 
    },
];

// variable to store room seeds
const rooms = [
    {
      guestCapacity: 2,
      propertyRoomTypeId: 1, 
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      guestCapacity: 4,
      propertyRoomTypeId: 1, 
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      guestCapacity: 3,
      propertyRoomTypeId: 2, 
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      guestCapacity: 5,
      propertyRoomTypeId: 2, 
      createdAt: new Date(),
      updatedAt: new Date(),
    },
];

// variable to store propertyRoomType seed


async function main(){
    // Temporarily disable foreign key constraints
    await prisma.$executeRaw`SET session_replication_role = 'replica'`;
    
    // truncate selected schemas before seeding
    await prisma.room.deleteMany({})
    await prisma.propertyRoomType.deleteMany({})
    await prisma.tenant.deleteMany({})
    await prisma.property.deleteMany({})

    // Re-enable foreign key constraints
    await prisma.$executeRaw`SET session_replication_role = 'origin'`;

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