/** Resolve public research assets for Vite development and /green-index/ deployment. */
export const researchAsset = (path:string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
export const vegetationBase = researchAsset('data/philadelphia/vegetation-2d');
