"use client";

import Script from "next/script";
import { useId } from "react";

/**
 * Client component for third-party scripts that require unique IDs
 */
export default function ThirdPartyScripts() {
	const clarityScriptId = useId();
	const zohoInitScriptId = useId();
	const zohoMainScriptId = useId();

	return (
		<>
			{/* Microsoft Clarity */}
			<Script id={clarityScriptId} strategy="afterInteractive">{`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "REPLACE_ME");
        `}</Script>

			{/* Zoho SalesIQ Support Chat (bottom-right) */}
			<Script
				id={zohoInitScriptId}
				strategy="afterInteractive"
			>{`window.$zoho=window.$zoho||{};$zoho.salesiq=$zoho.salesiq||{ready:function(){}};`}</Script>
			<Script
				id={zohoMainScriptId}
				strategy="afterInteractive"
				src="https://salesiq.zoho.com/widget?wc=siq529bca77706436d0c99699a1417ac2691cd1efb7eb4b4e5c20cef923065ef066"
			/>
		</>
	);
}
