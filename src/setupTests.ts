import "@testing-library/jest-dom";

// Dummy values so importing `supabaseClient` never throws in CI.
process.env.REACT_APP_SUPABASE_URL =
  process.env.REACT_APP_SUPABASE_URL || "http://localhost";
process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY =
  process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "test-anon-key";

jest.mock("./lib/supabaseClient", () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
    from: jest.fn(),
  },
}));
