import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import fs from "fs";

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

const text = `**Resolution 131**

**A RESOLUTION TO BE ENTITLED AN ACT TO PROVISION A JOINT PATH FORWARD FOR NC STATE UNIVERSITY IN A POST-DEI POLICY HIGHER EDUCATION SYSTEM**

**Short Title**: The NC State Forward Together Act

**Sponsors**: Senator Taquan Dewberry (Corresponding), Senator Bella Echiburu

**Secondary Sponsors**:

**Signatories:**

**Referred to**:

**First Reading**: February 19, 2025

**Second Reading**: March 19, 2025

**WHEREAS**, on May 23rd, 2024, the University of North Carolina (UNC) System’s Board of Governors issued a repeal and replacement of UNC Policy 300.8.5, changing the policy from Diversity and Inclusion within the University of North Carolina to Equality within the University of North Carolina; and,

**WHEREAS**, the UNC System’s Board of Governors issued a mandate for compliance reports concerning the new policy from each of the University’s constituent institutions by September of that year; and,

**WHEREAS**, this change in policy led to various changes across the system in efforts for universities to comply with the new policies; and,

**WHEREAS**, on January 22, 2025, a change in federal government policy surrounding DEI led to the removal of the US-DEI Requirement from degrees obtained at North Carolina State University, shifting credits and courses offered within this category to being optional; and,

**WHEREAS,** on February 20, 2025, Ronnie Chalmers, NC State’s Director of Recruitment and Strategic Initiatives, announced NC State would be ending pre-college mentorship programs geared towards marginalized high school students, including CAMINOS, Emerging Scholars Academy, and the Native Education Forum; and,

**WHEREAS,** on March 5, 2025, NC State confirmed the closure of Black Male Initiative and Native Space living and learning villages as a result of the current administration’s executive order and the Department of Education’s recent memo instructing all educational institutions to eliminate DEI programs; and,

**WHEREAS**, on March 11, 2025, the North Carolina Senate passed Senate Bill 227, eliminating DEI in public education grades K-12, concerning university students for the future of DEI in higher education; and,

**WHEREAS**, this shift generated great concern among the Student Body, Faculty, and Staff at North Carolina State University, even resulting in a student-led march, organized by the National Panhellenic Council, on February 12, 2025, expressing frustration regarding the change in academic policy; and,

**WHEREAS**, there have been continual closures and announcements of restrictions affecting not only students, but also Faculty and Staff at the University and across the UNC System; and,

**NOW, THEREFORE BE IT RESOLVED**, that the North Carolina State University Student Government hereby states that there are certain minimum standards that the NC State Student Body and we as representatives of the said body should be adhered to; and be it further

**RESOLVED**, that the NC State Student Government will commit to supporting students affected by DEI changes within the UNC System, whether it be spoken advocacy, legislation, or initiatives; and be it further

**RESOLVED**, that the NC State Student Government plans to work with Faculty Senate, Staff Senate, and GSA on developing a joint approach to protect diversity, equity, inclusion, and free speech on campus, emphasizing the concept of Shared Governance while doing so; and be it further

**RESOLVED**, the NC State Student Government 105th Session’s Standing Committee on Diversity, Equity, and Inclusion shall work closely with the aforementioned groups and other relevant university partners to implement the charges of this resolution; and be it further

**RESOLVED**, that the NC State Student Government hereby emphasizes and wholeheartedly promotes the concepts of Shared Governance, appreciating the relationships it holds with its partners and the various stakeholders on campus; and be it further

**RESOLVED**, that this resolution shall be the full, binding, and unequivocal stance of Student Government policy on the principles of Diversity, Equity, and Inclusion on campus and within the University of North Carolina System for the foreseeable future and until a subsequent resolution establishes a different one; and be it further

**RESOLVED**, that the NC State Student Government shall continue working to protect all student rights, providing assistance to students who feel affected by the changes related to Diversity, Equity, and Inclusion; and be it further

**RESOLVED,** a copy of this resolution shall be sent to Faculty Senate Chair Herle McGowan, Staff Senate Chair Charles Hall, GSA President, Faculty Senate Chair-elect Walt Robinson, Staff Senate Chair-elect Dr. Jameco McKenzie, Chancellor Randy Woodson, and Chancellor-elect Kevin Howell; and be if further

**RESOLVED**, this resolution shall be effective upon its enrollment.

**SOURCES:**

*   [**https://abc11.com/post/north-carolina-senate-signs-off-bill-would-ban-12-dei-instruction/16009622/**](https://abc11.com/post/north-carolina-senate-signs-off-bill-would-ban-12-dei-instruction/16009622/)
*   [**https://thenubianmessage.com/15143/news/nc-state-to-end-black-male-initiative-and-dei-related-living-and-learning-villages-after-spring-2025/**](https://thenubianmessage.com/15143/news/nc-state-to-end-black-male-initiative-and-dei-related-living-and-learning-villages-after-spring-2025/)
*   [**https://thenubianmessage.com/15150/news/nc-state-to-cut-pre-college-programs-for-minority-high-school-students-in-summer-2025-including-caminos/**](https://thenubianmessage.com/15150/news/nc-state-to-cut-pre-college-programs-for-minority-high-school-students-in-summer-2025-including-caminos/)
*   [**https://www.technicianonline.com/news/students-rally-against-dei-course-requirement-suspension/article\_2d922646-e9b7-11ef-9a54-a35cb1963b81.html**](https://www.technicianonline.com/news/students-rally-against-dei-course-requirement-suspension/article_2d922646-e9b7-11ef-9a54-a35cb1963b81.html)

[IMAGE_REMOVED] [IMAGE_REMOVED]`;

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

  console.log(chunksWithPositions.length);
  return chunksWithPositions;
}

fs.writeFileSync(
  "output.json",
  JSON.stringify(await getChunksWithPositions(text), null, 2),
);
