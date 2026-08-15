/// <reference types="react-scripts" />

declare module "*.css";

declare module "*.webp" {
  const src: string;
  export default src;
}
