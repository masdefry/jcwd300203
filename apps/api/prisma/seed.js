const {PrismaClient} = require("@prisma/client")
const prisma = new PrismaClient()

// variable to store tenants seed
var tenants = [



]

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
    // truncate properties and rooms schema
    await prisma.property.deleteMany({})
    await prisma.room.deleteMany({})

    // populate properties array with items from
    // properties array
    properties.forEach(async (item) => {
        await prisma.property.create(
            {data: item}
        )
    })

    // populate rooms schema with item on 
    
}

main().catch((error) => {
    console.log(error)
})