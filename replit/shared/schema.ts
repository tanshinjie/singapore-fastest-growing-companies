import { z } from "zod";

// Company data schema based on the CSV structure
export const companySchema = z.object({
  rank: z.number(),
  name: z.string(),
  sector: z.string(),
  absoluteGrowthRate: z.number(),
  cagr: z.number(),
  revenueLatest: z.number(),
  revenueBase: z.number(),
  employeesLatest: z.number(),
  employeesBase: z.number(),
  foundingYear: z.number(),
  website: z.string().url().optional(),
  year: z.number(), // The year this data represents
});

export const companiesArraySchema = z.array(companySchema);

export type Company = z.infer<typeof companySchema>;
export type CompaniesArray = z.infer<typeof companiesArraySchema>;

// Filter schemas
export const filterSchema = z.object({
  selectedYears: z.array(z.number()),
  selectedSectors: z.array(z.string()),
  foundingYearRange: z.tuple([z.number(), z.number()]),
  searchTerm: z.string().optional(),
});

export type Filter = z.infer<typeof filterSchema>;

// Chart data schemas
export const chartDataSchema = z.object({
  companies: companiesArraySchema,
  chartType: z.enum(['growth', 'scatter', 'sector']),
});

export type ChartData = z.infer<typeof chartDataSchema>;
