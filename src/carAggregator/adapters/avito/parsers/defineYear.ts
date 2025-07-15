function defineYear(title: string) {
  const num = title.match(/\d\d\d\d/g);
  return num ? +num[0] : null;
}

export { defineYear };
