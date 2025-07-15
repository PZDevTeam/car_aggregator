import { config } from '../../../config';
import { defineMileage } from './defineMileage';
import { defineYear } from './defineYear';

type parseByInterestCarsProps = {
  title: string;
  price: string;
  speciphication: string;
  location: string;
  detailUrl: string;
};

type parseByInterestCarsValue = {
  brand: string;
  model: string;
  price: number;
  mileage: number;
  location: string;
  detailUrl: string;
  year: number | null;
};

function parseByInterestCars({
  title,
  price,
  speciphication,
  location,
  detailUrl,
}: parseByInterestCarsProps) {
  const lowercase = title.toLowerCase();
  const priceFloat = parseFloat(price.split(' ').join(''));
  const speciphicationLower = speciphication.toLowerCase();
  let isInQuery: parseByInterestCarsValue | null = null;

  config.liquidCars.forEach((car) => {
    if (
      lowercase.indexOf(car.brand.toLowerCase()) >= 0 &&
      lowercase.indexOf(car.model.toLowerCase()) >= 0 &&
      !isInQuery
    ) {
      isInQuery = {
        brand: car.brand,
        model: car.model,
        price: priceFloat,
        mileage: defineMileage(speciphicationLower),
        year: defineYear(title),
        location,
        detailUrl,
      };
    }
  }, []);

  return isInQuery as parseByInterestCarsValue | null;
}

export { parseByInterestCars };
