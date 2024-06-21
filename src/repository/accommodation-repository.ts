import { Collection, MongoClient, ObjectId, WithId } from "mongodb";
import { Accommodation } from "../types/accommodation";
import { UsernameDTO } from "../types/user";
import { Logger } from "../util/logger";

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
        Logger.log(`Getting accommodation with id: ${id}`);
        return this.collection.findOne({ '_id': new ObjectId(id) });
    }

    async createAccommodation(accommodation: Accommodation) {
        Logger.log('Creating new accommodation');
        const {_id, ...accommodationData} = accommodation;
        const result = await this.collection.insertOne(accommodationData);
        console.log(result);
        return result.insertedId;
    }

    async getAccommodationByUser(username: string) {
        Logger.log(`Getting all accommodations which belongs to user: ${username}`);
        return this.collection.find({ ownerUsername: username }).toArray();
    }

    async updateUsername(usernameDTO: UsernameDTO) {
        Logger.log(`Updating username from ${usernameDTO.oldUsername} to ${usernameDTO.newUsername}`);
        const { oldUsername, newUsername } = usernameDTO;
        const result = await this.collection.updateMany({ ownerUsername: oldUsername }, { $set: { ownerUsername: newUsername } });
        return result.modifiedCount;
    }

    async deleteAccommodation(ownerUsername: string) {
        Logger.log(`Deleting accommodations with host: ${ownerUsername}`);
        await this.collection.deleteMany({ ownerUsername });
    }

    async addRating(id: string, rating: number) {
        Logger.log(`Adding rating ${rating} to accommodation with id: ${id}`);
        const accommodation = await this.collection.findOne({ '_id': new ObjectId(id) });
        const ratingsArray = accommodation.ratingsArray || [];
        ratingsArray.push(rating);
        const newRating = ratingsArray.reduce((a, b) => a + b, 0) / ratingsArray.length;
        await this.collection.updateOne({ '_id': new ObjectId(id) }, { $set: { rating: newRating, ratingsArray } });
    }
}