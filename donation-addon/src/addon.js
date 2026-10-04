// One addon, two versions. The free version is public. The donor version
// has its own id, name, logo and background, and adds a 720p stream.

export const DONOR_ID = "com.addonpass.example.donation.donor";
export const DONOR_NAME = "AddonPass Donation Example · Donor";

const CATALOG_ID = "addonpass-example";

// Big Buck Bunny © Blender Foundation, CC BY 3.0.
const MOVIE = {
  id: "tt1254207",
  type: "movie",
  name: "Big Buck Bunny",
  poster: "https://images.metahub.space/poster/medium/tt1254207/img",
};

const SD_STREAM = {
  name: "Example",
  title: "Big Buck Bunny · SD",
  url: "https://archive.org/download/BigBuckBunny_328/BigBuckBunny_512kb.mp4",
};

const HD_STREAM = {
  name: "Example",
  title: "Big Buck Bunny · 720p · donors",
  url: "https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4",
};

/** Returns a function that answers one Stremio request for one version. */
export function createAddon({ publicUrl, donor }) {
  const manifest = {
    id: donor ? DONOR_ID : "com.addonpass.example.donation",
    version: "1.0.0",
    name: donor ? DONOR_NAME : "AddonPass Donation Example",
    description: donor
      ? "Donor version with 720p. Thank you for donating."
      : "Free example addon. Donate once to unlock the 720p donor version.",
    logo: `${publicUrl}/assets/${donor ? "donor" : "free"}-logo.png`,
    ...(donor
      ? { background: `${publicUrl}/assets/donor-background.png` }
      : {}),
    resources: ["catalog", "stream"],
    types: ["movie"],
    idPrefixes: ["tt"],
    catalogs: [{ type: "movie", id: CATALOG_ID, name: "AddonPass example" }],
  };
  const streams = donor ? [HD_STREAM, SD_STREAM] : [SD_STREAM];

  // `route` is { resource, type, id }.
  return (route) => {
    const isMovie = route.type === MOVIE.type;
    switch (route.resource) {
      case "manifest":
        return Response.json(manifest);
      case "catalog":
        return Response.json({
          metas: isMovie && route.id === CATALOG_ID ? [MOVIE] : [],
        });
      case "stream":
        return Response.json({
          streams: isMovie && route.id === MOVIE.id ? streams : [],
        });
      default:
        return new Response(null, { status: 404 });
    }
  };
}
