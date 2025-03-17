export interface CarNickType {
  address: string;
  cityId: number;
  carType: number;
  damagePercent: number;
}

export interface CarType {
  id: number;
  brand: string;
  carName: string;
  image: string;
  qualityLvl: number;
  basePrice: number;
  link: string;
}
