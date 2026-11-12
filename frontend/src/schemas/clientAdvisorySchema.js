import { z } from 'zod';

export const advisoryInputSchema = z.object({
  cropName: z.string().min(2, "Crop name is required"),
  growthStage: z.enum(["Germination", "Vegetative", "Flowering", "Fruiting", "Maturity"]),
  soilType: z.enum(["Sandy", "Clay", "Loamy", "Silt", "Peat"]),
  irrigationType: z.enum(["Drip", "Sprinkler", "Flood", "Rainfed"]),
  symptomsDescription: z.string().min(10, "Please provide a detailed description of symptoms (at least 10 characters)")
});

