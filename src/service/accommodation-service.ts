import { AccommodationRepository } from "../repository/accommodation-repository";
import { Accommodation, AccommodationInput } from "../types/accommodation";
import { BadRequestError, ForbiddenError } from "../types/errors";
import { LoggedUser, Role } from "../types/user";
import { validateAccommodationInput } from "../util/validation";


export class AccommodationService {
    private repository: AccommodationRepository;

    constructor() {
        this.repository = new AccommodationRepository();
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
        }
            ;
        return this.repository.createAccommodation(accommodation);
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

}