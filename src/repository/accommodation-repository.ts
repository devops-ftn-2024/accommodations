import { Collection, MongoClient, ObjectId, WithId } from "mongodb";
import { Accommodation } from "../types/accommodation";

interface MongoAccommodation extends Omit<Accommodation, '_id'> {
    _id?: ObjectId;
}


export class AccommodationRepository {

    private client: MongoClient;
    private database_name: string;
    private collection_name: string;
    private collection: Collection<MongoAccommodation>;

    constructor() {
        if (!process.env.MONGO_URI) {
            throw new Error("Missing MONGO_URI environment variable");
        }
        if (!process.env.MONGO_DB_NAME) {
            throw new Error("Missing MONGO_DB_NAME environment variable");
        }
        if (!process.env.MONGO_COLLECTION_NAME) {
            throw new Error("Missing MONGO_COLLECTION_NAME environment variable");
        }
        this.client = new MongoClient(process.env.MONGO_URI);
        this.database_name = process.env.MONGO_DB_NAME;
        this.collection_name = process.env.MONGO_COLLECTION_NAME;
        this.collection = this.client.db(this.database_name).collection(this.collection_name);
    }

    async getAccommodation(id: string) {
        return this.collection.findOne({ '_id': new ObjectId(id) });
    }

    async createAccommodation(accommodation: Accommodation) {
        const {_id, ...accommodationData} = accommodation;
        const result = await this.collection.insertOne(accommodationData);
        console.log(result);
        return result.insertedId;
    }

    async getAccommodationByUser(username: string) {
        return this.collection.find({ ownerUsername: username }).toArray();
    }
}