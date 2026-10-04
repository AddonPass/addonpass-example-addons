export const ADDON_ID = "com.addonpass.example.subscription";
export const ADDON_NAME = "AddonPass Subscription Example";

const CATALOG_ID = "addonpass-example";

// Big Buck Bunny © Blender Foundation, CC BY 3.0.
const MOVIE = {
  id: "tt1254207",
  type: "movie",
  name: "Big Buck Bunny",
  poster: "https://images.metahub.space/poster/medium/tt1254207/img",
};

const manifest = {
  id: ADDON_ID,
  version: "1.0.0",
  name: ADDON_NAME,
  description:
    "Example addon. Every route needs a paid AddonPass subscription.",
  resources: ["catalog", "stream"],
  types: ["movie"],
  idPrefixes: ["tt"],
  catalogs: [{ type: "movie", id: CATALOG_ID, name: "AddonPass example" }],
};

/** Answers one Stremio request. `route` is { resource, type, id }. */
export function respond(route) {
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
        streams:
          isMovie && route.id === MOVIE.id
            ? [
                {
                  name: "Example",
                  title: "Big Buck Bunny · 720p",
                  url: "https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4",
                },
              ]
            : [],
      });
    default:
      return new Response(null, { status: 404 });
  }
}
