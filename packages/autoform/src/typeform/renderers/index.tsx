import React from "react";

import type { TypeformQuestionType } from "../types";
import type { TypeformRendererProps, TypeformRendererMap } from "./shared";
import { contactRenderers } from "./contact";
import { basicChoiceRenderers } from "./choice-basic";
import { advancedChoiceRenderers } from "./choice-advanced";
import { scaleRenderers } from "./scale";
import { textRenderers } from "./text";
import { otherRenderers } from "./other";

const registry: TypeformRendererMap = {
	...contactRenderers,
	...basicChoiceRenderers,
	...advancedChoiceRenderers,
	...scaleRenderers,
	...textRenderers,
	...otherRenderers,
};

export const renderTypeformField = (
	props: TypeformRendererProps & { questionType?: TypeformQuestionType },
): React.ReactNode | undefined => {
	if (!props.questionType) return undefined;
	const renderer = registry[props.questionType];
	if (!renderer) return undefined;
	return renderer(props);
};
