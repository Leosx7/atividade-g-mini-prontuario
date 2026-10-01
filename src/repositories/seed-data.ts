// Dados fictícios extraídos do seed original, compartilhados pelos adapters.
export const seedData = {
  "patients": [
    {
      "id": 1,
      "name": "Ana Beatriz Nogueira",
      "birthDate": "1991-03-14",
      "nationalId": "700012345678901",
      "photoUrl": null,
      "active": true
    },
    {
      "id": 2,
      "name": "Carlos Eduardo Matias",
      "birthDate": "1978-11-02",
      "nationalId": "700012345678902",
      "photoUrl": null,
      "active": true
    },
    {
      "id": 3,
      "name": "Dulcineia Rocha Lima",
      "birthDate": "1955-07-23",
      "nationalId": "700012345678903",
      "photoUrl": null,
      "active": true
    },
    {
      "id": 4,
      "name": "Eduardo Vasconcelos",
      "birthDate": "2003-01-09",
      "nationalId": "700012345678904",
      "photoUrl": null,
      "active": false
    },
    {
      "id": 5,
      "name": "Fernanda Passos Alves",
      "birthDate": "1986-09-30",
      "nationalId": "700012345678905",
      "photoUrl": null,
      "active": true
    },
    {
      "id": 6,
      "name": "Gustavo Rios Camelo",
      "birthDate": "1999-05-17",
      "nationalId": "700012345678906",
      "photoUrl": null,
      "active": true
    },
    {
      "id": 7,
      "name": "Helena Marques Sa",
      "birthDate": "1968-12-05",
      "nationalId": "700012345678907",
      "photoUrl": null,
      "active": false
    },
    {
      "id": 8,
      "name": "Igor Bastos Teixeira",
      "birthDate": "1994-08-21",
      "nationalId": "700012345678908",
      "photoUrl": null,
      "active": true
    }
  ],
  "encounters": [
    {
      "id": 1,
      "patientId": 1,
      "startedAt": "2026-08-03T08:15",
      "chiefComplaint": "Cefaleia ha tres dias",
      "notes": "Orientada hidratacao. Retorno em 7 dias."
    },
    {
      "id": 2,
      "patientId": 1,
      "startedAt": "2026-08-10T14:40",
      "chiefComplaint": "Retorno - cefaleia",
      "notes": "Melhora do quadro. Alta."
    },
    {
      "id": 3,
      "patientId": 2,
      "startedAt": "2026-07-29T10:05",
      "chiefComplaint": "Dor lombar apos esforco",
      "notes": "Repouso relativo e analgesia."
    },
    {
      "id": 4,
      "patientId": 3,
      "startedAt": "2026-08-11T09:00",
      "chiefComplaint": "Controle de pressao arterial",
      "notes": "PA 130x80. Mantida a medicacao."
    },
    {
      "id": 5,
      "patientId": 5,
      "startedAt": "2026-08-12T16:20",
      "chiefComplaint": "Tosse seca persistente",
      "notes": null
    }
  ],
  "medications": [
    {
      "id": 1,
      "encounterId": 1,
      "medication": "Dipirona 500mg",
      "dosage": "1 comprimido de 6/6h se dor, por 3 dias"
    },
    {
      "id": 2,
      "encounterId": 3,
      "medication": "Ciclobenzaprina 5mg",
      "dosage": "1 comprimido a noite por 5 dias"
    },
    {
      "id": 3,
      "encounterId": 4,
      "medication": "Losartana 50mg",
      "dosage": "1 comprimido pela manha, uso continuo"
    }
  ]
};
