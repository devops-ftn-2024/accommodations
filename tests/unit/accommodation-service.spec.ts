import { EventQueue } from "../../src/gateway/event-queue";
import { AccommodationRepository } from "../../src/repository/accommodation-repository";
import { AccommodationService } from "../../src/service/accommodation-service";
import { BadRequestError, ForbiddenError, InternalServerError } from "../../src/types/errors";
import { Role } from "../../src/types/user";
import { validateAccommodationInput } from "../../src/util/validation";
import {expect, jest, test} from '@jest/globals';

jest.mock('../../src/repository/accommodation-repository');
jest.mock('../../src/gateway/event-queue');
jest.mock('../../src/util/validation');

describe('AccommodationService', () => {
    let service;
    let repository;
    let eventQueue;

    beforeEach(() => {
        repository = new AccommodationRepository() as jest.Mocked<AccommodationRepository>;
        service = new AccommodationService();
        eventQueue = new EventQueue(service);
        (service as any).repository = repository;
        (service as any).eventQueue = eventQueue;
    });

    describe('getAccommodation', () => {
        test('should throw BadRequestError if id is missing', async () => {
            await expect(service.getAccommodation('')).rejects.toThrow(BadRequestError);
        });

        test('should call repository.getAccommodation with the correct id', async () => {
            const id = '123';
            await service.getAccommodation(id);
            expect(repository.getAccommodation).toHaveBeenCalledWith(id);
        });
    });

    describe('createAccommodation', () => {
        test('should throw ForbiddenError if logged user is not a host', async () => {
            const loggedUser = { role: Role.GUEST, username: 'user1' };
            await expect(service.createAccommodation(loggedUser, {})).rejects.toThrow(ForbiddenError);
        });

        test('should throw BadRequestError if logged user username is missing', async () => {
            const loggedUser = { role: Role.HOST };
            await expect(service.createAccommodation(loggedUser, {})).rejects.toThrow(BadRequestError);
        });

        test('should validate accommodation input', async () => {
            const loggedUser = { role: Role.HOST, username: 'host1' };
            const accommodationInput = { location: 'location1', priceLevel: 2, minCapacity: 1, maxCapacity: 4 };
            await service.createAccommodation(loggedUser, accommodationInput);
            expect(validateAccommodationInput).toHaveBeenCalledWith(accommodationInput);
        });

        test('should call repository.createAccommodation with the correct accommodation data', async () => {
            const loggedUser = { role: Role.HOST, username: 'host1' };
            const accommodationInput = { location: 'location1', priceLevel: 2, minCapacity: 1, maxCapacity: 4, confirmationNeeded: false };
            const accommodationId = '60f8f8f8f8f8f8f8f8f8f8f'; 
            repository.createAccommodation.mockResolvedValue(Promise.resolve(accommodationId));
            
            await service.createAccommodation(loggedUser, accommodationInput);
            expect(repository.createAccommodation).toHaveBeenCalledWith(expect.objectContaining({
                ownerUsername: loggedUser.username,
                location: accommodationInput.location,
                priceLevel: accommodationInput.priceLevel,
                minCapacity: accommodationInput.minCapacity,
                maxCapacity: accommodationInput.maxCapacity,
                confirmationNeeded: accommodationInput.confirmationNeeded,
                rating: 0,
            }));
        });

        test('should throw InternalServerError if eventQueue.execute fails', async () => {
            const loggedUser = { role: Role.HOST, username: 'host1' };
            const accommodationInput = { location: 'location1', priceLevel: 2, minCapacity: 1, maxCapacity: 4, confirmationNeeded: false };
            repository.createAccommodation.mockResolvedValue(Promise.resolve('60f8f8f8f8f8f8f8f8f8f8f'));
            eventQueue.execute.mockImplementation(() => { throw new Error('Failed to emit event') });

            await expect(service.createAccommodation(loggedUser, accommodationInput)).rejects.toThrow(InternalServerError);
        });
    });

    describe('getAccommodationByUser', () => {
        test('should throw BadRequestError if username is missing', async () => {
            const user = { role: Role.HOST };
            await expect(service.getAccommodationByUser(user)).rejects.toThrow(BadRequestError);
        });

        test('should throw ForbiddenError if user is not a host', async () => {
            const user = { role: Role.GUEST, username: 'user1' };
            await expect(service.getAccommodationByUser(user)).rejects.toThrow(ForbiddenError);
        });

        test('should call repository.getAccommodationByUser with the correct username', async () => {
            const user = { role: Role.HOST, username: 'host1' };
            await service.getAccommodationByUser(user);
            expect(repository.getAccommodationByUser).toHaveBeenCalledWith(user.username);
        });
    });

    describe('updateUsername', () => {
        test('should throw BadRequestError if oldUsername or newUsername is missing', async () => {
            const usernameDTO = { oldUsername: '', newUsername: 'newUser' };
            await expect(service.updateUsername(usernameDTO)).rejects.toThrow(BadRequestError);
        });

        test('should call repository.updateUsername with the correct usernameDTO', async () => {
            const usernameDTO = { oldUsername: 'oldUser', newUsername: 'newUser' };
            await service.updateUsername(usernameDTO);
            expect(repository.updateUsername).toHaveBeenCalledWith(usernameDTO);
        });
    });
});