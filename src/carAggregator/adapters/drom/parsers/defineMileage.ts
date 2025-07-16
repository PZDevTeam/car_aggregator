function defineMileage(speciphication: string) {
  const mileageString =
    speciphication.match(/\d+ \d+ км/) || speciphication.match(/\d+ км/);

  if (mileageString) {
    return parseFloat(mileageString[0].replace('км', '').trim());
  }

  return 0;
}

export { defineMileage };
