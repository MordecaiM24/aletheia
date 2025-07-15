import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export type ChunksWithPositions = {
  content: string;
  startChar: number;
  endChar: number;
  chunkIndex: number;
};

const legalDelimiters = [
  "# ", // markdown headers
  "## ",
  "### ",
  "SECTION ", // common legal section markers
  "Article ",
  "Clause ",
  "WHEREAS ", // legislative clauses
  "ENACTED ",
  "RESOLVED ",
  "a) ", // subsection markers
  "b) ",
  "1) ", // numbered lists
  "2) ",
  "3) ",
  "4) ",
  "5) ",
  "6) ",
  "7) ",
  "8) ",
  "9) ",
  "\n\n", // paragraph breaks
  "\n",
  ". ", // sentence breaks (last resort)
  " ",
];

export async function getChunksWithPositions(
  text: string,
): Promise<ChunksWithPositions[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
    separators: legalDelimiters,
  });
  const docOutput = await splitter.splitText(text);

  let searchStart = 0;
  const chunksWithPositions = docOutput.map((chunk, index) => {
    const startChar = text.indexOf(chunk, searchStart);
    const endChar = startChar + chunk.length;
    searchStart = endChar - 50; //

    return { content: chunk, startChar, endChar, chunkIndex: index };
  });

  return chunksWithPositions;
}
