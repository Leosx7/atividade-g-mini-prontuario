import type { Request, Response } from "express";
import type { MedicationsService } from "../services/medications.service";
export function createMedicationsController(service: MedicationsService) {
  return {
    async listByEncounter(request: Request, response: Response) { response.status(200).json(await service.listMedicationsByEncounter(Number(request.params.encounterId))); },
    async create(request: Request, response: Response) { response.status(201).json(await service.createMedication(Number(request.params.encounterId), request.body)); },
  };
}
