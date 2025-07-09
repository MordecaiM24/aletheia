export async function POST(request: Request) {
  const data = await request.formData();
  const filename = data.get("filename");
  const file = data.get("file");

  if (!file || !(file instanceof Blob)) {
    return new Response("no file", { status: 400 });
  }

  const text = await file.text();

  console.log(filename, text.slice(0, 100));

  return Response.json({ res: "nice." });
}
