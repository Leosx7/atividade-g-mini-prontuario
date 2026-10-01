import type { Request, Response } from "express";
import type { EncountersService } from "../services/encounters.service";
export function createEncountersController(service: EncountersService) {
  return {
    async listByPatient(request: Request, response: Response) { response.status(200).json(await service.listEncountersByPatient(Number(request.params.id))); },
    async create(request: Request, response: Response) { response.status(201).json(await service.createEncounter(Number(request.params.id), request.body, request.user)); },
  };
}
