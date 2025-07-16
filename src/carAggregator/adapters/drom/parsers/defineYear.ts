function defineYear(title: string): number {
  return +(title.match(/\d+/)?.[0] || '');
}

export { defineYear };
