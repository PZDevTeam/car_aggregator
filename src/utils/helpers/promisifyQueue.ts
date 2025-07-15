interface PromisifyQueueProps<T, R> {
  argumentsQueue: T[];
  func: (this: any, arg: T) => Promise<R>;
  index?: number;
  delay?: number;
  results?: R[];
  context?: any; // Контекст выполнения
}

async function promisifyQueue<T, R>({
  argumentsQueue,
  func,
  index = 0,
  delay = 10000,
  results = [],
  context = null, // По умолчанию null вместо {}
}: PromisifyQueueProps<T, R>): Promise<R[]> {
  if (index >= argumentsQueue.length) {
    return results;
  }

  try {
    // Вызываем функцию с контекстом
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await func.call(context, argumentsQueue[index]);
    results.push(result);

    if (index < argumentsQueue.length - 1) {
      if (delay > 0) {
        // eslint-disable-next-line prettier/prettier
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      return promisifyQueue({
        argumentsQueue,
        func,
        index: index + 1,
        delay,
        results,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        context, // Пробрасываем контекст дальше
      });
    }

    return results;
  } catch (error) {
    console.error(`Error at index ${index}:`, error);
    if (index < argumentsQueue.length - 1) {
      return promisifyQueue({
        argumentsQueue,
        func,
        index: index + 1,
        delay,
        results,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        context, // Пробрасываем контекст при ошибке
      });
    }
    return results;
  }
}

export { promisifyQueue };
