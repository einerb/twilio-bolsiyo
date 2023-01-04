import { Business } from "./business.model";
import { Country } from "./country.model";

export enum States {
  CELLPHONE = "Por verificar teléfono",
  COMPLETE = "Por aceptar invitación o crear negocio",
  VERIFIED = "Verificado",
}

export interface User {
  id?: string;
  bolsiyoId?: string;
  username: string;
  email: string;
  business?: Business[];
  country?: Country;
  name: string;
  lastName?: string;
  docType: string;
  docNumber: string;
  expeditionDate?: string;
  cellPhone: string;
  profileImage?: string;
  smallThumbnail?: string;
  mediumThumbnail?: string;
  largeThumbnail?: string;
  address?: string;
  createdAt?: string;
  isComplete?: boolean;
  cellPhoneVerified?: boolean;
  phoneNumber?: string;
  stateRegister?: States;
  state?: boolean;
}
