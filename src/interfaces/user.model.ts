import { Business } from "./business.model";
import { Country } from "./country.model";

export interface User {
  id?: string;
  bolsiyoId?: string;
  username?: string;
  email: string;
  business: Business[];
  country: Country;
  name: string;
  lastName?: string;
  docType: string;
  docNumber: string;
  expeditionDate?: string;
  cellPhone: string;
  profileImage?: string;
  smallThumbnail: string;
  mediumThumbnail: string;
  largeThumbnail: string;
  address?: string;
  createdAt: Date;
  isComplete?: boolean;
  cellPhoneVerified: boolean;
  phoneNumber: string;
  stateRegister: string;
  state: boolean;
}
