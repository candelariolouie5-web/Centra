export interface Patient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  age: number | null;
  gender: string | null;
  address: string | null;
  image?: string | null;
  createdAt: string;
  // Optional fields from API
  chiefComplaints?: string | null;
  remarks?: string | null;
  notes?: string | null;
  soapNote?: any;
}

