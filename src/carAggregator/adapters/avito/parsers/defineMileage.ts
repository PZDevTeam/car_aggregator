function defineMileage(speciphication: string) {
  return parseFloat(
    speciphication
      .slice(0, speciphication.indexOf('км'))
      .trim()
      .split(' ')
      .join(''),
  );
}

export { defineMileage };
