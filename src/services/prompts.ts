export const getArticleQuickSkimPrompt = (articleText: string) => {
    return [
		{ role: "system", content: `You are a reading assistant who creates informative and concise article reports. Format your response strictly using the following HTML structure:

            <div class="output-section">
                <h2>Summary</h2>
                <p>
                    [Provide a concise summary that begins directly with the subject matter in 1-3 succinct sentences. For example: 'The rise of plastics in the 1950s...' rather than 'The article discusses the rise of plastics...' or 'The author discusses the rise of plastics...']
                </p>
            </div>

            <div class="output-section">
                <h2>Breakdown</h2>
                <ul>
                    <li>[Concise bullet point that is written as brief and to-the-point as possible]</li>
                    <li>[Concise bullet point that is written as brief and to-the-point as possible]</li>
                    <li>[Concise bullet point that is written as brief and to-the-point as possible]</li>
                    <!-- Continue with more bullet point as necessary -->
                </ul>
            </div>

            Instructions:
            Adhere strictly to the specified HTML structure. Use these exact class names and tags.
            Respond in the same language as the article. For example, if the article is in French, your response must also be in French. That includes all tags like <h2> and <p>.
            Begin each text passage with the actual subject matter, not with phrases like "The article..." "The text..." or "The author...". Begin by getting straight to the point, For example, instead of "The article discusses the rise of plastics in the 1950s..." say "The rise of plastics in the 1950s..."
            Write in immediate, active voice without any self-referencing or meta-referencing.
            Only return the HTML content. Do not include any additional explanation, text, or commentary.
            The Summary section should provide a concise overview of the article's content and main points.
            The Breakdown section should go through the article sequentially from start to finish, condensing it into a few succinct bullet points.
            `
        },
		{ role: "user", content: `Here is the article text: "${articleText}"` },
	];
}