const {MongoClient} = require('mongodb');

async function main() {
    const uri = "mongodb+srv://demo:Demo2468@cluster0.xte8j.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";    

    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        
        await updateAllListingsToHavePropertyType(client);

        // await upsertListingByName(client, "Cozy Cottage", { name: "Cozy Cottage", bedrooms: 2, bathrooms: 1 });

        // await updateListingByName(client, "Infinite Views", { bedrooms: 6, beds: 8 });

        // await findListingsWithMinimumBedroomsBathroomsAndMostRecentReviews(client, {
        //     minimumNumberOfBedrooms: 4,
        //     minimumNumberOfBathrooms: 2,
        //     maximumNumberOfResults: 5
        // });

        // await findOneListingByName(client, "Infinite Views");

        // await createMultipleListings(client, [
        //     {
        //         name: "Infinite Views",
        //         summary: "Modern home with infinite views from the infinity pool",
        //         property_type: "House",
        //         bedrooms: 5,
        //         bathrooms: 4.5,
        //         beds: 5
        //     },
        //     {
        //         name: "Private room in London",
        //         property_type: "Apartment",
        //         bedrooms: 1,
        //         bathroom: 1
        //     },
        //     {
        //         name: "Beautiful Beach House",
        //         summary: "Enjoy relaxed beach living in this house with a private beach",
        //         bedrooms: 4,
        //         bathrooms: 2.5,
        //         beds: 7,
        //         last_review: new Date()
        //     }
        // ]);

    } catch(e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);

async function updateAllListingsToHavePropertyType(client) {
    const result = await client.db("sample_airbnb").collection("ListingsAndReviews")
                        .updateMany({ property_type: { $exists: false } },
                                    { $set: { property_type: "Unknown" } });
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

async function upsertListingByName(client, nameOfListing, updatedListing) {
    const result = await client.db("sample_airbnb").collection("ListingsAndReviews")
                        .updateOne({ name: nameOfListing },
                                   { $set: updatedListing },
                                   { upsert: true });
    
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    if (result.upsertedCount > 0) {
        console.log(`One document was inserted with the id ${result.upsertedId._id}`);
    } else {
        console.log(`${result.modifiedCount} document(s) was/were updated.`);
    }
}

async function updateListingByName(client, nameOfListing, updatedListing) {
    const result = await client.db("sample_airbnb").collection("ListingsAndReviews")
                    .updateOne({name: nameOfListing}, {$set: updatedListing});
    
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

async function findListingsWithMinimumBedroomsBathroomsAndMostRecentReviews(client, {
    minimumNumberOfBedrooms = 0,
    minimumNumberOfBathrooms = 0,
    maximumNumberOfResults = Number.MAX_SAFE_INTEGER
} = {}) {
    const cursor = await client.db("sample_airbnb").collection("ListingsAndReviews").find(
        {
            bedrooms: {$gte: minimumNumberOfBedrooms},  //$gte is comparison query operator
            bathrooms: {$gte: minimumNumberOfBathrooms}
        })
        .sort({ last_review: -1 })
        .limit(maximumNumberOfResults);
    
    const results = await cursor.toArray();

    if (results.length > 0) {
        console.log(`Found listing(s) with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms: `);
        results.forEach((result, i) => {
            date = new Date(result.last_review).toDateString();

            console.log();
            console.log(`   _id: ${result._id}`);
            console.log(`   bedrooms: ${result.bedrooms}`);
            console.log(`   bathrooms: ${result.bathrooms}`);
            console.log(`   most recent review date: ${new Date(result.last_review).toDateString()}`);
        });
    } else {
        console.log(`No listing(s) with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms: `);
    }
}

async function findOneListingByName(client, nameOfListing) {
    const result = await client.db("sample_airbnb").collection("ListingsAndReviews").findOne({name: nameOfListing});

    if (result) {
        console.log(`Found a listing in the collection with the name ${nameOfListing}`);
        console.log(result);
    } else {
        console.log(`No listing found with the name ${nameOfListing}`);
    }
}

async function createMultipleListings(client, newListings) {
    const result = await client.db("sample_airbnb").collection("ListingsAndReviews")
    .insertMany(newListings);

    console.log(`${result.insertedCount} new listings created with the following id(s): `);
    console.log(result.insertedIds);
}

async function createListing(client, newListing) {
    const result = await client.db("sample_airbnb").collection("ListingsAndReviews")
    .insertOne(newListing);

    console.log(`New listing created with the following id: ${result.insertedId}`);
}

async function listDatabases(client) {
    const databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => {
        console.log(`- ${db.name}`);
        
    });
}