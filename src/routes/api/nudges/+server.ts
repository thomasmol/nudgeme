import type { RequestHandler } from './$types';
import openai from '$lib/openai';
import prisma from '$lib/database';
import type { Nudge } from '@prisma/client';
// using this function results in error, so now done at client side
// something about servers i suppose
// import { v4 } from 'uuid';

export const POST = (async ({ request, locals }) => {
	const { prompt } = await request.json();
	const session = await locals.getSession();
	const promptPrefix = 'Create 1 encouraging nudge that will encourage me to do the following:';
	const response = await openai.createCompletion({
		model: 'text-davinci-003',
		prompt: `${promptPrefix} ${prompt}.`,
		temperature: 0.5,
		n: 1,
		max_tokens: 150
	});
	const nudgeText: string = response.data.choices[0].text?.replaceAll('"', '') ?? '';

	const nudge: Nudge = await prisma.nudge.create({
		data: {
			//@ts-expect-error issue https://authjs.dev/reference/utilities
			userId: session?.user?.id ?? 'anonymous',
			text:nudgeText,
			prompt: prompt,
			promptPrefix: promptPrefix,
			feedback: '',
			reaction:'',
			createdAt: new Date()
		}
	});
	return new Response(JSON.stringify(nudge));
}) satisfies RequestHandler;


export const GET = (async ({locals}) => {
	const session = await locals.getSession();
	const nudges = await prisma.nudge.findMany({
		where: {
			//@ts-expect-error issue https://authjs.dev/reference/utilities
			userId: session?.user?.id ?? 'anonymous'
		}
	});
	return new Response(JSON.stringify(nudges));
}) satisfies RequestHandler;


