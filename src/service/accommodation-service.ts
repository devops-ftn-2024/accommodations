import { EventQueue } from "../gateway/event-queue";
import { AccommodationRepository } from "../repository/accommodation-repository";
import { Accommodation, AccommodationInput, PriceLevel } from "../types/accommodation";
import { BadRequestError, ForbiddenError, InternalServerError } from "../types/errors";
import { LoggedUser, Role, UsernameDTO } from "../types/user";
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
            throw new BadRequestError("Missing id parameter");
        }
        return this.repository.getAccommodation(id);
    }

    async createAccommodation(loggedUser: LoggedUser, accommodationInput: AccommodationInput) {
        if (loggedUser?.role !== Role.HOST) {
            throw new ForbiddenError("Only hosts can create accommodations");
        }
        if (!loggedUser?.username) {
            throw new BadRequestError("Missing logged user username parameter");
        }
        validateAccommodationInput(accommodationInput);
        const accommodation: Accommodation = { 
            ...accommodationInput, 
            ownerUsername: loggedUser.username, 
            confirmationNeeded: !!accommodationInput.confirmationNeeded,
            rating: 0,
        };
        const accommodationId = await this.repository.createAccommodation(accommodation);
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
        if (!user?.username) {
            throw new BadRequestError("Missing username parameter");
        }
        if (user.role !== Role.HOST) {
            throw new ForbiddenError("Only hosts can get accommodations by user");
        }
        return this.repository.getAccommodationByUser(user.username);
    }

    async updateUsername(usernameDTO: UsernameDTO) {
        if (!usernameDTO?.oldUsername || !usernameDTO?.newUsername) {
            throw new BadRequestError("Missing username parameter");
        }
        return this.repository.updateUsername(usernameDTO);
    }

}