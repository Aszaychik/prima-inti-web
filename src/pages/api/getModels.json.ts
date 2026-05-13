export const prerender = false;
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const make = url.searchParams.get("make");

	if (!make) {
		return new Response(JSON.stringify({ error: "Invalid search parameters" }), {
			status: 400,
			headers: { "content-type": "application/json" },
		});
	}

	const allMakes = await getCollection("cars", ({ data }) => {
		return data.general.make === make;
	});

	const allModelNames = allMakes.map((model) => model.data.general.model);
	// console.log(allModelNames);

	if (!allModelNames || allModelNames.length === 0) {
		return new Response(JSON.stringify({ error: "No models found" }), {
			status: 404,
			headers: { "content-type": "application/json" },
		});
	}

	return new Response(JSON.stringify(allModelNames), {
		status: 200,
		headers: { "content-type": "application/json" },
	});
};
