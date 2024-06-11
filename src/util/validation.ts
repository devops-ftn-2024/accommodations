import { AccommodationInput } from "../types/accommodation";
import { BadRequestError } from "../types/errors";

export const validateAccommodationInput = (accommodation: AccommodationInput) => {
    if (!accommodation.name) {
        throw new BadRequestError("Missing name parameter");
    }
    if (!accommodation.location) {
        throw new BadRequestError("Missing location parameter");
    }
    if (!accommodation.benefits) {
        throw new BadRequestError("Missing benefits parameter");
    }
    if (!accommodation.images) {
        throw new BadRequestError("Missing images parameter");
    }
    if (!accommodation.minCapacity) {
        throw new BadRequestError("Missing minCapacity parameter");
    }
    if (!accommodation.maxCapacity) {
        throw new BadRequestError("Missing maxCapacity parameter");
    }
    if (!accommodation.priceLevel) {
        throw new BadRequestError("Missing priceLevel parameter");
    }
};