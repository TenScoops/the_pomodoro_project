export type QueryResult = {
  data: unknown;
  error: unknown;
};

export type QueryBuilder = {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  upsert: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  gte: jest.Mock;
  lte: jest.Mock;
  lt: jest.Mock;
  gt: jest.Mock;
  order: jest.Mock;
  limit: jest.Mock;
  single: jest.Mock;
  maybeSingle: jest.Mock;
  then: (
    resolve: (value: QueryResult) => unknown,
    reject?: (reason: unknown) => unknown
  ) => Promise<unknown>;
};

/** Chainable stand-in for `supabase.from(...).select()...` that can also be awaited. */
export function createQueryBuilder(result: QueryResult = { data: null, error: null }): QueryBuilder {
  const builder = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    eq: jest.fn(),
    gte: jest.fn(),
    lte: jest.fn(),
    lt: jest.fn(),
    gt: jest.fn(),
    order: jest.fn(),
    limit: jest.fn(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
    then: (
      resolve: (value: QueryResult) => unknown,
      reject?: (reason: unknown) => unknown
    ) => Promise.resolve(result).then(resolve, reject),
  };

  const chainMethods = [
    "select",
    "insert",
    "update",
    "upsert",
    "delete",
    "eq",
    "gte",
    "lte",
    "lt",
    "gt",
    "order",
    "limit",
  ] as const;

  for (const methodName of chainMethods) {
    builder[methodName].mockReturnValue(builder);
  }

  builder.single.mockResolvedValue(result);
  builder.maybeSingle.mockResolvedValue(result);

  return builder;
}
