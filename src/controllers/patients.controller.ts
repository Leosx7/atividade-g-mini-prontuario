import type { Request, Response } from "express";
import type { PatientsService } from "../services/patients.service";
import { UnprocessableEntityError } from "../errors/HttpError";
export function createPatientsController(service: PatientsService) {
  return {
    async list(_request: Request, response: Response) { response.status(200).json(await service.listPatients()); },
    async getById(request: Request, response: Response) { response.status(200).json(await service.getPatientById(Number(request.params.id))); },
    async create(request: Request, response: Response) { response.status(201).json(await service.createPatient(request.body)); },
    async uploadPhoto(request: Request, response: Response) {
      if (!request.file) throw new UnprocessableEntityError("Envie o arquivo no campo 'photo'.");
      response.status(200).json(await service.setPatientPhoto(Number(request.params.id), `/uploads/${request.file.filename}`));
    },
  };
}
