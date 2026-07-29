-- Update patients with data from Appointment table
UPDATE patients 
SET age = (
  SELECT age FROM "Appointment" 
  WHERE "patientId" = patients.id 
  ORDER BY "createdAt" DESC 
  LIMIT 1
),
phone = (
  SELECT "contactNumber" FROM "Appointment" 
  WHERE "patientId" = patients.id 
  ORDER BY "createdAt" DESC 
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 FROM "Appointment" 
  WHERE "patientId" = patients.id 
  AND (age IS NOT NULL OR "contactNumber" IS NOT NULL)
);