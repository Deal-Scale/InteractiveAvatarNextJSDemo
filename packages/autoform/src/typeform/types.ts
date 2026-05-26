import { z } from "zod";

import { unwrapType, type FieldConfig } from "../utils/utils";

export type TypeformQuestionType =
	| "contactInfo"
	| "email"
	| "phoneNumber"
	| "address"
	| "website"
	| "multipleChoice"
	| "dropdown"
	| "pictureChoice"
	| "yesNo"
	| "legal"
	| "checkbox"
	| "nps"
	| "opinionScale"
	| "rating"
	| "ranking"
	| "matrix"
	| "longText"
	| "shortText"
	| "video"
	| "clarifyWithAI"
	| "payment"
	| "number"
	| "fileUpload"
	| "googleDrive"
	| "date"
	| "calendly"
	| "questionGroup"
	| "welcomeScreen"
	| "statement"
	| "endScreen"
	| "multiQuestionPage";

export const TYPEFORM_META_PREFIX = "typeform:";

const descriptionHas = (def: z.ZodTypeAny, needle: string) => {
	const raw =
		((def as any)?._def?.description as string | undefined) ??
		((def as any)?.description as string | undefined);
	const desc = raw?.toLowerCase?.();
	return desc ? desc.includes(needle.toLowerCase()) : false;
};

const getTypeName = (schema: z.ZodTypeAny | undefined): string | undefined => {
	if (!schema) return undefined;
	const def = (schema as any)?._def ?? {};
	return (
		(def.typeName as string | undefined) ??
		(def.type as string | undefined) ??
		((def.schema as any)?._def?.typeName as string | undefined) ??
		((def.schema as any)?._def?.type as string | undefined) ??
		undefined
	);
};

const normalizeMetaValue = (
	value: string,
): TypeformQuestionType | undefined => {
	const normalized = value
		.trim()
		.replace(/[^a-z0-9-]/gi, "")
		.toLowerCase();
	const mapping: Record<string, TypeformQuestionType> = {
		"contact-info": "contactInfo",
		contactinfo: "contactInfo",
		email: "email",
		"phone-number": "phoneNumber",
		phonenumber: "phoneNumber",
		address: "address",
		website: "website",
		"multiple-choice": "multipleChoice",
		multiplechoice: "multipleChoice",
		dropdown: "dropdown",
		"picture-choice": "pictureChoice",
		picturechoice: "pictureChoice",
		"yes-no": "yesNo",
		yesno: "yesNo",
		legal: "legal",
		checkbox: "checkbox",
		nps: "nps",
		"opinion-scale": "opinionScale",
		opinionscale: "opinionScale",
		rating: "rating",
		ranking: "ranking",
		matrix: "matrix",
		"long-text": "longText",
		longtext: "longText",
		"short-text": "shortText",
		shorttext: "shortText",
		video: "video",
		"clarify-with-ai": "clarifyWithAI",
		clarifywithai: "clarifyWithAI",
		payment: "payment",
		number: "number",
		"file-upload": "fileUpload",
		fileupload: "fileUpload",
		"google-drive": "googleDrive",
		googledrive: "googleDrive",
		date: "date",
		calendly: "calendly",
		"question-group": "questionGroup",
		questiongroup: "questionGroup",
		"welcome-screen": "welcomeScreen",
		welcomescreen: "welcomeScreen",
		statement: "statement",
		"end-screen": "endScreen",
		endscreen: "endScreen",
		"multi-question-page": "multiQuestionPage",
		multiquestionpage: "multiQuestionPage",
	};

	return mapping[normalized];
};

const parseTypeformMeta = (
	def: z.ZodTypeAny,
): TypeformQuestionType | undefined => {
	const desc =
		((def as any)?._def?.description as string | undefined) ??
		((def as any)?.description as string | undefined);
	if (!desc) return undefined;
	const match = desc.match(/typeform:([a-z0-9-]+)/i);
	if (!match) return undefined;
	return normalizeMetaValue(match[1]);
};

export const determineQuestionType = (
	def: z.ZodTypeAny,
	cfg: FieldConfig,
	name: string,
): TypeformQuestionType | undefined => {
	if (cfg.questionType) return cfg.questionType;

	const metaFromDescription = parseTypeformMeta(def);
	if (metaFromDescription) return metaFromDescription;

	const base = unwrapType(def);
	const typeName = getTypeName(base);

	if (!typeName) return undefined;

	if (typeName === "ZodObject" || typeName === "object") {
		if (
			descriptionHas(def, "contact info") ||
			descriptionHas(base, "contact info")
		) {
			return "contactInfo";
		}
		if (descriptionHas(def, "address")) {
			return "address";
		}
		if (descriptionHas(def, "question group")) {
			return "questionGroup";
		}
	}

	if (typeName === "ZodBoolean" || typeName === "boolean") {
		if (descriptionHas(def, "legal")) return "legal";
		if (descriptionHas(def, "consent")) return "checkbox";
		return "yesNo";
	}

	if (typeName === "ZodNumber" || typeName === "number") {
		if (descriptionHas(def, "nps")) return "nps";
		if (descriptionHas(def, "opinion")) return "opinionScale";
		if (descriptionHas(def, "rating")) return "rating";
		return "number";
	}

	if (typeName === "ZodDate" || typeName === "date") return "date";

	if (typeName === "ZodString" || typeName === "string") {
		const checks = ((base as any)?._def?.checks ?? []) as Array<{
			kind: string;
		}>;
		if (
			checks.some(
				(c) => (c as any)?.kind === "email" || (c as any)?.format === "email",
			)
		) {
			return "email";
		}
		if (
			checks.some(
				(c) => (c as any)?.kind === "url" || (c as any)?.format === "url",
			)
		) {
			return "website";
		}
		if (descriptionHas(def, "phone")) return "phoneNumber";
		if (descriptionHas(def, "address")) return "address";
		if (descriptionHas(def, "video")) return "video";
		if (descriptionHas(def, "clarify")) return "clarifyWithAI";
		if (cfg.widget === "textarea" || descriptionHas(def, "long text")) {
			return "longText";
		}
		if (descriptionHas(def, "short text")) return "shortText";
	}

	if (typeName === "ZodArray" || typeName === "array") {
		const element = unwrapType(
			((base as any)?._def?.type ?? null) as z.ZodTypeAny,
		);
		const elTypeName = getTypeName(element);
		if (
			(elTypeName === "ZodObject" || elTypeName === "object") &&
			cfg.questionSettings?.matrix
		) {
			return "matrix";
		}
		if (cfg.questionSettings?.ranking) return "ranking";
		if (cfg.multiple || descriptionHas(def, "multiple choice"))
			return "multipleChoice";
		if (elTypeName === "ZodString" || elTypeName === "string")
			return "multipleChoice";
	}

	if (cfg.options?.length) {
		if (cfg.questionSettings?.pictureChoice) return "pictureChoice";
		if (cfg.multiple) return "multipleChoice";
		if (cfg.widget === "select") return "dropdown";
		return "multipleChoice";
	}

	if (descriptionHas(def, "payment")) return "payment";
	if (descriptionHas(def, "file upload") || descriptionHas(def, "file"))
		return "fileUpload";
	if (descriptionHas(def, "google drive")) return "googleDrive";
	if (descriptionHas(def, "calendly")) return "calendly";
	if (descriptionHas(def, "statement")) return "statement";
	if (descriptionHas(def, "welcome")) return "welcomeScreen";
	if (descriptionHas(def, "end screen")) return "endScreen";
	if (descriptionHas(def, "multi-question")) return "multiQuestionPage";

	return undefined;
};
