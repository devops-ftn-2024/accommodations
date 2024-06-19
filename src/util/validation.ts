import { AccommodationInput } from "../types/accommodation";
import { BadRequestError } from "../types/errors";
import { Logger } from "./logger";

export const validateAccommodationInput = (accommodation: AccommodationInput) => {
    Logger.log('Validating accommodation input');
    if (!accommodation.name) {
        Logger.error("BadRequestError: Missing name parameter");
        throw new BadRequestError("Missing name parameter");
    }
    if (!accommodation.location) {
        Logger.error("BadRequestError: Missing location parameter");
        throw new BadRequestError("Missing location parameter");
    }
    if (!accommodation.benefits) {
        Logger.error("BadRequestError: Missing benefits parameter");
        throw new BadRequestError("Missing benefits parameter");
    }
    if (!accommodation.images) {
        Logger.error("BadRequestError: Missing images parameter");
        throw new BadRequestError("Missing images parameter");
    }
    if (!accommodation.minCapacity) {
        Logger.error("BadRequestError: Missing minCapacity parameter");
        throw new BadRequestError("Missing minCapacity parameter");
    }
    if (!accommodation.maxCapacity) {
        Logger.error("BadRequestError: Missing maxCapacity parameter");
        throw new BadRequestError("Missing maxCapacity parameter");
    }
    if (!accommodation.priceLevel) {
        Logger.error("BadRequestError: Missing priceLevel parameter");
        throw new BadRequestError("Missing priceLevel parameter");
    }
};