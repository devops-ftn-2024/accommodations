import { EventQueue } from "../gateway/event-queue";
import { AccommodationRepository } from "../repository/accommodation-repository";
import { Accommodation, AccommodationInput } from "../types/accommodation";
import { BadRequestError, ForbiddenError, InternalServerError } from "../types/errors";
import { LoggedUser, Role, UsernameDTO } from "../types/user";
import { Logger } from "../util/logger";
import { validateAccommodationInput } from "../util/validation";


export class AccommodationService {
    private repository: AccommodationRepository;
    private eventQueue: EventQueue;

    constructor() {
        this.repository = new AccommodationRepository();
        this.eventQueue = new EventQueue(this);
    }

    async getAccommodation(id: string) {
        if (!id) {
            Logger.error("BadRequestError: Missing id parameter");
            throw new BadRequestError("Missing id parameter");
        }
        return this.repository.getAccommodation(id);
    }

    async createAccommodation(loggedUser: LoggedUser, accommodationInput: AccommodationInput) {
        Logger.log('Creating new accommodation');
        if (loggedUser?.role !== Role.HOST) {
            Logger.error("ForbiddenError: Only hosts can create accommodations");
            throw new ForbiddenError("Only hosts can create accommodations");
        }
        if (!loggedUser?.username) {
            Logger.error("BadRequestError: Missing logged user username parameter");
            throw new BadRequestError("Missing logged user username parameter");
        }
        validateAccommodationInput(accommodationInput);
        const accommodation: Accommodation = { 
            ...accommodationInput, 
            ownerUsername: loggedUser.username, 
            confirmationNeeded: !!accommodationInput.confirmationNeeded,
            rating: 0,
            ratingsArray: []
        };
        const accommodationId = await this.repository.createAccommodation(accommodation);
        Logger.log(`New accommodation created with id: ${accommodationId}`);
        try {
            const accommodationData = {
                accommodationId,
                ownerUsername: loggedUser.username,
                priceLevel: accommodation.priceLevel,
                confirmationNeeded: accommodation.confirmationNeeded,
                location: accommodation.location,
                minCapacity: accommodation.minCapacity,
                maxCapacity: accommodation.maxCapacity,

            }
            Logger.log(`Emitting accommodation-created event: ${JSON.stringify(accommodationData)}`);
            this.eventQueue.execute(accommodationData, 'accommodation-created');
            return {
                _id: accommodationId,
                ...accommodation
            };
        } catch (err) {
            console.error(err);
            throw new InternalServerError('Failed to emit user-registered event');
        }
    }

    async getAccommodationByUser(user: LoggedUser) {
        Logger.log(`Getting all accommodations which belongs to user: ${JSON.stringify(user)}`);
        if (!user?.username) {
            Logger.error("BadRequestError: Missing username parameter");
            throw new BadRequestError("Missing username parameter");
        }
        if (user.role !== Role.HOST) {
            Logger.error("ForbiddenError: Only hosts can get accommodations by user");
            throw new ForbiddenError("Only hosts can get accommodations by user");
        }
        return this.repository.getAccommodationByUser(user.username);
    }

    async updateUsername(usernameDTO: UsernameDTO) {
        Logger.log(`Updating username from ${usernameDTO.oldUsername} to ${usernameDTO.newUsername}`);
        if (!usernameDTO?.oldUsername || !usernameDTO?.newUsername) {
            Logger.error("BadRequestError: Missing username parameter");
            throw new BadRequestError("Missing username parameter");
        }
        return this.repository.updateUsername(usernameDTO);
    }

    async deleteAccommodationsByHost(ownerUsername: string) {
        Logger.log(`Deleting accommodations with owner: ${ownerUsername}`);
        return this.repository.deleteAccommodation(ownerUsername);
    }

    async addRating(accommodationId: string, rating: number) {
        Logger.log(`Adding rating ${rating} to accommodation with id: ${accommodationId}`);
        return this.repository.addRating(accommodationId, rating);
    }
}